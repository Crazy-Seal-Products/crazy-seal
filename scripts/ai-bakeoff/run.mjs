// Runs every candidate model on every case and records answers, timing,
// tokens and cost to results/<timestamp>/raw.jsonl.
//
//   node run.mjs                      paid run, all candidates, all cases
//   node run.mjs --mock               free dry run, no API calls
//   node run.mjs --repeat 3           3 runs per case per model (for latency medians)
//   node run.mjs --only haiku-5.5@low,gpt-6-luna@low --cases c01,t01
//   node run.mjs --concurrency 1      one call at a time (cleanest latency)
//   node run.mjs --context retrieve   keyword-retrieved passages instead of the whole site

import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { CANDIDATES, CONCURRENCY, CONTEXT_MODE, PRICES, RETRIEVE_TOP_K, SYSTEM_PROMPTS } from './config.mjs'
import { argValue, buildIndex, costUsd, fullReference, hasFlag, HERE, loadEnv, readJson, requireKeys, retrieve } from './lib.mjs'
import { ask, KEY_FOR_PROVIDER } from './providers.mjs'
import { runTool, TOOLS } from './tools.mjs'

const MOCK = hasFlag('--mock')
const REPEAT = Number(argValue('--repeat') ?? 1)
const only = argValue('--only')?.split(',')
const caseFilter = argValue('--cases')?.split(',')
const CONTEXT = argValue('--context') ?? CONTEXT_MODE
if (!['full', 'retrieve'].includes(CONTEXT)) throw new Error('--context must be full or retrieve')

const kb = readJson('kb.json')
const { cases: allCases } = readJson('questions.json')
const index = buildIndex(kb.chunks)

const cases = caseFilter ? allCases.filter((c) => caseFilter.includes(c.id)) : allCases
let candidates = only ? CANDIDATES.filter((c) => only.includes(c.id)) : CANDIDATES
if (MOCK) candidates = candidates.map((c) => ({ ...c, provider: 'mock', model: 'mock', mockOf: c.model }))
if (!candidates.length || !cases.length) throw new Error('Nothing to run: check --only / --cases')

if (!MOCK) {
  loadEnv()
  requireKeys([...new Set(candidates.map((c) => KEY_FOR_PROVIDER[c.provider]))])
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const outDir = new URL(`results/${stamp}${MOCK ? '-mock' : ''}/`, HERE)
mkdirSync(outDir, { recursive: true })
const rawFile = new URL('raw.jsonl', outDir)
writeFileSync(rawFile, '')
writeFileSync(new URL('meta.json', outDir), JSON.stringify({
  startedAt: new Date().toISOString(), mock: MOCK, repeat: REPEAT, kbBuiltAt: kb.builtAt,
  candidates, caseCount: cases.length, context: CONTEXT, retrieveTopK: CONTEXT === 'retrieve' ? RETRIEVE_TOP_K : null,
}, null, 2))

// full: the whole site sits in the system prompt, identical on every call, so
// all three vendors serve it from cache after the first request.
const FULL_REFERENCE = fullReference(kb)
const systemFor = (audience) => CONTEXT === 'full'
  ? `${SYSTEM_PROMPTS[audience]}\n\n# Crazy Seal reference\n\n${FULL_REFERENCE}`
  : SYSTEM_PROMPTS[audience]

function userTextFor(question, chunks) {
  if (CONTEXT === 'full') return question
  const reference = chunks.map((c, i) => `[${i + 1}] ${c.title} (${c.url})\n${c.text}`).join('\n\n')
  return `Crazy Seal reference:\n\n${reference || '(no matching passages)'}\n\n---\nQuestion: ${question}`
}

const norm = (v) => String(v ?? '').toLowerCase().replace(/[^a-z0-9@.]/g, '')

// Did the model call the expected tool with the expected arguments?
function checkTools(testCase, toolCalls) {
  if (testCase.tool) {
    const hit = toolCalls.find((call) => call.name === testCase.tool.name &&
      Object.entries(testCase.tool.args).every(([key, value]) => norm(call.args?.[key]) === norm(value)))
    return { expected: testCase.tool.name, calledExpected: Boolean(hit), calls: toolCalls.length }
  }
  // A dealer question with no record to look up: any lookup is a wrong turn.
  if (testCase.audience === 'dealer' && testCase.kind === 'decline') return { expected: null, calledNone: toolCalls.length === 0, calls: toolCalls.length }
  return null
}

const jobs = []
for (const testCase of cases) {
  const chunks = CONTEXT === 'retrieve' ? retrieve(index, testCase.question, RETRIEVE_TOP_K) : []
  for (const candidate of candidates) for (let r = 1; r <= REPEAT; r++) jobs.push({ testCase, candidate, chunks, r })
}

let done = 0
async function runJob({ testCase, candidate, chunks, r }) {
  const base = {
    caseId: testCase.id, audience: testCase.audience, kind: testCase.kind, repeat: r,
    candidateId: candidate.id, provider: candidate.provider, model: candidate.model, effort: candidate.effort,
    retrieved: chunks.map((c) => c.id),
  }
  try {
    const out = await ask({
      candidate,
      system: systemFor(testCase.audience),
      userText: userTextFor(testCase.question, chunks),
      tools: testCase.audience === 'dealer' ? TOOLS : undefined,
      runTool: async (name, args) => runTool(name, args),
      mockHint: testCase.tool ? { tool: testCase.tool.name, args: testCase.tool.args } : undefined,
    })
    const price = PRICES[candidate.mockOf ?? candidate.model]
    appendFileSync(rawFile, JSON.stringify({
      ...base, ...out, costUsd: costUsd(price, out.usage), toolCheck: checkTools(testCase, out.toolCalls),
    }) + '\n')
  } catch (err) {
    appendFileSync(rawFile, JSON.stringify({ ...base, error: `${err.name}: ${err.message}`.slice(0, 500) }) + '\n')
    console.error(`\n${candidate.id} ${testCase.id}: ${err.message}`)
  }
  done++
  process.stdout.write(`\r${done}/${jobs.length}`)
}

// Small worker pool. Keeps one model's calls from all landing at once.
const queue = [...jobs]
await Promise.all(Array.from({ length: Number(argValue('--concurrency') ?? CONCURRENCY) }, async () => {
  while (queue.length) await runJob(queue.shift())
}))

const runName = `results/${stamp}${MOCK ? '-mock' : ''}`
console.log(`\nWrote ${runName}/raw.jsonl`)
console.log(`Next: node judge.mjs ${runName}${MOCK ? ' --mock' : ''}`)

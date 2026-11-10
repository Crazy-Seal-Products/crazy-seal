// Grades every answer in a results folder with two judges from different
// vendors. Judges never see which model wrote the answer.
//
//   node judge.mjs results/<run>            paid
//   node judge.mjs results/<run> --mock     free dry run
//   node judge.mjs results/<run> --judges judge-opus-5.5   one judge only

import { readdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { CONCURRENCY, JUDGES, PRICES } from './config.mjs'
import { argValue, costUsd, fullReference, hasFlag, HERE, loadEnv, readJson, readJsonl, requireKeys } from './lib.mjs'
import { ask, KEY_FOR_PROVIDER } from './providers.mjs'
import { runTool } from './tools.mjs'

const MOCK = hasFlag('--mock')

function resolveRunDir() {
  const given = process.argv.slice(2).find((a) => !a.startsWith('--') && a !== argValue('--judges'))
  if (given) return pathToFileURL(given.replace(/[\\/]?$/, '/'))
  const runs = readdirSync(new URL('results/', HERE)).sort()
  if (!runs.length) throw new Error('No results yet: run node run.mjs first')
  return new URL(`results/${runs.at(-1)}/`, HERE)
}

const runDir = resolveRunDir()
const rows = readJsonl(new URL('raw.jsonl', runDir)).filter((r) => r.repeat === 1)
const { cases } = readJson('questions.json')
const caseById = new Map(cases.map((c) => [c.id, c]))
const kb = readJson('kb.json')

const pick = argValue('--judges')?.split(',')
let judges = pick ? JUDGES.filter((j) => pick.includes(j.id)) : JUDGES
if (MOCK) judges = judges.map((j) => ({ ...j, provider: 'mock', model: 'mock', mockOf: j.model }))
if (!MOCK) {
  loadEnv()
  requireKeys([...new Set(judges.map((j) => KEY_FOR_PROVIDER[j.provider]))])
}

const JUDGE_SYSTEM = `You grade answers from a company's AI assistant against a reference. You are strict and consistent.

Below these instructions is the company's full reference (its public website). Each message then gives you: the user's question, the expected behavior, the key facts a good answer contains, things the answer must not do, and the assistant's answer (with any tool calls it made and what they returned).

Expected behavior:
- "answer": the answer should state the key facts correctly. Extra true detail from the reference is fine.
- "decline": the answer should say it doesn't have the information (or won't do the thing) and point the user somewhere useful, as the key facts describe. Inventing the missing information is wrong.
- "tool": the assistant should have called the right lookup and reported what it returned.

Verdict:
- "correct": all key facts present (wording can differ) and no must-not violated.
- "partial": the main point is right but a key fact is missing or vague, and no must-not violated.
- "wrong": the main point is wrong or missing, or any must-not is violated.

hallucination = true if the answer states any specific fact (number, price, date, policy, spec, record detail) that is not supported by the reference, the tool results, or the key facts.
followed_instructions = false if the answer is far longer than needed, rude, off-topic, or disparages a competitor.

Reply with only a JSON object, no other text:
{"verdict": "correct" | "partial" | "wrong", "hallucination": true | false, "followed_instructions": true | false, "reason": "<one short sentence>"}

# Company reference

${fullReference(kb)}`

function casePackage(testCase) {
  return [
    `QUESTION:\n${testCase.question}`,
    `EXPECTED BEHAVIOR: ${testCase.kind}`,
    testCase.tool && `EXPECTED TOOL CALL: ${testCase.tool.name} ${JSON.stringify(testCase.tool.args)}`,
    `KEY FACTS:\n${testCase.keyFacts.map((f) => `- ${f}`).join('\n')}`,
    testCase.mustNot?.length && `MUST NOT:\n${testCase.mustNot.map((f) => `- ${f}`).join('\n')}`,
  ].filter(Boolean).join('\n\n')
}

function answerPackage(row) {
  const calls = (row.toolCalls ?? []).map((call) =>
    `- ${call.name}(${JSON.stringify(call.args)}) returned ${JSON.stringify(runTool(call.name, call.args))}`)
  return [
    calls.length ? `TOOL CALLS MADE:\n${calls.join('\n')}` : 'TOOL CALLS MADE: none',
    `ASSISTANT'S ANSWER:\n${row.text?.trim() || '(empty)'}`,
    'Grade it. JSON only.',
  ].join('\n\n')
}

function parseVerdict(text) {
  const match = text?.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const v = JSON.parse(match[0])
    if (!['correct', 'partial', 'wrong'].includes(v.verdict)) return null
    return { verdict: v.verdict, hallucination: Boolean(v.hallucination), followedInstructions: v.followed_instructions !== false, reason: String(v.reason ?? '') }
  } catch {
    return null
  }
}

// The judge system prompt (instructions + whole site) is identical on every
// call, so each judge reads it from cache after the first request.
async function grade(judge, testCase, row) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const out = await ask({
      candidate: judge, system: JUDGE_SYSTEM,
      userText: `${casePackage(testCase)}\n\n${answerPackage(row)}${attempt > 1 ? '\nReturn ONLY the JSON object.' : ''}`,
      mockHint: { judge: true },
    })
    const parsed = parseVerdict(out.text)
    const cost = costUsd(PRICES[judge.mockOf ?? judge.model], out.usage)
    if (parsed) return { ...parsed, costUsd: cost }
    if (attempt === 2) return { error: `unparseable judge output: ${String(out.text).slice(0, 200)}`, costUsd: cost }
  }
}

// Answers that errored out are graded "wrong" without spending judge calls.
const graded = []
const byCase = new Map()
for (const row of rows) {
  if (!byCase.has(row.caseId)) byCase.set(row.caseId, [])
  byCase.get(row.caseId).push(row)
}

// Cases run in parallel; a case's answers are graded one after another.
const work = [...byCase.entries()]
let done = 0
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (work.length) {
    const [caseId, caseRows] = work.shift()
    const testCase = caseById.get(caseId)
    for (const row of caseRows) {
      const grades = {}
      for (const judge of judges) {
        if (row.error) { grades[judge.id] = { verdict: 'wrong', hallucination: false, followedInstructions: false, reason: `run error: ${row.error}` }; continue }
        try {
          grades[judge.id] = await grade(judge, testCase, row)
        } catch (err) {
          grades[judge.id] = { error: `${err.name}: ${err.message}`.slice(0, 300) }
        }
      }
      graded.push({ caseId, candidateId: row.candidateId, grades })
    }
    process.stdout.write(`\r${++done}/${byCase.size} cases`)
  }
}))

writeFileSync(new URL('grades.json', runDir), JSON.stringify({ judges: judges.map((j) => j.id), mock: MOCK, graded }, null, 2))
console.log('\nWrote grades.json. Next: node report.mjs <same results folder>')

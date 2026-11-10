// One `ask` function per vendor, all with the same shape:
//
//   ask({ candidate, system, userText, tools, runTool }) ->
//     { text, ttftMs, totalMs, usage: { inputTokens, cachedTokens, outputTokens },
//       toolCalls: [{ name, args }], stopReason }
//
// ttftMs is the time until the first token of visible answer text (thinking
// tokens don't count: a customer sees nothing until the answer starts).
// For tool cases it covers every model turn and tool call before that text.
// `tools` is a list of { name, description, parameters (JSON Schema) }.
// `runTool(name, args)` returns the tool's result as a JSON-serializable value.

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import { MAX_OUTPUT_TOKENS, MAX_TOOL_TURNS } from './config.mjs'

const clients = {}
const client = (name, make) => (clients[name] ??= make())

function timer() {
  const start = performance.now()
  let first = null
  return {
    markText: () => { first ??= performance.now() - start },
    result: () => ({ ttftMs: first === null ? null : Math.round(first), totalMs: Math.round(performance.now() - start) }),
  }
}

const emptyUsage = () => ({ inputTokens: 0, cachedTokens: 0, outputTokens: 0 })

// ---------------------------------------------------------------- Anthropic

async function askAnthropic({ candidate, system, userText, tools, runTool }) {
  const anthropic = client('anthropic', () => new Anthropic())
  const t = timer()
  const usage = emptyUsage()
  const toolCalls = []
  const messages = [{ role: 'user', content: userText }]
  let text = ''
  let stopReason = null

  for (let turn = 0; turn <= MAX_TOOL_TURNS; turn++) {
    const stream = anthropic.messages.stream({
      model: candidate.model,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages,
      ...(tools?.length && {
        tools: tools.map((tool) => ({ name: tool.name, description: tool.description, input_schema: tool.parameters })),
      }),
      ...(candidate.effort && { output_config: { effort: candidate.effort } }),
    })
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta' && event.delta.text) t.markText()
    }
    const message = await stream.finalMessage()
    const u = message.usage
    usage.inputTokens += u.input_tokens + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0)
    usage.cachedTokens += u.cache_read_input_tokens ?? 0
    usage.outputTokens += u.output_tokens
    stopReason = message.stop_reason
    text += message.content.filter((b) => b.type === 'text').map((b) => b.text).join('')

    const uses = message.content.filter((b) => b.type === 'tool_use')
    if (stopReason !== 'tool_use' || uses.length === 0) break

    messages.push({ role: 'assistant', content: message.content })
    const results = []
    for (const use of uses) {
      toolCalls.push({ name: use.name, args: use.input })
      results.push({ type: 'tool_result', tool_use_id: use.id, content: JSON.stringify(await runTool(use.name, use.input)) })
    }
    messages.push({ role: 'user', content: results })
  }
  return { text, ...t.result(), usage, toolCalls, stopReason }
}

// ---------------------------------------------------------------- OpenAI

async function askOpenAI({ candidate, system, userText, tools, runTool }) {
  const openai = client('openai', () => new OpenAI())
  const t = timer()
  const usage = emptyUsage()
  const toolCalls = []
  let input = userText
  let previousResponseId
  let text = ''
  let stopReason = null

  for (let turn = 0; turn <= MAX_TOOL_TURNS; turn++) {
    const stream = await openai.responses.create({
      model: candidate.model,
      instructions: system,
      input,
      max_output_tokens: MAX_OUTPUT_TOKENS,
      stream: true,
      ...(previousResponseId && { previous_response_id: previousResponseId }),
      ...(candidate.effort && { reasoning: { effort: candidate.effort } }),
      ...(tools?.length && {
        tools: tools.map((tool) => ({
          type: 'function', name: tool.name, description: tool.description, parameters: tool.parameters, strict: false,
        })),
      }),
    })
    let response = null
    for await (const event of stream) {
      if (event.type === 'response.output_text.delta' && event.delta) t.markText()
      if (event.type === 'response.completed' || event.type === 'response.incomplete' || event.type === 'response.failed') {
        response = event.response
      }
    }
    if (!response) throw new Error('OpenAI stream ended without a final response')
    usage.inputTokens += response.usage?.input_tokens ?? 0
    usage.cachedTokens += response.usage?.input_tokens_details?.cached_tokens ?? 0
    usage.outputTokens += response.usage?.output_tokens ?? 0
    stopReason = response.status === 'incomplete' ? `incomplete:${response.incomplete_details?.reason}` : response.status

    for (const item of response.output) {
      if (item.type !== 'message') continue
      for (const part of item.content) {
        if (part.type === 'output_text') text += part.text
        if (part.type === 'refusal') { text += part.refusal; stopReason = 'refusal' }
      }
    }

    const calls = response.output.filter((item) => item.type === 'function_call')
    if (calls.length === 0) break
    input = []
    for (const call of calls) {
      let args = {}
      try { args = JSON.parse(call.arguments || '{}') } catch { args = { _unparseable: call.arguments } }
      toolCalls.push({ name: call.name, args })
      input.push({ type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(await runTool(call.name, args)) })
    }
    previousResponseId = response.id
  }
  return { text, ...t.result(), usage, toolCalls, stopReason }
}

// ---------------------------------------------------------------- Gemini

const GEMINI_LEVELS = { minimal: ThinkingLevel.MINIMAL, low: ThinkingLevel.LOW, medium: ThinkingLevel.MEDIUM, high: ThinkingLevel.HIGH }

async function askGemini({ candidate, system, userText, tools, runTool }) {
  const ai = client('gemini', () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }))
  const t = timer()
  const usage = emptyUsage()
  const toolCalls = []
  const contents = [{ role: 'user', parts: [{ text: userText }] }]
  let text = ''
  let stopReason = null

  for (let turn = 0; turn <= MAX_TOOL_TURNS; turn++) {
    const stream = await ai.models.generateContentStream({
      model: candidate.model,
      contents,
      config: {
        systemInstruction: system,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        ...(candidate.effort && { thinkingConfig: { thinkingLevel: GEMINI_LEVELS[candidate.effort] } }),
        ...(tools?.length && {
          tools: [{
            functionDeclarations: tools.map((tool) => ({
              name: tool.name, description: tool.description, parametersJsonSchema: tool.parameters,
            })),
          }],
        }),
      },
    })
    // Keep every part in order (thought signatures included): the model needs
    // them back on the next turn of a tool loop.
    const parts = []
    let meta = null
    for await (const chunk of stream) {
      const candidateOut = chunk.candidates?.[0]
      for (const part of candidateOut?.content?.parts ?? []) {
        parts.push(part)
        if (part.text && !part.thought) { t.markText(); text += part.text }
      }
      if (candidateOut?.finishReason) stopReason = candidateOut.finishReason
      if (chunk.usageMetadata) meta = chunk.usageMetadata
    }
    usage.inputTokens += meta?.promptTokenCount ?? 0
    usage.cachedTokens += meta?.cachedContentTokenCount ?? 0
    usage.outputTokens += (meta?.candidatesTokenCount ?? 0) + (meta?.thoughtsTokenCount ?? 0)

    const calls = parts.filter((part) => part.functionCall).map((part) => part.functionCall)
    if (calls.length === 0) break
    contents.push({ role: 'model', parts })
    const responses = []
    for (const call of calls) {
      toolCalls.push({ name: call.name, args: call.args ?? {} })
      const result = await runTool(call.name, call.args ?? {})
      responses.push({ functionResponse: { id: call.id, name: call.name, response: { result } } })
    }
    contents.push({ role: 'user', parts: responses })
  }
  return { text, ...t.result(), usage, toolCalls, stopReason }
}

// ---------------------------------------------------------------- Mock
// No network. Lets the whole pipeline run for free: it "answers" with the
// first sentences of the retrieved context and calls the expected tool.

async function askMock({ userText, tools, runTool, mockHint }) {
  const t = timer()
  const toolCalls = []
  await sleep(20 + Math.random() * 60)
  let text = ''
  if (tools?.length && mockHint?.tool) {
    toolCalls.push({ name: mockHint.tool, args: mockHint.args ?? {} })
    const result = await runTool(mockHint.tool, mockHint.args ?? {})
    text = `Lookup result: ${JSON.stringify(result).slice(0, 300)}`
  } else if (mockHint?.judge) {
    const n = userText.length
    text = JSON.stringify({
      verdict: ['correct', 'partial', 'wrong'][n % 3], hallucination: n % 7 === 0, followed_instructions: true, reason: 'mock judge',
    })
  } else {
    const passage = userText.split('\n').find((line) => line.length > 80) ?? "I don't have that information."
    text = passage.split(/(?<=\.)\s/).slice(0, 2).join(' ')
  }
  t.markText()
  await sleep(10 + Math.random() * 40)
  return {
    text, ...t.result(), toolCalls, stopReason: 'end_turn',
    usage: { inputTokens: Math.round(userText.length / 4), cachedTokens: 0, outputTokens: Math.round(text.length / 4) },
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const PROVIDERS = { anthropic: askAnthropic, openai: askOpenAI, gemini: askGemini, mock: askMock }

export const KEY_FOR_PROVIDER = { anthropic: 'ANTHROPIC_API_KEY', openai: 'OPENAI_API_KEY', gemini: 'GEMINI_API_KEY' }

export async function ask(args) {
  const fn = PROVIDERS[args.candidate.provider]
  if (!fn) throw new Error(`Unknown provider ${args.candidate.provider}`)
  return fn(args)
}

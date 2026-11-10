import Anthropic from '@anthropic-ai/sdk'
import type {
  BetaContentBlock,
  BetaMessageParam,
  BetaTool,
  BetaToolResultBlockParam,
} from '@anthropic-ai/sdk/resources/beta/messages/messages'
import OpenAI from 'openai'
import type { DecisionCreateParams } from 'openai/resources/decisions'
import type { ResponseInput, Response as OpenAIResponse, FunctionTool } from 'openai/resources/responses/responses'
import { getVercelOidcToken } from '@vercel/oidc'
import { openaiRoute, providerFor, type Effort, type Usage } from './config'

/**
 * One way to run a chat turn on either provider: streams text as it arrives,
 * runs the assistant's lookups (tools) in a loop, and reports timing and
 * token use. Everything above this file is provider-neutral.
 */

export interface ChatTool {
  name: string
  description: string
  parameters: { type: 'object'; properties: Record<string, unknown>; required?: string[] }
  /** Returns text for the model. Throwing marks the call as failed (the model is told). */
  run: (input: Record<string, unknown>) => Promise<string>
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ToolCallLog {
  name: string
  input: Record<string, unknown>
  ok: boolean
}

export interface RunChatOptions {
  model: string
  effort: Effort
  system: string
  history: ChatTurn[]
  tools?: ChatTool[]
  maxTokens: number
  /** Groups requests for OpenAI's prompt cache (e.g. the assistant name). */
  cacheKey?: string
  onText?: (delta: string) => void
  onTool?: (name: string) => void
}

export interface RunChatResult {
  text: string
  toolCalls: ToolCallLog[]
  usage: Usage
  /** Model that actually answered (differs if a fallback ran). */
  model: string
  ttftMs: number | null
  totalMs: number
  stop: 'end' | 'refusal' | 'max_tokens'
}

export class AiNotConfiguredError extends Error {}

const MAX_TOOL_ROUNDS = 5

let anthropicClient: Anthropic | null = null
let directOpenAI: OpenAI | null = null

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1'

function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new AiNotConfiguredError('ANTHROPIC_API_KEY is not set')
  anthropicClient ??= new Anthropic({ timeout: 90_000, maxRetries: 1 })
  return anthropicClient
}

/**
 * An OpenAI client for this request. With an OPENAI_API_KEY it talks to
 * OpenAI directly. Otherwise it goes through Crazy Seal's Vercel AI Gateway,
 * signed in with an AI_GATEWAY_API_KEY if set, or else the project's Vercel
 * OIDC token. On Vercel that token comes with each request and changes, so
 * it's fetched every time rather than cached.
 */
async function openai(): Promise<OpenAI> {
  if (openaiRoute() === 'direct') {
    directOpenAI ??= new OpenAI({ timeout: 90_000, maxRetries: 1 })
    return directOpenAI
  }
  let apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey) {
    try {
      apiKey = await getVercelOidcToken()
    } catch (err) {
      throw new AiNotConfiguredError(
        `No Vercel OIDC token for the AI Gateway (locally, run \`vercel env pull\` or set AI_GATEWAY_API_KEY): ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }
  return new OpenAI({ apiKey, baseURL: GATEWAY_URL, timeout: 90_000, maxRetries: 1 })
}

/** The model id to send: the gateway wants `openai/…`, OpenAI itself the bare id. */
function openaiModel(model: string): string {
  const bare = model.replace(/^openai\//, '')
  return openaiRoute() === 'gateway' ? `openai/${bare}` : bare
}

export function runChat(opts: RunChatOptions): Promise<RunChatResult> {
  return providerFor(opts.model) === 'openai' ? runOpenAI(opts) : runAnthropic(opts)
}

async function runTool(tools: ChatTool[], name: string, input: Record<string, unknown>): Promise<{ text: string; ok: boolean }> {
  const tool = tools.find((t) => t.name === name)
  if (!tool) return { text: `Unknown tool: ${name}`, ok: false }
  try {
    return { text: await tool.run(input), ok: true }
  } catch (err) {
    return { text: `The lookup failed: ${err instanceof Error ? err.message : String(err)}`, ok: false }
  }
}

function emptyUsage(): Usage {
  return { input: 0, cached: 0, cacheWrite: 0, output: 0 }
}

// ─── Anthropic ───────────────────────────────────────────────────────────

/** Models that accept server-side refusal fallbacks (a declined request is retried on another model). */
function supportsFallback(model: string): boolean {
  return /^claude-(sonnet-5-5|opus-5-5|opus-5|fable-5)/.test(model)
}

async function runAnthropic(opts: RunChatOptions): Promise<RunChatResult> {
  const client = anthropic()
  const tools = opts.tools ?? []
  const started = Date.now()
  let ttft: number | null = null
  let text = ''
  let served = opts.model
  const usage = emptyUsage()
  const toolCalls: ToolCallLog[] = []
  const messages: BetaMessageParam[] = opts.history.map((t) => ({ role: t.role, content: t.content }))
  const toolDefs: BetaTool[] = tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
    eager_input_streaming: true,
  }))

  for (let round = 0; ; round++) {
    const stream = client.beta.messages.stream({
      model: opts.model,
      max_tokens: opts.maxTokens,
      system: [{ type: 'text', text: opts.system, cache_control: { type: 'ephemeral' } }],
      messages,
      ...(toolDefs.length ? { tools: toolDefs } : {}),
      output_config: { effort: opts.effort },
      ...(supportsFallback(opts.model) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        ttft ??= Date.now() - started
        text += event.delta.text
        opts.onText?.(event.delta.text)
      }
    }
    const message = await stream.finalMessage()
    served = message.model
    usage.input += message.usage.input_tokens + (message.usage.cache_read_input_tokens ?? 0) + (message.usage.cache_creation_input_tokens ?? 0)
    usage.cached += message.usage.cache_read_input_tokens ?? 0
    usage.cacheWrite += message.usage.cache_creation_input_tokens ?? 0
    usage.output += message.usage.output_tokens

    if (message.stop_reason === 'refusal') return done('refusal')
    const uses = message.content.filter((b): b is Extract<BetaContentBlock, { type: 'tool_use' }> => b.type === 'tool_use')
    if (message.stop_reason === 'max_tokens') return done('max_tokens')
    if (message.stop_reason !== 'tool_use' || !uses.length) return done('end')
    if (round >= MAX_TOOL_ROUNDS) return done('end')

    messages.push({ role: 'assistant', content: message.content })
    const results: BetaToolResultBlockParam[] = []
    for (const use of uses) {
      const input = (use.input && typeof use.input === 'object' ? use.input : {}) as Record<string, unknown>
      opts.onTool?.(use.name)
      const r = await runTool(tools, use.name, input)
      toolCalls.push({ name: use.name, input, ok: r.ok })
      results.push({ type: 'tool_result', tool_use_id: use.id, content: r.text, ...(r.ok ? {} : { is_error: true }) })
    }
    // All results go back in one user message.
    messages.push({ role: 'user', content: results })
    if (text && !text.endsWith('\n')) {
      text += '\n\n'
      opts.onText?.('\n\n')
    }
  }

  function done(stop: RunChatResult['stop']): RunChatResult {
    return { text: text.trim(), toolCalls, usage, model: served, ttftMs: ttft, totalMs: Date.now() - started, stop }
  }
}

// ─── OpenAI (Responses API) ──────────────────────────────────────────────

async function runOpenAI(opts: RunChatOptions): Promise<RunChatResult> {
  const client = await openai()
  const tools = opts.tools ?? []
  const started = Date.now()
  let ttft: number | null = null
  let text = ''
  let served = opts.model
  const usage = emptyUsage()
  const toolCalls: ToolCallLog[] = []
  const toolDefs: FunctionTool[] = tools.map((t) => ({
    type: 'function',
    name: t.name,
    description: t.description,
    parameters: t.parameters,
    strict: false,
  }))

  let input: ResponseInput = opts.history.map((t) => ({ role: t.role, content: t.content }))
  let previous: string | undefined

  for (let round = 0; ; round++) {
    const stream = await client.responses.create({
      model: openaiModel(opts.model),
      instructions: opts.system,
      input,
      reasoning: { effort: opts.effort },
      max_output_tokens: opts.maxTokens,
      ...(toolDefs.length ? { tools: toolDefs } : {}),
      ...(previous ? { previous_response_id: previous } : {}),
      ...(opts.cacheKey ? { prompt_cache_key: opts.cacheKey } : {}),
      stream: true,
    })

    let final: OpenAIResponse | null = null
    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        ttft ??= Date.now() - started
        text += event.delta
        opts.onText?.(event.delta)
      } else if (event.type === 'response.completed' || event.type === 'response.incomplete') {
        final = event.response
      } else if (event.type === 'response.failed') {
        throw new Error(event.response.error?.message ?? 'OpenAI response failed')
      } else if (event.type === 'error') {
        throw new Error(event.message)
      }
    }
    if (!final) throw new Error('OpenAI stream ended without a response')
    served = final.model
    usage.input += final.usage?.input_tokens ?? 0
    usage.cached += final.usage?.input_tokens_details?.cached_tokens ?? 0
    usage.output += final.usage?.output_tokens ?? 0

    const refused = final.output.some((o) => o.type === 'message' && o.content.some((c) => c.type === 'refusal'))
    if (refused) return done('refusal')
    if (final.status === 'incomplete') return done('max_tokens')
    const calls = final.output.filter((o) => o.type === 'function_call')
    if (!calls.length || round >= MAX_TOOL_ROUNDS) return done('end')

    const outputs: ResponseInput = []
    for (const call of calls) {
      let parsed: Record<string, unknown> = {}
      try {
        parsed = JSON.parse(call.arguments || '{}') as Record<string, unknown>
      } catch {
        parsed = {}
      }
      opts.onTool?.(call.name)
      const r = await runTool(tools, call.name, parsed)
      toolCalls.push({ name: call.name, input: parsed, ok: r.ok })
      outputs.push({ type: 'function_call_output', call_id: call.call_id, output: r.text })
    }
    input = outputs
    previous = final.id
    if (text && !text.endsWith('\n')) {
      text += '\n\n'
      opts.onText?.('\n\n')
    }
  }

  function done(stop: RunChatResult['stop']): RunChatResult {
    return { text: text.trim(), toolCalls, usage, model: served, ttftMs: ttft, totalMs: Date.now() - started, stop }
  }
}

// ─── Structured JSON (the auto-screen) ───────────────────────────────────

export async function runJson<T>(opts: {
  model: string
  system: string
  prompt: string
  name: string
  schema: Record<string, unknown>
}): Promise<{ data: T; usage: Usage; model: string }> {
  if (providerFor(opts.model) === 'openai') {
    const res = await (await openai()).responses.create({
      model: openaiModel(opts.model),
      instructions: opts.system,
      input: opts.prompt,
      reasoning: { effort: 'low' },
      max_output_tokens: 1500,
      text: { format: { type: 'json_schema', name: opts.name, schema: opts.schema, strict: true } },
    })
    return {
      data: JSON.parse(res.output_text) as T,
      usage: {
        input: res.usage?.input_tokens ?? 0,
        cached: res.usage?.input_tokens_details?.cached_tokens ?? 0,
        cacheWrite: 0,
        output: res.usage?.output_tokens ?? 0,
      },
      model: res.model,
    }
  }

  const res = await anthropic().messages.create({
    model: opts.model,
    max_tokens: 1500,
    system: opts.system,
    messages: [{ role: 'user', content: opts.prompt }],
    output_config: { effort: 'low', format: { type: 'json_schema', schema: opts.schema } },
  })
  if (res.stop_reason === 'refusal') throw new Error('The screen model declined this transcript')
  const block = res.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') throw new Error('The screen model returned no text')
  return {
    data: JSON.parse(block.text) as T,
    usage: {
      input: res.usage.input_tokens + (res.usage.cache_read_input_tokens ?? 0),
      cached: res.usage.cache_read_input_tokens ?? 0,
      cacheWrite: res.usage.cache_creation_input_tokens ?? 0,
      output: res.usage.output_tokens,
    },
    model: res.model,
  }
}

// ─── Decisions (OpenAI's typed yes/no, choice and score answers) ─────────

export type DecisionQuestion = DecisionCreateParams['questions'][number] & { name: string }

export type DecisionAnswer =
  | { type: 'predicate'; probability: number }
  | { type: 'choice'; choice: string; confidence: number }
  | { type: 'score'; score: number; confidence: number }
  | { type: 'refusal' }

/**
 * Asks OpenAI's Decisions API a set of named questions about one input and
 * returns the answers by name. Only `gpt-6-luna` serves Decisions; through
 * the gateway it's called `openai/gpt-6-luna-decisions`.
 */
export async function runDecisions(opts: {
  input: string
  questions: DecisionQuestion[]
  cacheKey?: string
}): Promise<{ answers: Record<string, DecisionAnswer>; usage: Usage; model: string }> {
  const client = await openai()
  const res = await client.decisions.create({
    model: openaiRoute() === 'gateway' ? 'openai/gpt-6-luna-decisions' : 'gpt-6-luna',
    input: opts.input,
    questions: opts.questions,
    ...(opts.cacheKey ? { prompt_cache_key: opts.cacheKey } : {}),
  })
  const answers: Record<string, DecisionAnswer> = {}
  for (const a of res.answers) {
    if (!a.name) continue
    if (a.type === 'predicate') answers[a.name] = { type: 'predicate', probability: a.probability }
    else if (a.type === 'choice') answers[a.name] = { type: 'choice', choice: String(a.choice), confidence: a.confidence }
    else if (a.type === 'score') answers[a.name] = { type: 'score', score: a.score, confidence: a.confidence }
    else answers[a.name] = { type: 'refusal' }
  }
  return {
    answers,
    usage: {
      input: res.usage.input_tokens,
      cached: res.usage.input_tokens_details.cached_tokens,
      cacheWrite: res.usage.input_tokens_details.cache_write_tokens,
      output: 0,
    },
    model: res.model,
  }
}

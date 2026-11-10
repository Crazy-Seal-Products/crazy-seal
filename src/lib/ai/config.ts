/**
 * Settings for the Crazy Seal assistants. Models and effort can be changed
 * with env vars (no code change), e.g. after a bake-off:
 *
 *   AI_CUSTOMER_MODEL=gpt-6-luna      AI_CUSTOMER_EFFORT=low
 *   AI_DEALER_MODEL=gpt-6.1-terra     AI_DEALER_EFFORT=medium
 *   AI_STAFF_MODEL=gpt-6.1-terra      AI_STAFF_EFFORT=medium
 *   AI_SCREEN_MODEL=gpt-6-luna        (the auto-screen on customer chats; OpenAI models use the Decisions API)
 *
 * OpenAI models (`gpt-…`, `o…`, `openai/…`) go through Crazy Seal's Vercel
 * AI Gateway, signed in with the project's Vercel OIDC token, so no OpenAI
 * key is needed. An AI_GATEWAY_API_KEY is used instead when set (handy for
 * local dev), and an OPENAI_API_KEY sends requests straight to OpenAI.
 * Model ids starting with `claude-` go to Anthropic (ANTHROPIC_API_KEY).
 */

export type Assistant = 'customer' | 'dealer' | 'staff'
export type Effort = 'low' | 'medium' | 'high'

/** Bump when a system prompt changes, so reviews can tell answers apart. */
export const PROMPT_VERSION = '2026-11-09.1'

/** Dealers keep their most recent chats in the Support tab; older ones are deleted. */
export const DEALER_CHAT_LIMIT = 20

/** Share of customer chats sent to review at random, even when nothing looks wrong. */
export const REVIEW_SAMPLE_RATE = 0.03

/** Customer chats with no ticket are deleted after this many days. */
export const CUSTOMER_RETENTION_DAYS = 90

/** Longest message anyone can send, and turns per chat before it asks them to start over. */
export const MAX_USER_CHARS = 2000
export const MAX_TURNS = { customer: 30, dealer: 60, staff: 80 } as const

/** Knowledge chunks given to the model with each question. */
export const KNOWLEDGE_RESULTS = 6

interface AssistantSettings {
  model: string
  effort: Effort
  maxTokens: number
}

const DEFAULTS: Record<Assistant, AssistantSettings> = {
  customer: { model: 'gpt-6-luna', effort: 'low', maxTokens: 1500 },
  dealer: { model: 'gpt-6.1-terra', effort: 'medium', maxTokens: 3000 },
  staff: { model: 'gpt-6.1-terra', effort: 'medium', maxTokens: 3000 },
}

function effortFrom(value: string | undefined, fallback: Effort): Effort {
  return value === 'low' || value === 'medium' || value === 'high' ? value : fallback
}

export function assistantSettings(assistant: Assistant): AssistantSettings {
  const key = assistant.toUpperCase()
  const d = DEFAULTS[assistant]
  return {
    model: process.env[`AI_${key}_MODEL`]?.trim() || d.model,
    effort: effortFrom(process.env[`AI_${key}_EFFORT`]?.trim(), d.effort),
    maxTokens: d.maxTokens,
  }
}

export function screenModel(): string {
  return process.env.AI_SCREEN_MODEL?.trim() || 'gpt-6-luna'
}

export type Provider = 'anthropic' | 'openai'

export function providerFor(model: string): Provider {
  return /^(openai\/|gpt-|o\d)/.test(model) ? 'openai' : 'anthropic'
}

/** How OpenAI requests travel: straight to OpenAI when there's a key, otherwise through the Vercel AI Gateway. */
export function openaiRoute(): 'direct' | 'gateway' {
  return process.env.OPENAI_API_KEY ? 'direct' : 'gateway'
}

/**
 * Whether this model's provider can be reached. For the gateway that means a
 * gateway key, a pulled OIDC token (local dev), or running on Vercel, which
 * hands each request its own OIDC token.
 */
export function isConfigured(model: string): boolean {
  if (providerFor(model) === 'anthropic') return Boolean(process.env.ANTHROPIC_API_KEY)
  return Boolean(process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL)
}

/** List prices, USD per 1M tokens (checked 2026-11-09; the gateway charges the same). Used for the cost estimates in the admin. */
const PRICES: Record<string, { input: number; cached: number; output: number }> = {
  'claude-haiku-5-5': { input: 0.1, cached: 0.01, output: 0.5 },
  'claude-sonnet-5-5': { input: 2, cached: 0.1, output: 10 },
  'claude-sonnet-5': { input: 2, cached: 0.2, output: 10 },
  'claude-opus-5-5': { input: 4, cached: 0.2, output: 20 },
  'gpt-6-luna': { input: 0.1, cached: 0.01, output: 0.5 },
  'gpt-6.1-terra': { input: 1, cached: 0.05, output: 5 },
  'gpt-6.1-sol': { input: 2, cached: 0.1, output: 10 },
}

export interface Usage {
  /** All input tokens, cached ones included. */
  input: number
  /** Input tokens read from the prompt cache. */
  cached: number
  /** Input tokens written to the prompt cache (Anthropic bills these at 1.25x). */
  cacheWrite: number
  output: number
}

/** Prices for a model id as the API reports it, e.g. `openai/gpt-6-luna` or a dated `gpt-6-luna-2026-09-22`. */
function priceFor(model: string) {
  const bare = model.replace(/^[a-z]+\//, '')
  if (PRICES[bare]) return PRICES[bare]
  const key = Object.keys(PRICES)
    .filter((k) => bare.startsWith(`${k}-`))
    .sort((a, b) => b.length - a.length)[0]
  return key ? PRICES[key] : undefined
}

export function estimateCost(model: string, u: Usage): number | null {
  const p = priceFor(model)
  if (!p) return null
  const fresh = Math.max(0, u.input - u.cached - u.cacheWrite)
  return (fresh * p.input + u.cacheWrite * p.input * 1.25 + u.cached * p.cached + u.output * p.output) / 1_000_000
}

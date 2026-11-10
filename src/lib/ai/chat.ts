import { assistantSettings, estimateCost, isConfigured, MAX_TURNS, type Assistant } from './config'
import { formatKnowledge, searchKnowledge } from './knowledge'
import { SYSTEM_PROMPTS, withReference } from './prompts'
import { AiNotConfiguredError, runChat, type ChatTool } from './providers'
import { addMessage, getMessages, toHistory, userMessage, type Conversation } from './store'

/**
 * One chat turn for any assistant: saves the user's message, finds reference
 * material, streams the answer, then saves it with sources, lookups, timing,
 * tokens and cost. The response is newline-delimited JSON events:
 *
 *   { t: 'meta', conversationId, token? }   first, always
 *   { t: 'text', d }                          answer text as it arrives
 *   { t: 'tool', name }                       a lookup started
 *   { t: 'done', messageId }                  answer saved
 *   { t: 'error', message }                   the turn failed (shown to the person)
 */

export type ChatEvent =
  | { t: 'meta'; conversationId: string; token?: string }
  | { t: 'text'; d: string }
  | { t: 'tool'; name: string }
  | { t: 'done'; messageId: string | null }
  | { t: 'error'; message: string }

export const NOT_CONFIGURED_MESSAGE = 'The assistant isn’t switched on yet. Please try again later, or reach the team at (800) 963-0131.'
const FAILED_MESSAGE = 'Sorry, something went wrong on our side and I couldn’t answer that. Please try again in a moment.'
const REFUSAL_MESSAGE = 'Sorry, I can’t help with that one here. The Crazy Seal team can, at (800) 963-0131 or info@crazyseal.com.'

export function isAssistantConfigured(assistant: Assistant): boolean {
  return isConfigured(assistantSettings(assistant).model)
}

export function chatResponse(
  assistant: Assistant,
  conversation: Conversation,
  text: string,
  options: { tools?: ChatTool[]; token?: string; extraContext?: string } = {},
): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
      send({ t: 'meta', conversationId: conversation.id, ...(options.token ? { token: options.token } : {}) })
      try {
        await runTurn(assistant, conversation, text, options, send)
      } catch (err) {
        console.error(`[ai/${assistant}] turn failed`, err)
        send({ t: 'error', message: FAILED_MESSAGE })
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, {
    headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' },
  })
}

async function runTurn(
  assistant: Assistant,
  conversation: Conversation,
  text: string,
  options: { tools?: ChatTool[]; extraContext?: string },
  send: (event: ChatEvent) => void,
) {
  const settings = assistantSettings(assistant)
  const previous = await getMessages(conversation.id)
  if (previous.filter((m) => m.role === 'user').length >= MAX_TURNS[assistant]) {
    send({ t: 'error', message: 'This chat is getting long. Please start a new one so I can keep up.' })
    return
  }

  await addMessage(conversation.id, userMessage(text))

  if (!isConfigured(settings.model)) {
    await addMessage(conversation.id, { ...failed(settings.model, 'not configured') })
    send({ t: 'error', message: NOT_CONFIGURED_MESSAGE })
    return
  }

  // Search with the last question too, so a follow-up like "how long does
  // that take?" still finds the right pages.
  const lastQuestion = [...previous].reverse().find((m) => m.role === 'user')?.content ?? ''
  const hits = await searchKnowledge(`${text} ${lastQuestion}`.slice(0, 500), assistant !== 'customer')
  const history = toHistory(previous)
  history.push({ role: 'user', content: withReference(formatKnowledge(hits), text, options.extraContext) })

  try {
    const result = await runChat({
      model: settings.model,
      effort: settings.effort,
      system: SYSTEM_PROMPTS[assistant],
      history,
      tools: options.tools,
      maxTokens: settings.maxTokens,
      cacheKey: `crazyseal-${assistant}`,
      onText: (d) => send({ t: 'text', d }),
      onTool: (name) => send({ t: 'tool', name }),
    })

    const refused = result.stop === 'refusal'
    if (refused && !result.text) send({ t: 'text', d: REFUSAL_MESSAGE })
    const content = result.text || (refused ? REFUSAL_MESSAGE : '')
    const messageId = await addMessage(conversation.id, {
      role: 'assistant',
      content,
      sources: hits.map((h) => ({ title: h.title, url: h.url, source: h.source })),
      tool_calls: result.toolCalls.length ? result.toolCalls : null,
      model: result.model,
      ttft_ms: result.ttftMs,
      total_ms: result.totalMs,
      input_tokens: result.usage.input,
      cached_tokens: result.usage.cached,
      output_tokens: result.usage.output,
      cost_usd: estimateCost(result.model, result.usage) ?? estimateCost(settings.model, result.usage),
      error: refused ? 'refusal' : !content ? 'empty answer' : null,
    })
    send({ t: 'done', messageId })
  } catch (err) {
    const notConfigured = err instanceof AiNotConfiguredError
    await addMessage(conversation.id, failed(settings.model, err instanceof Error ? err.message.slice(0, 300) : String(err)))
    send({ t: 'error', message: notConfigured ? NOT_CONFIGURED_MESSAGE : FAILED_MESSAGE })
    if (!notConfigured) console.error(`[ai/${assistant}] provider error`, err)
  }
}

function failed(model: string, error: string) {
  return {
    role: 'assistant' as const,
    content: '',
    sources: null,
    tool_calls: null,
    model,
    ttft_ms: null,
    total_ms: null,
    input_tokens: null,
    cached_tokens: null,
    output_tokens: null,
    cost_usd: null,
    error,
  }
}

/** First line of the first message, as the chat's title. */
export function titleFrom(text: string): string {
  const line = text.split('\n').find((l) => l.trim())?.trim() ?? 'New chat'
  return line.length > 70 ? `${line.slice(0, 67)}…` : line
}

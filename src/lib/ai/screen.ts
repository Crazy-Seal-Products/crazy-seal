import { createAdminClient } from '@/lib/supabase/admin'
import { createTicket } from '@/lib/support/tickets'
import { isConfigured, providerFor, screenModel } from './config'
import { runDecisions, runJson, type DecisionQuestion } from './providers'
import { getConversation, getMessages, type StoredMessage } from './store'

/**
 * The auto-screen for customer chats. After each answer it decides whether
 * the chat is a normal inquiry (logged, not queued) or a support issue
 * (something went wrong, frustration, a problem with an order, product or
 * warranty), and files an "auto_flag" ticket for support issues. Chats picked
 * at random when they started also get a "review_sample" ticket, so answers
 * that looked fine still get checked.
 */

interface ScreenResult {
  kind: 'inquiry' | 'support_issue'
  reasons: string[]
  summary: string
  priority: 'low' | 'normal' | 'high'
  /** Decisions only: the model's probability that this is a support issue, kept for tuning the threshold. */
  probability?: number
}

const SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['inquiry', 'support_issue'] },
    reasons: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    priority: { type: 'string', enum: ['low', 'normal', 'high'] },
  },
  required: ['kind', 'reasons', 'summary', 'priority'],
  additionalProperties: false,
}

const SYSTEM = `You review chats between customers and the Crazy Seal website assistant (Crazy Seal sells DIY silicone roof coating systems).

Classify the chat:
- "inquiry": ordinary questions about products, installation, prices, shipping, becoming a dealer, and so on, where the assistant helped or there's no sign of a problem. Most chats are inquiries.
- "support_issue": something went wrong. Any of: the customer reports a problem with an order, delivery, product, leak, peeling or failure after install, a warranty claim, a refund or return; the customer says an answer is wrong, unhelpful or confusing, repeats themselves, or is frustrated; the customer asks for a human; the assistant failed, errored, refused, or couldn't answer something it should be able to.

reasons: short phrases naming what you saw, e.g. "order not delivered", "said answer was wrong", "assistant couldn't answer cure time". Empty for inquiries.
summary: one line a support person can act on (for inquiries, the topic).
priority: "high" for an active leak, damaged property, an angry customer or a safety issue; "low" for minor confusion; otherwise "normal".`

/** Phrases that mark a support issue even if the model is unavailable. */
const RULES: [RegExp, string][] = [
  [/\b(human|real person|representative|agent|talk to (someone|a person))\b/i, 'asked for a person'],
  [/\b(refund|return|damaged|broken|missing|never (arrived|received)|didn'?t (arrive|receive)|wrong (item|order))\b/i, 'order problem'],
  [/\b(leak(s|ing)?|peel(ing)?|fail(ed|ing)|bubbl(e|ing)|crack(ed|ing)?)\b/i, 'product problem'],
  [/\b(warranty claim|file a claim)\b/i, 'warranty claim'],
  [/\b(wrong|not helpful|useless|doesn'?t help|that'?s not what i asked|frustrat)/i, 'unhappy with the answer'],
]

function transcript(messages: StoredMessage[]): string {
  return messages
    .map((m) => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.error ? `[the assistant failed: ${m.error}]` : m.content}`)
    .join('\n\n')
    .slice(-12_000)
}

// ─── OpenAI Decisions ────────────────────────────────────────────────────
// Typed answers instead of written JSON: a probability for each check, and a
// score for priority. Decisions can't write, so the summary is the
// customer's first message.

/** At or above this probability a chat is filed as a support issue. Tune it from reviewed tickets. */
const SUPPORT_THRESHOLD = 0.5
/** At or above this probability a specific reason is listed on the ticket. */
const REASON_THRESHOLD = 0.5

const CONTEXT = 'This is a chat between a customer and the Crazy Seal website assistant. Crazy Seal sells DIY silicone roof coating systems.'

const REASON_CHECKS: [name: string, reason: string, instructions: string][] = [
  ['order_problem', 'order problem', 'Does the customer report a problem with an order: not delivered, late, damaged, missing items, the wrong item, or a refund or return?'],
  ['product_problem', 'product problem', 'Does the customer report a problem with the product after buying or installing it, such as a leak, peeling, bubbling, cracking or the coating failing?'],
  ['warranty_claim', 'warranty claim', 'Does the customer want to make a warranty claim?'],
  ['wants_person', 'asked for a person', 'Does the customer ask to talk to a person, a representative or the team instead of the assistant?'],
  ['unhappy_with_answer', 'unhappy with the answer', 'Does the customer say an answer was wrong, unhelpful or confusing, repeat a question the assistant didn’t answer, or sound frustrated with the assistant?'],
  ['assistant_failed', 'assistant couldn’t answer', 'Did the assistant fail, decline, or say it couldn’t answer something about Crazy Seal products, orders or installation that the company should be able to answer?'],
]

const DECISION_QUESTIONS: DecisionQuestion[] = [
  {
    type: 'predicate',
    name: 'support_issue',
    instructions: `${CONTEXT} Did something go wrong that the support team should look at? Yes if the customer reports a problem with an order, delivery, product or install, wants a warranty claim, refund or return, says an answer was wrong or unhelpful, is frustrated, asks for a person, or the assistant failed or couldn’t answer. No for ordinary questions about products, installation, prices, shipping or becoming a dealer where nothing went wrong.`,
  },
  ...REASON_CHECKS.map(([name, , instructions]): DecisionQuestion => ({ type: 'predicate', name, instructions: `${CONTEXT} ${instructions}` })),
  {
    type: 'score',
    name: 'priority',
    instructions: `${CONTEXT} How urgently should the support team respond?`,
    levels: [
      { label: 'low', description: 'Minor confusion or a question; nothing is at risk.' },
      { label: 'normal', description: 'A real problem with an order, product or answer that needs follow-up.' },
      { label: 'high', description: 'An active leak or damaged property, an angry customer, or a safety issue.' },
    ],
  },
]

async function decisionScreen(messages: StoredMessage[]): Promise<ScreenResult> {
  const { answers } = await runDecisions({ input: transcript(messages), questions: DECISION_QUESTIONS, cacheKey: 'cs-chat-screen' })
  const probability = (name: string) => {
    const a = answers[name]
    return a?.type === 'predicate' ? a.probability : null
  }
  const support = probability('support_issue')
  if (support === null) throw new Error('Decisions declined to screen this chat')
  const reasons = REASON_CHECKS.filter(([name]) => (probability(name) ?? 0) >= REASON_THRESHOLD).map(([, reason]) => reason)
  const p = answers.priority
  const level = p?.type === 'score' ? p.score : 1
  return {
    kind: support >= SUPPORT_THRESHOLD ? 'support_issue' : 'inquiry',
    reasons: support >= SUPPORT_THRESHOLD ? reasons : [],
    summary: messages.find((m) => m.role === 'user')?.content.slice(0, 120) ?? 'Customer chat',
    priority: level >= 1.5 ? 'high' : level >= 0.5 ? 'normal' : 'low',
    probability: Math.round(support * 1000) / 1000,
  }
}

function ruleScreen(messages: StoredMessage[]): ScreenResult {
  const reasons = new Set<string>()
  for (const m of messages) {
    if (m.role === 'assistant' && m.error) reasons.add(`assistant ${m.error === 'refusal' ? 'declined' : 'failed'}`)
    if (m.role !== 'user') continue
    for (const [re, reason] of RULES) if (re.test(m.content)) reasons.add(reason)
  }
  const first = messages.find((m) => m.role === 'user')?.content.slice(0, 120) ?? 'Customer chat'
  return reasons.size
    ? { kind: 'support_issue', reasons: [...reasons], summary: first, priority: 'normal' }
    : { kind: 'inquiry', reasons: [], summary: first, priority: 'low' }
}

export async function screenCustomerConversation(conversationId: string): Promise<void> {
  const conversation = await getConversation(conversationId)
  if (!conversation || conversation.assistant !== 'customer') return
  const messages = await getMessages(conversationId)
  if (!messages.some((m) => m.role === 'user')) return

  let result = ruleScreen(messages)
  const model = screenModel()
  if (isConfigured(model)) {
    try {
      const data =
        providerFor(model) === 'openai'
          ? await decisionScreen(messages)
          : (await runJson<ScreenResult>({ model, system: SYSTEM, prompt: transcript(messages), name: 'chat_screen', schema: SCHEMA })).data
      // The rules can only add a flag, never clear one the model raised.
      result =
        data.kind === 'support_issue' || result.kind === 'inquiry'
          ? data
          : { ...result, reasons: [...new Set([...result.reasons, ...data.reasons])], probability: data.probability }
    } catch (err) {
      console.error('[ai/screen] model screen failed, using rules', err)
    }
  }

  await createAdminClient()
    .from('ai_conversations')
    .update({ screen: { kind: result.kind, reasons: result.reasons, summary: result.summary, probability: result.probability ?? null }, screened_at: new Date().toISOString() })
    .eq('id', conversationId)

  if (result.kind === 'support_issue') {
    await createTicket({
      kind: 'auto_flag',
      subject: result.summary || 'Flagged customer chat',
      body: `Auto-screen flagged this chat: ${result.reasons.join('; ') || 'support issue'}.`,
      author: { type: 'system', name: 'Auto-screen' },
      conversationId,
      priority: result.priority,
      screenReasons: result.reasons,
    })
  } else if (conversation.sampled) {
    await createTicket({
      kind: 'review_sample',
      subject: result.summary || 'Random review sample',
      body: 'Picked at random for review. Check the answers were right and complete.',
      author: { type: 'system', name: 'Review sampling' },
      conversationId,
      priority: 'low',
    })
  }
}

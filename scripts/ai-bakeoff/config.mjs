// Which models run, at what effort, and what they cost. Edit freely.
//
// Prices are USD per 1M tokens (input / cached input / output), list prices
// checked 2026-11-09:
//   - Claude: Anthropic model table (2026-11-03)
//   - OpenAI: developers.openai.com/api/docs/pricing (Standard tier, short context)
//   - Gemini: ai.google.dev/gemini-api/docs/pricing
// Gemini 3.8 Flash is on an introductory rate through 2026-12-31; it doubles to
// $1.50 / $0.15 / $7.50 on 2027-01-01. Thinking tokens bill as output everywhere.

export const PRICES = {
  'claude-haiku-5-5': { input: 0.1, cached: 0.01, output: 0.5 },
  'claude-sonnet-5-5': { input: 2, cached: 0.1, output: 10 },
  'claude-opus-5-5': { input: 4, cached: 0.2, output: 20 },
  'gpt-6-luna': { input: 0.1, cached: 0.01, output: 0.5 },
  'gpt-6.1-terra': { input: 1, cached: 0.05, output: 5 },
  'gpt-6.1-sol': { input: 2, cached: 0.1, output: 10 },
  'gemini-3.8-flash': { input: 0.75, cached: 0.075, output: 3.75 },
  'gemini-3.5-flash-lite': { input: 0.3, cached: 0.03, output: 2.5 },
  mock: { input: 0, cached: 0, output: 0 },
}

// `id` is the label in results and the report; `model` is the API model ID.
// `for` says which assistant the candidate is meant for. Every candidate
// still answers every question; the report splits results by audience.
export const CANDIDATES = [
  { id: 'haiku-5.5@low', provider: 'anthropic', model: 'claude-haiku-5-5', effort: 'low', for: 'customer' },
  { id: 'gpt-6-luna@low', provider: 'openai', model: 'gpt-6-luna', effort: 'low', for: 'customer' },
  { id: 'gemini-3.8-flash@low', provider: 'gemini', model: 'gemini-3.8-flash', effort: 'low', for: 'customer' },
  { id: 'gemini-3.5-flash-lite@low', provider: 'gemini', model: 'gemini-3.5-flash-lite', effort: 'low', for: 'customer' },
  { id: 'sonnet-5.5@low', provider: 'anthropic', model: 'claude-sonnet-5-5', effort: 'low', for: 'dealer' },
  { id: 'sonnet-5.5@medium', provider: 'anthropic', model: 'claude-sonnet-5-5', effort: 'medium', for: 'dealer' },
  { id: 'gpt-6.1-terra@low', provider: 'openai', model: 'gpt-6.1-terra', effort: 'low', for: 'dealer' },
  { id: 'gpt-6.1-terra@medium', provider: 'openai', model: 'gpt-6.1-terra', effort: 'medium', for: 'dealer' },
]

// Two judges from different vendors, so neither grades its own family alone.
// Grading against a short list of key facts is easy work; low effort keeps
// the judging bill down. Raise it if the two judges disagree a lot.
export const JUDGES = [
  { id: 'judge-opus-5.5', provider: 'anthropic', model: 'claude-opus-5-5', effort: 'low' },
  { id: 'judge-gpt-6.1-sol', provider: 'openai', model: 'gpt-6.1-sol', effort: 'low' },
]

// How the model gets Crazy Seal knowledge:
//   'full'     - the whole site (about 27K tokens) in the system prompt, cached.
//                Default: takes retrieval out of the comparison, so scores
//                reflect the model alone.
//   'retrieve' - top-K keyword (BM25) passages per question in the user turn.
//                Closer to a RAG setup, but keyword search misses paraphrases
//                ("cooler" vs "temperature"), and those misses hit every model.
// Pick with --context full|retrieve.
export const CONTEXT_MODE = 'full'
export const RETRIEVE_TOP_K = 7
export const MAX_OUTPUT_TOKENS = 2000
export const MAX_TOOL_TURNS = 5
export const CONCURRENCY = 4 // override with --concurrency 1 for the cleanest latency numbers

export const SYSTEM_PROMPTS = {
  customer: `You are the Crazy Seal website assistant. You help homeowners, RV owners and building owners with questions about Crazy Seal roofing products, installation, ordering, shipping, returns and the warranty.

Rules:
- Answer only from the "Crazy Seal reference" you are given. If it doesn't contain the answer, say you don't have that information and suggest contacting Crazy Seal (phone or the contact page). Never guess numbers, prices, specs, coverage terms or dates.
- Keep answers short: 2 to 5 sentences, or a short list for steps. Plain language, no jargon.
- Don't give legal, medical or structural-engineering advice, and don't disparage competitors.
- Link to the relevant crazyseal.com page when it helps.`,

  dealer: `You are the internal assistant for Crazy Seal sales reps and authorized dealers/installers ("Pros"). You help them sell, quote, install and support customers, and you look up orders, warranties and customers with the tools provided.

Rules:
- Answer product and program questions only from the "Crazy Seal reference" you are given. If it doesn't contain the answer, say so plainly; never guess numbers, prices, specs, terms or dates.
- For anything about a specific order, warranty or customer, call the matching tool. Report what the tool returned; don't invent records. If a lookup finds nothing, say so.
- Be concise and practical: lead with the answer, then the details a rep needs.`,
}

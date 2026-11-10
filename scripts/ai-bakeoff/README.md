# AI assistant bake-off

Compares LLMs for Crazy Seal's two planned assistants, on Crazy Seal's own content and questions:

- **Customer assistant** (site chat): answers homeowners and RV owners from the public site.
- **Dealer / sales rep assistant** (back end): program and sales questions, plus order, warranty and customer lookups.

It measures accuracy (graded by two judges from different vendors), hallucinations, tool use, time to first token, and cost. It is separate from the Next.js app: it has its own `package.json`, and the files are `.mjs` so the app's TypeScript build ignores them.

## Files

| File | What it is |
|---|---|
| `build-kb.mjs` | Fetches the public crazyseal.com pages into `kb.json` (the knowledge every model answers from). |
| `questions.json` | 62 test cases: 32 customer, 14 dealer knowledge, 8 that should be declined, 8 tool lookups. Every key fact is quoted from `kb.json`, with its source page. |
| `tools.mjs` | Mock `lookup_order`, `lookup_warranty`, `lookup_customer` tools with fictional fixture data. |
| `config.mjs` | Models, effort levels, prices, judges, system prompts, context mode. Edit freely. |
| `run.mjs` | Runs every model on every case. Writes `results/<time>/raw.jsonl`. |
| `judge.mjs` | Grades every answer with both judges. Writes `grades.json`. |
| `report.mjs` | Builds a self-contained `report.html`. |

## Run it

1. Add the three API keys to the **repo root** `.env.local` (it is git-ignored):
   ```
   ANTHROPIC_API_KEY=...
   OPENAI_API_KEY=...
   GEMINI_API_KEY=...
   ```
2. From this folder:
   ```bash
   npm install
   node build-kb.mjs            # refresh kb.json from the live site (optional, it is already built)
   node run.mjs                 # all 8 models x 62 cases
   node judge.mjs results/<run>
   node report.mjs results/<run>
   ```
   Open `results/<run>/report.html` in a browser.

Free dry run with no API calls (fake numbers, proves the pipeline): `node run.mjs --mock`, then `node judge.mjs results/<run> --mock`, then `node report.mjs results/<run>`.

Useful flags for `run.mjs`:
- `--only haiku-5.5@low,gpt-6-luna@low` runs just those candidates (ids from `config.mjs`).
- `--cases c01,c02,t01` runs just those cases.
- `--repeat 3` makes 3 runs per case, for steadier latency medians (only run 1 is judged).
- `--concurrency 1` sends one request at a time, for the cleanest latency numbers.
- `--context retrieve` gives each question the top 7 keyword-matched passages instead of the whole site.

`judge.mjs --judges judge-gpt-6.1-sol` grades with one judge only (roughly a third of the judging cost).

## Cost (estimate)

One full pass with the defaults is roughly **$15–20**:
- About **$4** for the 8 candidate models. The cheap models cost cents. Sonnet 5.5 (about $2 for both effort levels) and GPT-6.1 Terra (about $1) make up most of it.
- About **$12** for the two judges. Each of them grades 496 answers against the whole site. Opus 5.5 is about $8 of that and GPT-6.1 Sol about $4.

The site text (about 27K tokens) is the same on every call, so all three vendors serve it from their prompt cache after the first request. That is what keeps this cheap. To spend less: use one judge (`--judges judge-gpt-6.1-sol`, total about $8), or start with a subset (`--only` / `--cases`). `--repeat 3` adds about $8 more on the candidate side.

These are estimates from list prices and expected token counts. The report shows the real cost per model once it has run.

## What the report shows

- **Score**: average of both judges, where correct = 1, partial = 0.5 and wrong = 0.
- **Both judges: correct**: the share of answers that both judges marked fully correct.
- **Hallucination**: the share of answers where either judge found a specific claim (number, price, date, policy, record detail) that the site or the tool results don't support. For a customer-facing bot this matters more than the score.
- **Right tool use**: on lookup cases, whether the model called the expected tool with the right arguments. On dealer cases that should be declined, it checks that the model called no tool at all.
- **First token p50 / p90**: the time until the reply starts appearing. Thinking tokens don't count, because the user sees nothing until the answer text starts. This is the number that decides whether a chat feels fast. It is measured from wherever you run this, so run it on a normal connection and compare models with each other, not with absolute targets.
- **Full answer p50**: the time until the reply is finished.
- **Cost / 1,000 msgs**: list prices in `config.mjs` multiplied by the real tokens these questions used, including cached input.
- **Judges agree**: how often the two judges gave the same verdict. Low agreement means the case or the rubric needs tightening, not the model.
- **Errors / refusals**: API errors, and refusals by the model's own safety filter. Server-side fallbacks are deliberately off, so a refusal shows up here instead of being answered silently by a different model.

## Context modes

- **`full`** (default): the whole site goes in the system prompt, cached. Retrieval drops out as a variable, so the scores reflect the model alone. At about 27K tokens with caching, this may also be the simplest production design.
- **`retrieve`**: BM25 keyword search, top 7 passages. With the current question set it misses the right page for about 6 questions phrased differently from the site ("cooler" vs. "temperature", "vents" vs. "penetrations"). Those misses hurt every model equally. Production retrieval should use embeddings.

## Site content issues this surfaced

Any assistant will repeat these until the site is fixed:
- **Free shipping threshold conflict**: $500 on /products, /faq, /kit-builder, /commercial-roofing and /rv-roofing; $700 on every individual product page. Case `c15` tracks this.
- **/professionals/restaurants** is a copy of /professionals/facilities with a different heading. The KB builder skips it as a near-duplicate.
- Cure time, VOC g/L, fire rating and potable-water suitability aren't on any page (they may be in the TDS/SDS PDFs, which aren't ingested). The assistants will correctly say "I don't know" to these until that content is added.

## Using this as the regression eval for the feedback loop

`questions.json` is built so flagged real conversations become new cases. To add one, append it to `cases` with `"origin": "feedback"` and these fields:

```json
{ "id": "f001", "audience": "customer", "kind": "answer", "origin": "feedback",
  "question": "<the user's message, with any personal details removed>",
  "keyFacts": ["<what a correct answer says, from the site>"],
  "mustNot": ["<the mistake the assistant made>"],
  "sources": ["/the-page-with-the-answer"],
  "notes": "Flagged by <rep/support> on <date>: <what went wrong>" }
```

Rerun before any change to the model, prompt or knowledge base. A change ships only if it doesn't drop the score or raise hallucinations on the existing cases.

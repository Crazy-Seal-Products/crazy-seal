---
name: verify-quote-requests-model
description: Recheck the TLA+ model of quote requests from contractor pages (the form on /contractor/<address>, saving the lead, emailing the contractor and Crazy Seal, and sending unsent ones again) after a change to it. Use when a change touches src/components/contractor/QuoteForm.tsx, src/app/api/contractors/quote/route.ts, src/lib/contractors/quote.ts, src/app/api/cron/contractor-quotes/route.ts, vercel.json's crons, the leads columns in supabase/migrations/023_contractor_fixes.sql and 024_quote_retry_throttle.sql, or how an admin renames or hides a contractor (src/lib/portal/admin/contractor-actions.ts).
---

# Verify the quote requests model

`docs/statecharts/quote-requests/QuoteRequests.tla` models one contractor, one visitor and one request. TLC checks every order of the visitor opening the page and sending the form, an admin renaming or hiding the page, the two emails going out or failing, and the server stopping right after it answers. A pass covers the model, not the whole flow.

## Rules

| Rule | In plain words |
|---|---|
| `ListedPagesTakeRequests` | A visitor on a listed contractor's page can always send them a request. |
| `NoRequestIsLost` | Every saved request reaches the contractor, or Crazy Seal is told about it. |

## Coverage

Last confirmed against the uncommitted working tree on 2026-11-10, after the fix (codex/erics-machine at 96e6068 plus the quote form). `today.cfg` (`Fixed = TRUE`) is the code now; `before.cfg` (`Fixed = FALSE`) is the code before the fix. Name a commit here only after you confirm the model still describes the code.

| Model action | Code |
|---|---|
| `VisitorSends` | `QuoteForm` posts the page's slug; the route checks Turnstile, then `recordQuote` selects the listed contractor by `slug`, or by an old address in `contractor_redirects`, and inserts the lead; with neither it answers 404 "isn't taking requests here right now" |
| `Notifies` | `after(notifyQuote)`: the contractor email (reply-to the customer) and `contractor_notified_at`, then the team copy and `quote_team_notified_at`; each failure is only logged. From `queued`: `resendUnsentQuotes`, run daily by `/api/cron/contractor-quotes` (Vercel Cron; no `CRON_SECRET` needed, at most one try per request per hour, claimed through `quote_last_try_at`) or by Send again on the contractor's admin page (no hourly wait) |
| `ServerStops` | the function ends after answering, before its `after()` work runs |
| `AdminRenames`, `AdminHides` | `saveContractor` with a new page address, or Listed publicly off |
| `Fixed` actions | the code now: the old-address lookup in `recordQuote`, and a request with neither stamp counts as queued until `resendUnsentQuotes` gets it out |

## Check a change

1. Read the diff. If it touches nothing above, say so and stop.
2. Update the model so each action matches the new code, and set `Fixed` in the configs to describe the code as it is.
3. Run each config with the pstack `/statechart` skill, giving it `view.mts` as the view. On Eric's Windows machine the command is `statechart` (or `statechart-wsl`), with an `--out` folder that doesn't exist yet.
4. Compare with the expected results, then copy the new chart and report into `charts/`.
5. Replay against the real code: from `docs/statecharts/replay/crazy-seal/`, run `node --import ./register-quote-requests.mjs --test quote-requests.test.mjs`. It runs the real quote route (with `after()` queued by `quote-requests.hooks.mjs`), `recordQuote`, `notifyQuote`, `resendUnsentQuotes` and the cron route with a fake database and a fake Gmail. Each test walks a former bug path and asserts the rule now holds; others pin the open retry route: calls in the same hour send nothing extra, two calls at once send once, Send again skips the wait, and a `CRON_SECRET`, if set, is enforced.

Expected results today:

| Config | Rules that break (shortest path) |
|---|---|
| `before.cfg` | `ListedPagesTakeRequests` (the visitor opens the page, an admin changes its address, the visitor sends: "isn't taking requests"), `NoRequestIsLost` (the request is saved, then both emails fail; nothing sends it again) |
| `today.cfg` | none |

The model's queued request is retried with no limit. In the code the cron looks back 14 days, leaves requests younger than 10 minutes to the request still sending them, and runs daily at 14:00 UTC (Vercel's Hobby plan allows at most daily). The route runs without `CRON_SECRET`, so anyone can call it; what keeps that safe is in `resendUnsentQuotes`: it only touches requests nobody was told about, tries each at most once an hour (`quote_last_try_at`, migration 024), and sends a try only after claiming it by moving that time forward from the value it read. If `CRON_SECRET` is set in Vercel, the route requires it. Neither the hourly wait nor the claim is in the model.

Left out: the contractor's email changing between saving and sending (the email goes to the address read when the request was saved, a window of milliseconds, or to the current one on a retry), the contractor being hidden in that same window, duplicate submissions (the button is disabled while sending and Turnstile tokens are single use), and the customer's success message, which shows as soon as the request is saved.

## Bug or modeling error?

A new break is a finding until you show otherwise: replay its shortest path against the real code. If it doesn't reproduce, fix the model, not the rule. Never weaken a rule to make it pass, and don't change product code unless you were asked to.

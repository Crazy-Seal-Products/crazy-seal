---
name: verify-pro-access-model
description: Recheck the TLA+ model of who can get into a Pro Hub account (sign-up, sign-in and reset links, passwords, sessions) after a change to Pro Hub sign-in. Use when a change touches src/app/api/pro/auth/*, src/lib/pro/auth.ts, the Pro Hub sign-up, login, forgot or reset pages, or how a pro's email is matched to Shopify customers and warranties (src/lib/shopify/commerce.ts, src/lib/pro/shopify.ts, src/lib/pro/context.ts).
---

# Verify the Pro Hub access model

`docs/statecharts/pro-access/ProAccess.tla` models one email address with two people: the pro who can read its inbox, and a stranger who only knows it. TLC checks every order of sign-ups, link requests and link uses (including the same link opened twice at once). A pass covers the model, not the whole app.

## Rules

| Rule | In plain words |
|---|---|
| `OnlyTheOwnerGetsIn` | Only the person who controls the email gets into its account. |
| `LinkWorksOnce` | A link signs someone in at most once. |
| `OwnerKeepsTheAccount` | No one but the owner ever sets the account's password. |
| `AResetLocksOthersOut` | Once the pro has set the password from a link, no one else is still signed in. |

## Coverage

Last confirmed against Crazy-Seal-Products/crazy-seal branch `fix/pro-access-signup` (based on `main` at `96e6068`). `Fixed = FALSE` describes `96e6068`; `Fixed = TRUE` describes the branch. Name a newer commit here only after you confirm the model still describes the code.

| Model action | Code |
|---|---|
| `SignsUp` | `src/app/api/pro/auth/signup/route.ts`: when the email has no `password_hash`, `createMagicLink` and `sendProSignupLink` to `/pro/reset/?welcome=1`; no password, no session. Before the fix: `setPasswordHash` and `createSession` at once, with no email check |
| `OwnerRequestsLink` | `createMagicLink` in `src/lib/pro/auth.ts`, from the request (sign-in), forgot (reset) and sign-up routes |
| `OpensLink`, `FinishesLink` | `consumeMagicLink`: one `update({ used_at })` filtered on `token_hash`, `used_at` null and `expires_at`, returning the row; only the request that gets the row back continues. Before the fix: select where `used_at` is null, then update by id with no condition |
| `FinishesLink(t, FALSE)` | `src/app/api/pro/auth/callback/route.ts`: signs in, sets no password |
| `FinishesLink(t, TRUE)` | `src/app/api/pro/auth/reset/route.ts`: `setPasswordHash`, then `endAllSessions`, then `createSession`. Before the fix: no `endAllSessions` |
| `StrangerSignsIn` | `src/app/api/pro/auth/login/route.ts`, once a stranger owns the password |
| `TakenOver` | not code: an account the old sign-up already gave to a stranger |

Outside the model, covered by the replays: customer lookups match emails exactly. `getLocalCustomerByEmail` (`src/lib/shopify/commerce.ts`) escapes `\`, `%` and `_` before its `ilike` (the copy keeps emails as Shopify has them, so case must not matter) and takes only a row whose lowercased email is equal, with no falling back to the first row; `findShopifyCustomerByEmail` (`src/lib/pro/shopify.ts`) also takes only an exact match. Sign-up rejects `%`; `_` is allowed because it is common in real addresses and no Pro Hub lookup treats it as a wildcard any more. `loadJobsForPro` uses one `.eq()` per email column instead of pasting the email into `.or()`.

The model has one link, so from "both the stranger and the pro are signed in" it can't show a later reset; the reset from the first state covers that.

## Check a change

1. Read the diff. If it touches nothing above, say so and stop.
2. Update the model so each action matches the new code. `fixed.cfg` and `fixed-after-takeover.cfg` describe the code as it is; `before-fix.cfg` keeps `96e6068` for comparison.
3. Run each config with the pstack `/statechart` skill, giving it `view.mts` as the view. On Eric's Windows machine the command is `statechart` (or `statechart-wsl`), for example `statechart ProAccess.tla --config fixed.cfg --view view.mts --out <folder>`.
4. Compare with the expected results, then copy the new `chart.mmd` and `report.md` into `charts/` as `<config>.mmd` and `<config>.report.md`, and render the SVGs with Pele.
5. Replay against the real code: from `docs/statecharts/replay/crazy-seal/`, run `node --import ./register.mjs --test pro-access.test.mjs`. It runs the real sign-up, login, forgot, reset and callback routes, `consumeMagicLink`, `loadProContext` and `loadJobsForPro` against a fake database, a fake Shopify and a fake Gmail. All 8 tests pass on the branch; against `96e6068` the 7 that cover a bug fail and "an invited pro still signs in with an emailed link" passes.

Expected results:

| Config | Rules that break |
|---|---|
| `before-fix.cfg` (`96e6068`) | `OnlyTheOwnerGetsIn`, `OwnerKeepsTheAccount` (1 step: a stranger signs up), `AResetLocksOthersOut` (4 steps: the pro resets after a stranger signed up), `LinkWorksOnce` (5 steps: one link opened twice) |
| `fixed.cfg` | none |
| `fixed-after-takeover.cfg` | none (it checks `LinkWorksOnce` and `AResetLocksOthersOut`). The chart shows the stranger staying signed in when the pro only signs in by link: the fix stops new takeovers, but an account taken over before it stays taken over until the pro sets a password or staff clear it |

## Bug or modeling error?

A new break is a finding until you show otherwise: replay its shortest path against the real code. If it doesn't reproduce, fix the model, not the rule. Never weaken a rule to make it pass, and don't change product code unless you were asked to.

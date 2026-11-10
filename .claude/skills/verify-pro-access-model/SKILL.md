---
name: verify-pro-access-model
description: Recheck the TLA+ model of who can get into a Pro Hub account (sign-up, sign-in links, passwords, sessions) after a change to Pro Hub sign-in. Use when a change touches src/app/api/pro/auth/*, src/lib/pro/auth.ts, the Pro Hub sign-up, login, forgot or reset pages, or how a pro's email is matched to Shopify customers and warranties (src/lib/shopify/commerce.ts, src/lib/pro/context.ts).
---

# Verify the Pro Hub access model

`docs/statecharts/pro-access/ProAccess.tla` models one email address with two people: the pro who can read its inbox, and a stranger who only knows it. TLC checks every order of sign-ups, sign-in link requests and link openings (including the same link opened twice at once). A pass covers the model, not the whole app.

## Rules

| Rule | In plain words |
|---|---|
| `OnlyTheOwnerGetsIn` | Only the person who controls the email gets into its account. |
| `LinkWorksOnce` | A sign-in link signs someone in at most once. |
| `OwnerKeepsTheAccount` | No one but the owner ever sets the account's password. |

## Coverage

Last confirmed against Crazy-Seal-Products/crazy-seal `main` at `96e6068` ("Deploy the Accelerator Program editor, Portal accounts cleanup, and faster admin pages."). Name a newer commit here only after you confirm the model still describes the code.

| Model action | Code |
|---|---|
| `SignsUp` | `src/app/api/pro/auth/signup/route.ts`: when the email has no `password_hash`, `setPasswordHash` and `createSession` at once, with no email check |
| `OwnerRequestsLink` | `createMagicLink` in `src/lib/pro/auth.ts` |
| `OpensLink`, `FinishesLink` | `consumeMagicLink`: select where `used_at` is null, then `update({ used_at }).eq('id', link.id)` with no condition |
| `StrangerSignsIn` | the password login, once a stranger owns the password |
| `Fixed` actions | the proposed change: sign-up only emails a link, the password is set when the link is used, and using a link is one conditional update |

Found by reading and replayed, outside the model: the server-side email check accepts `%` and `_`, and `getLocalCustomerByEmail` matches with `ilike` and falls back to the first row, so signing up as `%@%.%` shows the first customer in the copy. Match emails exactly (lowercased `eq`), and reject `%` and `_` in sign-up emails. `loadJobsForPro` also pastes the email into `.or()` filters unescaped.

## Check a change

1. Read the diff. If it touches nothing above, say so and stop.
2. Update the model so each action matches the new code, and set `Fixed` in the configs to describe the code as it is.
3. Run each config with the pstack `/statechart` skill, giving it `view.mts` as the view. On Eric's Windows machine the command is `statechart` (or `statechart-wsl`).
4. Compare with the expected results, then copy the new chart and report into `charts/`.
5. Replay against the real code: from `docs/statecharts/replay/crazy-seal/`, run `node --import ./register.mjs --test pro-access.test.mjs`. It runs the real sign-up route, `consumeMagicLink`, `loadProContext` and `loadJobsForPro` against a fake database. Today these tests pass because they assert the bugs; after a fix, change them to assert the fixed behavior.

Expected results at `96e6068`:

| Config | Rules that break |
|---|---|
| `today.cfg` | `OnlyTheOwnerGetsIn`, `OwnerKeepsTheAccount` (1 step: a stranger signs up), `LinkWorksOnce` |
| `fixed.cfg` | none |

## Bug or modeling error?

A new break is a finding until you show otherwise: replay its shortest path against the real code. If it doesn't reproduce, fix the model, not the rule. Never weaken a rule to make it pass, and don't change product code unless you were asked to.

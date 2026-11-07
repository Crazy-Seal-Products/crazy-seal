---
name: verify-shopify-copy-model
description: Recheck the TLA+ model of Crazy Seal's local copy of Shopify orders (webhooks, the admin refresh, one-off fetches, deletes) after a change to it. Use when a change touches src/lib/shopify/sync.ts, src/lib/shopify/commerce-map.ts, the upsert_shopify_orders or upsert_shopify_customers SQL functions, src/app/api/shopify/webhooks/route.ts, src/lib/portal/admin/refresh.ts or its starting points in shopify_sync_state, src/lib/portal/admin/details.ts, the Pro Hub's on-demand customer fetch, or the Shopify backfill script.
---

# Verify the Shopify copy model

`docs/statecharts/shopify-copy/ShopifyCopy.tla` models two orders (one edited or deleted, one new) while the update webhook, the delete webhook, the admin refresh and a staff member opening a new order overlap. TLC checks every order of those steps. A pass covers the model, not the whole app. Customers follow the same pattern and aren't modeled separately.

## Rules

| Rule | In plain words |
|---|---|
| `NeverGoesBack` | Our copy of an order never goes back to an older version. |
| `DeletedStaysDeleted` | An order deleted in Shopify stays deleted in our copy. |
| `NothingLeftBehind` | When nothing is running, any order behind Shopify will be fetched by the next refresh. Checked without webhooks: `refresh.ts` says they may not be registered, and with them a skipped change arrives by webhook unless that delivery is missed. |

## Coverage

`Fixed = TRUE` describes the code on branch `fix/shopify-copy` (Crazy-Seal-Products/crazy-seal), last confirmed at the commit that added this version of the skill. `Fixed = FALSE` is `main` at `96e6068`, before the fix. Name a newer commit here only after you confirm the model still describes the code.

| Model action | Code |
|---|---|
| `Write` | `upsertShopifyOrder` in `src/lib/shopify/sync.ts`, which calls `upsert_shopify_orders` (`supabase/migrations/019_shopify_copy_newest_wins.sql`): replace only when Shopify's `updated_at` is the same or newer, never when `deleted_at` is set, line items in the same transaction. `orderRow` in `commerce-map.ts` no longer sends `deleted_at`. |
| `HookFetches`, `HookWrites` | `fetchAndUpsertOrder`, called by the orders/* webhook: ask Shopify, then write |
| `DeleteO` with webhooks | `markShopifyDeleted` from orders/delete |
| `RefreshFetches`, `RefreshWrites`, `RefreshEnds` | `src/lib/portal/admin/refresh.ts`: start from its own row in `shopify_sync_state` (`orders_refresh`), fetch, write in batches, and when it reads to the end save the time it asked Shopify less 60 seconds (`cursor := pulledAt`, read from `From - 1`) |
| `StaffOpensNew` | `src/lib/portal/admin/details.ts` fetching an order that isn't copied yet (the Pro Hub's customer fetch in `src/lib/shopify/commerce.ts` writes the same way; neither moves the refresh's starting point now) |

Not modeled, and covered elsewhere:

- A refresh that stops at its page cap saves the last change it wrote and continues from there; one that fails keeps its starting point. The replays cover both.
- Line items are replaced inside `upsert_shopify_orders`, in the order's transaction, so two versions of one order can no longer delete each other's items. `shopify-copy-sql.check.mjs` checks the SQL.
- Not covered anywhere: an order deleted in Shopify before it was ever copied, then written by a fetch made before the delete. The delete has no row to mark, so that write adds the order.

## Check a change

1. Read the diff. If it touches nothing above, say so and stop.
2. Update the model so each action matches the new code. `Fixed = TRUE` in `fixed*.cfg` describes the code; `before-fix*.cfg` keep the old code for comparison.
3. Run each config with the pstack `/statechart` skill, giving it `view.mts` as the view. On Eric's Windows machine the command is `statechart` (or `statechart-wsl`), for example `statechart ShopifyCopy.tla --config fixed.cfg --view view.mts --out <new folder>`.
4. Compare with the expected results, then copy the new chart and report into `charts/`.
5. Replay against the real code: from `docs/statecharts/replay/crazy-seal/`, run `node --import ./register.mjs --test shopify-copy.test.mjs`. It runs the real `fetchAndUpsertOrder`, `markShopifyDeleted` and admin refresh with a fake Shopify and a fake database whose `.rpc()` runs a JavaScript copy of the SQL functions (`shopify-copy-sql.mjs`). All five tests pass on the fix and fail on `96e6068`.
6. If the SQL functions changed, update `shopify-copy-sql.mjs` to match and check the SQL itself in PGlite: install `@electric-sql/pglite` in a folder outside the repo, then from the same replay folder run `PGLITE_DIR=<that folder> node --import ./register.mjs --test shopify-copy-sql.check.mjs`. It runs migrations 015 and 019 and writes rows built by the real `commerce-map.ts`.

Expected results:

| Config | Rules that break |
|---|---|
| `fixed.cfg` (webhooks) | none |
| `fixed-no-webhooks.cfg` | none |
| `before-fix.cfg` (webhooks) | `NeverGoesBack`, `DeletedStaysDeleted` |
| `before-fix-no-webhooks.cfg` | `NothingLeftBehind` |

## Bug or modeling error?

A new break is a finding until you show otherwise: replay its shortest path against the real code. If it doesn't reproduce, fix the model, not the rule. Never weaken a rule to make it pass, and don't change product code unless you were asked to.

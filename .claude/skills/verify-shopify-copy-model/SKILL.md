---
name: verify-shopify-copy-model
description: Recheck the TLA+ model of Crazy Seal's local copy of Shopify orders (webhooks, the admin refresh, one-off fetches, deletes) after a change to it. Use when a change touches src/lib/shopify/sync.ts, src/lib/shopify/commerce-map.ts, src/app/api/shopify/webhooks/route.ts, src/lib/portal/admin/refresh.ts, src/lib/portal/admin/details.ts, the Pro Hub's on-demand customer fetch, or the Shopify backfill script.
---

# Verify the Shopify copy model

`docs/statecharts/shopify-copy/ShopifyCopy.tla` models two orders (one edited or deleted, one new) while the update webhook, the delete webhook, the admin refresh and a staff member opening a new order overlap. TLC checks every order of those steps. A pass covers the model, not the whole app. Customers and line items follow the same pattern and aren't modeled separately.

## Rules

| Rule | In plain words |
|---|---|
| `NeverGoesBack` | Our copy of an order never goes back to an older version. |
| `DeletedStaysDeleted` | An order deleted in Shopify stays deleted in our copy. |
| `NothingLeftBehind` | When nothing is running, any order behind Shopify will be fetched by the next refresh. Checked without webhooks: `refresh.ts` says they may not be registered, and with them a skipped change arrives by webhook unless that delivery is missed. |

## Coverage

Last confirmed against Crazy-Seal-Products/crazy-seal `main` at `96e6068`. Name a newer commit here only after you confirm the model still describes the code.

| Model action | Code |
|---|---|
| `Write` | `upsertShopifyOrder` in `src/lib/shopify/sync.ts` (`upsert` on `shopify_id`, no compare of `shopify_updated_at`); `orderRow` in `commerce-map.ts` sets `deleted_at: null` on every write |
| `HookFetches`, `HookWrites` | `fetchAndUpsertOrder`, called by the orders/* webhook: ask Shopify, then write |
| `DeleteO` with webhooks | `markShopifyDeleted` from orders/delete |
| `RefreshFetches`, `RefreshWrites`, `RefreshEnds` | `src/lib/portal/admin/refresh.ts`: start from the newest stored `shopify_updated_at` minus 60 seconds, fetch, then write in batches |
| `StaffOpensNew` | `src/lib/portal/admin/details.ts` fetching an order that isn't copied yet (the Pro Hub's customer fetch in `src/lib/shopify/commerce.ts` moves the starting point the same way) |
| `Fixed` | the proposed change: write only when Shopify's `updated_at` is newer, never clear a delete, and keep a refresh cursor set to the time the refresh asked Shopify. Setting it to when the refresh finished was the first idea, and the checker showed it skips changes made during the run. |

Not modeled: two versions of one order deleting each other's line items (`upsertShopifyOrder` upserts items, then deletes the ones missing, with no transaction), and a refresh batch failing partway after later records were saved.

## Check a change

1. Read the diff. If it touches nothing above, say so and stop.
2. Update the model so each action matches the new code, and set `Fixed` in the configs to describe the code as it is.
3. Run each config with the pstack `/statechart` skill, giving it `view.mts` as the view. On Eric's Windows machine the command is `statechart` (or `statechart-wsl`).
4. Compare with the expected results, then copy the new chart and report into `charts/`.
5. Replay against the real code: from `docs/statecharts/replay/crazy-seal/`, run `node --import ./register.mjs --test shopify-copy.test.mjs`. It runs the real `fetchAndUpsertOrder` and `markShopifyDeleted` with a fake Shopify and a fake database. Today these tests pass because they assert the bugs; after a fix, change them to assert the fixed behavior.

Expected results at `96e6068`:

| Config | Rules that break |
|---|---|
| `today.cfg` (webhooks) | `NeverGoesBack`, `DeletedStaysDeleted` |
| `today-no-webhooks.cfg` | `NothingLeftBehind` |
| `fixed.cfg`, `fixed-no-webhooks.cfg` | none |

## Bug or modeling error?

A new break is a finding until you show otherwise: replay its shortest path against the real code. If it doesn't reproduce, fix the model, not the rule. Never weaken a rule to make it pass, and don't change product code unless you were asked to.

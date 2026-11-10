---
name: verify-contractor-records-model
description: Recheck the TLA+ model of contractor records (the dealer-list import, the admin's add and edit, and the public pages at /contractor/<page address>, including old addresses that redirect) after a change to them. Use when a change touches scripts/import-contractors.mjs, src/lib/portal/admin/contractor-actions.ts, src/lib/contractors/slug.ts, getPublicContractor or currentAddressFor in src/lib/contractors/data.ts, src/app/contractor/[slug]/page.tsx, or the contractors and contractor_redirects tables (supabase/migrations/021_contractors.sql, 023_contractor_fixes.sql).
---

# Verify the contractor records model

`docs/statecharts/contractor-records/ContractorRecords.tla` models one dealer on the sheet and another contact at the same company who is only ever added by hand. TLC checks every order of imports, the dealer's email changing on the sheet, an admin changing a phone, renaming a page address or adding a contractor, and someone sharing a page's address. A pass covers the model, not the whole app.

## Rules

| Rule | In plain words |
|---|---|
| `OnePagePerDealer` | A dealer never ends up with two pages. |
| `AdminEditsStick` | A later import never undoes an admin's change. |
| `SharedLinksKeepWorking` | An address someone shared keeps opening that contractor's page. |
| `AddressesUnique` | No two pages have the same address. |

## Coverage

Last confirmed against the uncommitted working tree on 2026-11-10, after the fix (codex/erics-machine at 96e6068 plus the contractor changes). `today.cfg` (`Fixed = TRUE`) is the code now; `before.cfg` (`Fixed = FALSE`) is the code before the fix. Name a newer commit here only after you confirm the model still describes the code.

| Model action | Code |
|---|---|
| `Import` | `scripts/import-contractors.mjs`: matches on `import_key` (segment, email or name, home state) and writes the listed fields not in `edited_fields`; with no match, links a contractor with the same email whose key no sheet row has; else holds a row whose company, or name and state, is already listed; else inserts with `uniqueSlug` over current and redirecting addresses |
| `EmailChanges` | the dealer's email changes on the sheet, so the next import's key is new |
| `AdminEditsPhone`, `AdminRenames` | `saveContractor` in `src/lib/portal/admin/contractor-actions.ts`: adds the fields it changes to `edited_fields`; a new address must be free in `contractors` and `contractor_redirects` (`addressHolder`), and the old one goes into `contractor_redirects` |
| `AdminAddsDealer`, `AdminAddsOtherContact` | `createContractor` with the address left blank: `uniqueSlug(slugify(name))` over current and redirecting addresses, no `import_key`, the filled fields in `edited_fields` |
| `Opens` | `src/app/contractor/[slug]/page.tsx`: `getPublicContractor` (the listed row with that slug), else `currentAddressFor` and a permanent redirect, else a 404 |
| `Fixed` actions | the code now (see `Import`, `AdminRenames` and `Opens` above). Two refinements the model's two rows don't exercise: the email link skips a row whose key another sheet row has (one email listed in two states keeps two pages), and a row whose name and state match a listed contractor is held like a same-company one (a dealer with no company under a new email) |

The model leaves out: more than two rows or two imports, hidden contractors, fields other than the phone, two admins saving at once (the unique index on `slug` catches a clash within `contractors`; a clash between a new address and a just-made redirect isn't caught by the database), and the import's name-based key for rows with no email.

## Check a change

1. Read the diff. If it touches nothing above, say so and stop.
2. Update the model so each action matches the new code, and set `Fixed` in the configs to describe the code as it is.
3. Run each config with the pstack `/statechart` skill, giving it `view.mts` as the view. On Eric's Windows machine the command is `statechart` (or `statechart-wsl`), with an `--out` folder that doesn't exist yet.
4. Compare with the expected results, then copy the new chart and report into `charts/` and render the SVGs with `node ~/.local/share/pele/render.mjs charts/before.mmd charts/today.mmd`.
5. Replay against the real code: from `docs/statecharts/replay/crazy-seal/`, run `node --import ./contractor-records.register.mjs --test contractor-records.test.mjs`. It runs the real import script, `createContractor`, `saveContractor`, `getPublicContractor` and `currentAddressFor` against a fake database and a fake dealer list. Each test walks a former bug path and asserts the rule now holds; two more pin the fix's trade-offs (a new contact at a listed company is held for review; one email in two states keeps two pages). After the import or the admin actions change, rerun them and the real import (`node --env-file=.env.local scripts/import-contractors.mjs <dealer list>`), which on 2026-11-10 printed 0 added, 133 updated, 0 linked, 0 held.

Expected results on 2026-11-10:

| Config | Rules that break |
|---|---|
| `before.cfg` | `OnePagePerDealer` (2 steps: an admin adds the dealer, then the import adds a second page), `AdminEditsStick` (3 steps), `SharedLinksKeepWorking` (3 steps: a shared address dies on a rename) |
| `today.cfg` | none |

`before.cfg` reaches 978 states, over the chart budget, so its chart shows only the bug paths. `today.cfg` reaches 469 and draws the whole chart.

## Bug or modeling error?

A new break is a finding until you show otherwise: replay its shortest path against the real code. If it doesn't reproduce, fix the model, not the rule. Never weaken a rule to make it pass, and don't change product code unless you were asked to.

---
name: verify-view-as-model
description: Recheck the TLA+ model of View as (an admin opening a dealer's Pro Hub read-only, including the base view for roster dealers with no account) after a change to it. Use when a change touches src/lib/pro/view-as.ts, src/app/api/admin/view-as/*, src/app/api/pro/auth/logout/route.ts, src/app/api/pro/me/route.ts, loadProContext in src/lib/pro/context.ts, the Pro Hub write routes that check isViewingAs, admin sign-out, or the admin_view_as_log table.
---

# Verify the View as model

`docs/statecharts/view-as/ViewAs.tla` models one browser where admins A and B take turns signing in to the Crazy Seal Admin, and two dealers: Mike, who has a Pro Hub account, and Ruth, who is on the roster with no account until she signs up. TLC checks every order of View as presses, sign-ins and sign-outs, A losing View as, Ruth signing up, the cookie's hour running out, Pro Hub page loads, change attempts from the Pro Hub tab, and "Exit admin view". A pass covers the model, not the whole app.

## Rules

| Rule | In plain words |
|---|---|
| `OnlyTheStarterSees` | Only the admin who started a view, while signed in and allowed View as, sees the dealer's Pro Hub through it. |
| `NothingChangesWhileViewing` | Nothing changes a dealer's account while an admin views it. |
| `NoBaseViewOnceTheyHaveAnAccount` | Once the dealer has an account, View as stops showing the no-account base view. |
| `ExitEndsTheView` | After "Exit admin view", the view can't be used again. |
| `LogShowsEveryView` | The log shows every view that has ended: each start has an exit or has expired, except the view in the browser now. |

## Coverage

Last confirmed against the uncommitted working tree on 2026-11-10, after the View as fix (codex/erics-machine at 96e6068 plus the View as changes and that fix). Name a newer commit here only after you confirm the model still describes the code.

`today.cfg` (`Fixed = TRUE`) is the code now. `before.cfg` (`Fixed = FALSE`) is the code before the fix, kept to show what the fix changed.

| Model action | Code |
|---|---|
| `StartsView` | `POST /api/admin/view-as` → `startViewAs`: logs the end of any view the cookie already names (`logEnd`), sets the signed cookie and logs `start`; a roster customer opens their account if one exists, else the base view |
| `PageLoads` | `GET /api/pro/me` → `getProUser` → `getViewAs` (cookie valid, the admin it names signed in, `adminCan('view_as')`), which shows `viewedUser`: the account, or for a `c` cookie the dealer's account once one exists and the base user until then; then `loadProContext`, which skips its `pro_users` sync while `isViewingAs()` |
| `TriesToChangeSomething` | password, support and warranty routes return 403 while `isViewingAs()` |
| `PressesExit` | the Pro Hub's "Exit admin view" posts `/api/pro/auth/logout`: whenever `hasViewAsCookie()` (a signed, unexpired cookie, valid view or not) it runs `endViewAs`, which deletes the cookie and logs the exit for the admin the cookie names; with no view cookie it signs the dealer out of the Pro Hub |
| `SignsOut`, `SignsIn`, `LosesViewAs` | admin sign-out ends only the admin session; another admin's sign-in; a role change on Users & roles |
| `CookieExpires` | the cookie's `maxAge` and payload expiry (one hour) |
| `Fixed` actions | the code now. `Fixed = FALSE` is the code before the fix: a sync while viewing, a `c` cookie always the base view, Exit ending the view only while it was valid, and no log entry for a replaced view |

`/api/admin/view-as/exit` also calls `endViewAs`, but nothing in the UI posts to it, so the model leaves it out.

## Check a change

1. Read the diff. If it touches nothing above, say so and stop.
2. Update the model so each action matches the new code, with `today.cfg` describing the code as it is.
3. Run each config with the pstack `/statechart` skill, giving it `view.mts` as the view. On Eric's Windows machine the command is `statechart` (or `statechart-wsl`), with an `--out` folder that doesn't exist yet.
4. Compare with the expected results, then render with `node ~/.local/share/pele/render.mjs chart.mmd` and copy the chart, SVG and report into `charts/`.
5. Replay against the real code: from `docs/statecharts/replay/crazy-seal/`, run `node --import ./register-view-as.mjs --test view-as.test.mjs`. It runs the real View as route, `/api/pro/me`, the logout route, `view-as.ts` and `loadProContext` with a fake database, a fake admin sign-in and one fake cookie jar. Each former bug path asserts the fixed behavior, plus the rule that always held and a dealer's own sign-out with no view cookie. All 6 pass on the code now. The Pro Hub access and Shopify copy replays use the shared `fakes.mjs`, whose `view-as.ts` stand-in exports `isViewingAs` and `NO_ACCOUNT_ID` for `context.ts`.

Expected results on the working tree of 2026-11-10, after the fix:

| Config | Rules that break |
|---|---|
| `today.cfg` | none (60 states; the chart draws 9 states and 27 arrows) |
| `before.cfg` | `NothingChangesWhileViewing` (3 steps: A signs in, presses View as on Mike, a page loads), `LogShowsEveryView` (3 steps: View as on Mike twice), `NoBaseViewOnceTheyHaveAnAccount` (4 steps: View as on Ruth, Ruth signs up, a page loads), `ExitEndsTheView` (5 steps: View as on Mike, A signs out, Exit, A signs back in) |

`before.cfg` reaches 576 states, over the chart budget, so its chart draws only the bug paths. The view hides the hour running out, which every view has and which matches its Exit arrow.

## Bug or modeling error?

A new break in `today.cfg` is a finding until you show otherwise: replay its shortest path against the real code. If it doesn't reproduce, fix the model, not the rule. Never weaken a rule to make it pass, and don't change product code unless you were asked to.

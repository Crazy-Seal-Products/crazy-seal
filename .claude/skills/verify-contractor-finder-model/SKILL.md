---
name: verify-contractor-finder-model
description: Recheck the TLA+ model of the public contractor finder (/contractor): what the results beside the map show while a visitor searches by ZIP, uses their location, clears, or follows the menu link back. Use when a change touches src/components/contractor/ContractorFinder.tsx, src/components/contractor/ContractorMap.tsx (how it frames and clears a search), or src/app/api/contractors/zip/route.ts.
---

# Verify the contractor finder model

`docs/statecharts/contractor-finder/ContractorFinder.tla` models one visitor on the finder with two ZIPs, A and B. TLC checks every order of ZIP searches, "Use my location", Clear, the menu link back to /contractor, and the answers to the lookups and the location request, including an answer arriving after a later search's. A pass covers the model, not the whole page.

## Rules

| Rule | In plain words |
|---|---|
| `NeverSwitchesToAnOlderSearch` | The results never switch to a search the visitor has moved on from. |
| `ResultsStayPut` | An answer arriving never takes away the results the visitor is looking at. |
| `LatestSearchShows` | Once nothing is still out, the results are for the visitor's latest search. |
| `SpinnerMeansSearching` | The Search button's spinner shows exactly while a search is still out. |

## Configs

| Config | Describes |
|---|---|
| `today.cfg` (`Fixed = TRUE`) | the code as it is, after the 2026-11-10 fix |
| `before.cfg` (`Fixed = FALSE`) | the code before that fix, kept to show what the fix changed |

## Coverage

Last confirmed against the uncommitted working tree on 2026-11-10 (codex/erics-machine at 96e6068 plus the contractor finder and its fix). Name a commit here only after you confirm the model still describes the code.

| Model action | Code (today) |
|---|---|
| `SearchesZip` | `submit()`: `nearRef.current = false`, `setHere(null)`, then `router.replace(?zip=)` (the `zipParam` effect calls `lookUp`), or `lookUp` again for the same ZIP |
| `LookupAnswers` | `lookUp()`: adds the point to `zipPoints` under its ZIP and takes one entry off `pending` |
| `AsksForLocation` | `locate()`: `nearRef.current = true`, `setHere(null)`, asks the browser unless a request is already out, and `router.replace(?near=me)` |
| `LocationArrives` | `askForLocation`'s callback: `setLocating(false)`, and `setHere(...)` only if `nearRef.current` (?near=me is still the search) |
| `Clears` | `clear()` |
| `LeavesSearch` | the header's "Find a Contractor" link (`/contractor/`) or Back: `?zip=`/`?near=me` leave the address, and leaving `?near=me` drops the location (the `shownParams` check during render) |
| spinner | `busy = pending.length > 0 \|\| locating` |
| results | `origin`: the location while `?near=me` is in the address, else the point for `?zip=` once it's in `zipPoints` |

Not modeled: a page opened at `?near=me` asks for the location once (the `nearParam` effect). The map isn't modeled: `ContractorMap` frames the search whenever the results have one and zooms back out to the US when they don't (`searchFramed` in its framing effect), so it follows the results.

## Check a change

1. Read the diff. If it touches nothing above, say so and stop.
2. Update the model so each action matches the new code, and keep `today.cfg` describing the code as it is.
3. Run each config with the pstack `/statechart` skill, giving it `view.mts` as the view. On Eric's Windows machine the command is `statechart` (or `statechart-wsl`), with an `--out` folder that doesn't exist yet.
4. Compare with the expected results, then copy the new chart and report into `charts/` (`today.*`, `before.*`).
5. Replay in the browser against the dev server. Patch `window.fetch` to hold `/api/contractors/zip/?zip=` answers (keep a queue per ZIP, since the same ZIP can be out twice) and `navigator.geolocation.getCurrentPosition` to hold the location, then release them in the order of the path. Paths that don't change the address replay reliably. On a dev server that another session is editing, an address change sometimes reloads the whole page (the document is fetched again, not the `_rsc` payload), which wipes the harness; that is the dev server, not the finder.

Expected results:

| Config | Rules that break (shortest path) |
|---|---|
| `today.cfg` | none |
| `before.cfg` | `NeverSwitchesToAnOlderSearch` (search a ZIP, tap Use my location, the ZIP's answer arrives), `ResultsStayPut` (search A, search B, B's answer, A's answer: the map goes blank), `LatestSearchShows` (use location, then the menu link: the near-you results stay), `SpinnerMeansSearching` (search A, search B, A's answer turns the spinner off) |

Replayed live against the fixed code on 2026-11-10:
- two lookups for the same ZIP out, the first answers: the spinner stays on until the second does (`SpinnerMeansSearching`)
- tap Use my location (the address becomes `?near=me`, one location request), follow the menu link, release the location: the map stays on its own (`NeverSwitchesToAnOlderSearch`)
- with near-you results up, follow the menu link: back to the map alone, no search pin (`LatestSearchShows`)
- `ResultsStayPut` (A's answer after B's) needs two address changes; every attempt hit the dev server's full reload, so it was not replayed live. `zipPoints` keyed by ZIP is what makes it hold.

Before the fix, the same harness reproduced `SpinnerMeansSearching`, `NeverSwitchesToAnOlderSearch` and `LatestSearchShows`.

## Bug or modeling error?

A new break is a finding until you show otherwise: replay its shortest path against the real page. If it doesn't reproduce, fix the model, not the rule. (On 2026-11-10 a first version of this model assumed `router.replace` reloaded the page because of `trailingSlash: true`; a replay showed Next.js adds the slash and keeps the page, and the model was corrected.) Never weaken a rule to make it pass, and don't change product code unless you were asked to.

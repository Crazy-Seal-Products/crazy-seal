# Statecharts

Each folder models one flow where the order of events matters, checks it with TLC (the TLA+ model checker), and draws the result as a statechart in plain words. Red boxes are states that break a rule; the report gives the shortest path to each one.

| Flow | Folder | Recheck skill |
|---|---|---|
| Who can get into a Pro Hub account | [`pro-access/`](pro-access/) | `verify-pro-access-model` |
| The local copy of Shopify orders | [`shopify-copy/`](shopify-copy/) | `verify-shopify-copy-model` |
| An admin viewing a dealer's Pro Hub (View as) | [`view-as/`](view-as/) | `verify-view-as-model` |
| Contractor records: the dealer-list import, admin edits, page addresses | [`contractor-records/`](contractor-records/) | `verify-contractor-records-model` |
| Quote requests from contractor pages | [`quote-requests/`](quote-requests/) | `verify-quote-requests-model` |
| The public contractor finder's search | [`contractor-finder/`](contractor-finder/) | `verify-contractor-finder-model` |

In the four contractor-era folders (View as, contractor records, quote requests, the finder), `today.cfg` is the code as it is and `before.cfg` the code before its 2026-11-10 fix; their charts follow the same names. The Pro Hub access and Shopify copy folders still use `today.cfg` for the code as it was modeled and `fixed.cfg` for the proposed fix.

`replay/` runs the real code through each bug path with a fake database and a fake Shopify, using plain Node (22.18+) and this repo's installed packages. From `replay/crazy-seal/`:

| Replay | Command |
|---|---|
| Pro Hub access, Shopify copy | `node --import ./register.mjs --test <name>.test.mjs` |
| View as | `node --import ./register-view-as.mjs --test view-as.test.mjs` |
| Contractor records | `node --import ./contractor-records.register.mjs --test contractor-records.test.mjs` |
| Quote requests | `node --import ./register-quote-requests.mjs --test quote-requests.test.mjs` |

The finder runs in the browser, so its replay is a live one against the dev server; `verify-contractor-finder-model` says how.

## Tools

The models are checked and drawn with the `/statechart` skill from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack):

```bash
claude plugin marketplace add cursor/plugins
```

```bash
claude plugin install pstack@cursor-plugins
```

The checker needs Node 22.18+, Java 11+ and `tla2tools.jar` (TLA+ 1.7.4). On a Mac or in Linux it runs as pstack ships it. On Eric's Windows machine, `statechart` runs a patched Windows copy and `statechart-wsl` runs it inside WSL; the Company Engineers repo's `docs/statecharts/README.md` has the setup. Charts are rendered to SVG with Pele (`pele@1.9.0`).

# Statecharts

Each folder models one flow where the order of events matters, checks it with TLC (the TLA+ model checker), and draws the result as a statechart in plain words. Red boxes are states that break a rule; the report gives the shortest path to each one.

| Flow | Folder | Recheck skill |
|---|---|---|
| Who can get into a Pro Hub account | [`pro-access/`](pro-access/) | `verify-pro-access-model` |
| The local copy of Shopify orders | [`shopify-copy/`](shopify-copy/) | `verify-shopify-copy-model` |

`replay/` runs the real code through each bug path with a fake database, a fake Shopify and a fake Gmail, using plain Node (22.18+) and this repo's installed packages: from `replay/crazy-seal/`, `node --import ./register.mjs --test <name>.test.mjs`.

## Tools

The models are checked and drawn with the `/statechart` skill from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack):

```bash
claude plugin marketplace add cursor/plugins
```

```bash
claude plugin install pstack@cursor-plugins
```

The checker needs Node 22.18+, Java 11+ and `tla2tools.jar` (TLA+ 1.7.4). On a Mac or in Linux it runs as pstack ships it. On Eric's Windows machine, `statechart` runs a patched Windows copy and `statechart-wsl` runs it inside WSL; the Company Engineers repo's `docs/statecharts/README.md` has the setup. Charts are rendered to SVG with Pele (`pele@1.9.0`).

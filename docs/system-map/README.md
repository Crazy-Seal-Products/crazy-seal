# System Map

**Last Updated:** 2026-11-23
**Status:** Current. Developer reference only. Never deployed.

A local, isometric map of how this project is built: soft blocks for each area of the code, arrows routed along the grid, packets that travel along them, step-by-step tours, and the pstack statecharts in `docs/statecharts/` drawn the same way. Every Company Engineers project gets the same viewer. Only `config.json` and the map data are different in each project.

## Open it

```bash
npm run map
```

It starts a small server on `http://127.0.0.1:4400` (the next free port if that one is taken) and opens your browser. Use `npm run map -- --no-open` to skip opening the browser. Edits to the map data, the statecharts or their verify skills show up in the open page on their own. Node 20+ and no packages are needed.

| View | What it shows |
|---|---|
| **Map** | The areas of the code and the arrows between them. Click a block for what it is, how it's built, its rules and files. Double-click a block with a number on it to go inside. |
| **Tours** | One story told block by block, like a lesson: each step adds a block and sends a packet along the new arrow. |
| **Flows** | Each pstack statechart: its states as blocks, colored by phase. Rules that break are marked in red, and **Walk the path** steps through the checker's shortest path to the bug. |

Keys: `←` `→` step, `R` replay, `Space` pause, `Esc` go up a level, `F` fit. Drag to move, scroll to zoom. Every view has its own link (for example `#/tour/first-week/3`), so you can send a teammate straight to a step.

## Never deployed

- The folder sits under `docs/` and is listed in `.vercelignore`, so Vercel never uploads it.
- No app code imports it. The site never serves it.
- The server listens on `127.0.0.1` only, answers only to `localhost` and `127.0.0.1`, and only reads files.
- The map holds names and descriptions only. It never reads `.env` files and never connects to a database or the network.

`npm run map:check` fails if any of these stop being true.

## Where the content comes from

`config.json` names the sources:

| Key | Meaning |
|---|---|
| `name` | The project name shown in the header. |
| `data` | The map data: a list of JS files, or an `index.html` whose `<script src>` tags list them. Each file adds to `window.CODEBASE_MAP` (`nodes`, `edges`, `tours`); the format is described at the top of the data file. |
| `statecharts` | The pstack statecharts folder, normally `docs/statecharts`. |
| `port` | The first port to try. |

A piece can name the checked flows that cover it with `flows: ['<folder name>']`. Its panel then links to them.

**Statecharts.** For each `docs/statecharts/<flow>/charts/<config>.mmd` and `<config>.report.md`, the Flows view draws the chart and walks each broken rule's shortest path. Rule sentences and "Left out:" come from the verify skill in `.claude/skills/` that names the folder. These files come from the checker. This page only reads them, so there is no render step and no SVG to keep in sync.

## Rules (from pstack)

These come from Lauren Tan's pstack (`/statechart`, `/create-formal-verification-skill`, `/maintain-formal-verification-skill` and the principle skills). `npm run map:check` checks the ones marked *checked*.

1. **The reader's words.** Label each block with what the reader sees or cares about, not a variable, table or file name. Code names go in "how" and "files". *(checked: labels with camelCase, snake_case, paths or `()`)*
2. **Arrows say what happens.** Write an arrow's label as the event, the way a person sees it happen ("opts in", "the visitor sends the form"). Put a condition in brackets: `you press play [while it loads]`.
3. **About 20 arrows a view.** A busier picture is hard to read. Merge pieces that act the same, or move the detail into a tour. *(checked)*
4. **Everything is reachable.** Every state in a chart can be reached from the start, and every area has an arrow to another area. *(checked)*
5. **One palette for phases, red for broken rules.** Statechart phases use pstack's colors (blue, orange, purple, yellow, teal, tan, pink). Red marks a state that breaks a rule, orange one that breaks it in some cases, a blue ring the shortest path to a bug, and a dashed purple ring a loop that repeats forever.
6. **A finding stays a finding.** Never hide or soften a broken rule to make the picture look clean. Fix the code or the model, then copy in the new chart and report.
7. **Generated files are never edited by hand.** Charts and reports come from the checker. Facts read from code come from the project's refresh script.
8. **True to the code.** Every file a piece names must exist. *(checked)* Each broken rule needs a plain sentence in its verify skill's Rules table. *(checked)*
9. **Honest about scope.** Say what a map or model leaves out (`leftOut` in the map data, "Left out:" in a verify skill). The page shows it.

## Keep it current

```bash
npm run map:check
```

Run it after you change the map data or a statechart. It exits non-zero on errors (a broken reference, a missing file, something that looks like a key, or anything that could deploy the map) and lists warnings for the reading rules.

## Files

| File | What it is | Edit? |
|---|---|---|
| `config.json` | This project's sources and port | Yes |
| `serve.mjs` | The local-only server | Same in every project |
| `check.mjs` | The rules check | Same in every project |
| `lib/load.mjs`, `lib/statecharts.mjs` | Read the map data and the pstack output | Same in every project |
| `viewer/` | The page: `app.js` (views), `stage.js` (drawing, camera, packets), `iso.js` (shapes and arrow routing), `layout.js`, `icons.js` (Lucide, ISC licence), `style.css` | Same in every project |

To change how the map works, change `viewer/` in one project, then copy `viewer/`, `lib/`, `serve.mjs`, `check.mjs` and this README to the others unchanged.

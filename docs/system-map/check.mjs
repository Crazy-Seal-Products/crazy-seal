#!/usr/bin/env node
// Checks the System Map against the rules in README.md. Read-only.
//   npm run map:check
// Errors (exit 1): broken references, missing files, possible secrets, or anything that
// could put the map on the live site. Warnings: the pstack reading rules.

import fs from 'node:fs'
import path from 'node:path'
import { HERE, ROOT, rel, loadConfig, loadMap, dataFiles } from './lib/load.mjs'
import { loadFlows } from './lib/statecharts.mjs'

const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)
const ARROW_BUDGET = 20

const config = loadConfig()
const folder = rel(HERE)

// ---------------------------------------------------------------- never deployed
if (/^(src|public|app|pages|api)\//.test(folder + '/')) err(`${folder} is inside a folder the site builds or serves. Keep it under docs/.`)
const ignore = path.join(ROOT, '.vercelignore')
const lines = fs.existsSync(ignore) ? fs.readFileSync(ignore, 'utf8').split(/\r?\n/).map((l) => l.trim().replace(/^\//, '')) : []
const covered = lines.some((l) => l && !l.startsWith('#') && (folder + '/').startsWith(l.endsWith('/') ? l : l + '/'))
if (!covered) err(`.vercelignore does not list ${folder}/, so Vercel would upload it. Add the line "${folder}/".`)

const importRe = /(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"][^'"]*system-map[^'"]*['"]/
const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(e.name)) out.push(p)
  }
  return out
}
for (const dir of ['src', 'app', 'pages', 'api', 'public'])
  for (const f of walk(path.join(ROOT, dir)))
    if (importRe.test(fs.readFileSync(f, 'utf8'))) err(`${rel(f)} imports from the System Map. App code must never load it.`)

// ---------------------------------------------------------------- nothing secret
const SECRET = /(sk_live_|sk_test_|rk_live_|whsec_|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|eyJhbGciOi|xox[bap]-|ghp_[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30})/
let files = []
try {
  files = dataFiles(config)
} catch (e) {
  err('config.json "data": ' + e.message)
}
for (const f of files) {
  if (!fs.existsSync(f)) {
    err(`Map data file ${rel(f)} is missing.`)
    continue
  }
  const m = fs.readFileSync(f, 'utf8').match(SECRET)
  if (m) err(`${rel(f)} contains something that looks like a key (${m[0].slice(0, 8)}...). Maps hold descriptions only.`)
}

// ---------------------------------------------------------------- the map
let M = null
try {
  M = loadMap(config)
} catch (e) {
  err('Map data does not load: ' + e.message)
}
const flowData = loadFlows(ROOT, config.statecharts || 'docs/statecharts')
const flowIds = new Set(flowData.flows.map((f) => f.id))

if (M) {
  const ids = new Map()
  for (const n of M.nodes) {
    if (ids.has(n.id)) err(`Two pieces have the id "${n.id}".`)
    ids.set(n.id, n)
  }
  const kids = (id) => M.nodes.filter((n) => n.parent === id)
  const codeWords = /\b[a-z]+[A-Z][A-Za-z]+\b|\b\w+_\w+\b|\w\/\w|\.(tsx?|jsx?|mjs|sql)\b|\(\)/
  for (const n of M.nodes) {
    const name = `"${n.label || n.id}" (${n.id})`
    if (!n.label) err(`${n.id} has no label.`)
    else if (codeWords.test(n.label)) warn(`${name}: say it in the reader's words; put code names in "how" or "files", not the label.`)
    if (!n.short) warn(`${name} has no one-line "short".`)
    if (n.parent && !ids.has(n.parent)) err(`${name} sits inside "${n.parent}", which does not exist.`)
    for (const l of n.links || []) if (!ids.has(l)) err(`${name} links to "${l}", which does not exist.`)
    for (const p of [...(n.files || []), ...(n.docs || [])]) if (!fs.existsSync(path.join(ROOT, p))) err(`${name} names ${p}, which does not exist.`)
    for (const f of n.flows || []) if (!flowIds.has(f)) err(`${name} names the flow "${f}", but there is no ${flowData.folder}/${f}/charts/.`)
    const flow = n.flow || []
    for (const [a, b] of flow)
      for (const x of [a, b]) if (ids.get(x)?.parent !== n.id) err(`${name}'s flow uses "${x}", which is not one of its pieces.`)
    if (flow.length > ARROW_BUDGET) warn(`${name} draws ${flow.length} arrows; pstack aims for ${ARROW_BUDGET} or fewer. Merge pieces or move detail into a tour.`)
    if (!n.parent && kids(n.id).length === 0) warn(`${name} is an area with nothing inside it.`)
  }
  const top = M.nodes.filter((n) => !n.parent)
  for (const [a, b] of M.edges || []) for (const x of [a, b]) if (!ids.has(x)) err(`An arrow between areas names "${x}", which does not exist.`)
  if ((M.edges || []).length > ARROW_BUDGET) warn(`The overview draws ${(M.edges || []).length} arrows between areas; pstack aims for ${ARROW_BUDGET} or fewer.`)
  for (const r of top) if (top.length > 1 && !(M.edges || []).some(([a, b]) => a === r.id || b === r.id)) warn(`The area "${r.label}" has no arrow to any other area.`)
  for (const t of M.tours || []) {
    if (!t.steps?.length) warn(`The tour "${t.title}" has no steps.`)
    for (const s of t.steps || []) if (!ids.has(s.node)) err(`The tour "${t.title}" stops at "${s.node}", which does not exist.`)
  }
}

// ---------------------------------------------------------------- the statecharts
for (const f of flowData.flows) {
  const where = flowData.folder + '/' + f.id
  if (!f.spec) warn(`${where} has charts but no .tla model next to them.`)
  if (!f.skill) warn(`${where}: no verify skill in .claude/skills names this folder, so nobody is told to recheck it.`)
  for (const c of f.configs) {
    const name = `${where} (${c.id})`
    if (!c.report) warn(`${name} has a chart but no ${c.id}.report.md; copy the checker's report next to it.`)
    for (const b of c.report?.breaks || []) {
      if (f.skill && !f.skill.rules[b.rule]) warn(`${name}: the rule ${b.rule} breaks, but the verify skill's Rules table has no plain sentence for it.`)
      if (c.chart) {
        const labels = new Set(c.chart.states.map((s) => s.label))
        const missing = b.path.filter((p) => !labels.has(p.state))
        if (missing.length) warn(`${name}: ${missing.length} state(s) on the path to ${b.rule} are not drawn in the chart.`)
      }
    }
    const ch = c.chart
    if (!ch) continue
    if (ch.edges.length > ARROW_BUDGET) warn(`${name} draws ${ch.edges.length} arrows; pstack aims for ${ARROW_BUDGET} or fewer (coarser labels in view.mts, or hide steps the reader does not need).`)
    const reach = new Set(ch.starts)
    for (let grew = true; grew; ) {
      grew = false
      for (const e of ch.edges)
        if (reach.has(e.from) && !reach.has(e.to)) {
          reach.add(e.to)
          grew = true
        }
    }
    const lost = ch.states.filter((s) => !reach.has(s.id))
    if (lost.length) warn(`${name}: ${lost.map((s) => `"${s.label}"`).join(', ')} cannot be reached from the start by any arrow.`)
  }
}

// ---------------------------------------------------------------- report
const head = `${config.name} System Map: ${M ? `${M.nodes.length} pieces, ${(M.tours || []).length} tours` : 'no map'}, ${flowData.flows.length} checked flows`
console.log(head)
for (const e of errors) console.log('  error  ' + e)
for (const w of warnings) console.log('  warn   ' + w)
if (!errors.length && !warnings.length) console.log('  All rules pass.')
else console.log(`  ${errors.length} error(s), ${warnings.length} warning(s).`)
process.exit(errors.length ? 1 : 0)

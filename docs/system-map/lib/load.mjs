// Reads this project's map data and statecharts for the System Map.
// Read-only: it never reads .env files, never connects to a database and never calls the network.

import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { loadFlows } from './statecharts.mjs'

export const HERE = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
export const ROOT = findRoot(HERE)

function findRoot(dir) {
  for (let d = dir; d !== path.dirname(d); d = path.dirname(d))
    if (fs.existsSync(path.join(d, 'package.json'))) return d
  throw new Error('System Map: no package.json above ' + dir)
}

export const rel = (file) => path.relative(ROOT, file).split(path.sep).join('/')

export function loadConfig() {
  const file = path.join(HERE, 'config.json')
  const config = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!config.name) throw new Error('config.json needs a "name"')
  if (!config.data) throw new Error('config.json needs "data": a list of map data files, or the index.html that loads them')
  return config
}

// config.data is a list of JS files (relative to this folder), or one .html file whose
// <script src> tags load them (so an existing page stays the single list of data files).
export function dataFiles(config) {
  if (Array.isArray(config.data)) return config.data.map((f) => path.resolve(HERE, f))
  const page = path.resolve(HERE, config.data)
  const html = fs.readFileSync(page, 'utf8')
  const skip = new Set(config.skipScripts || ['map.js', 'vendor-icons.js'])
  return [...html.matchAll(/<script\s+src="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((src) => !skip.has(src) && !/^https?:/.test(src))
    .map((src) => path.resolve(path.dirname(page), src))
}

export function loadMap(config) {
  const files = dataFiles(config)
  const sandbox = { console: { log() {}, warn() {}, error() {} } }
  sandbox.window = sandbox
  vm.createContext(sandbox)
  for (const file of files)
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: rel(file), timeout: 2000 })
  const map = sandbox.CODEBASE_MAP
  if (!map) throw new Error('No CODEBASE_MAP in ' + files.map(rel).join(', '))
  const plain = JSON.parse(
    JSON.stringify({
      title: map.title,
      updated: map.updated,
      world: map.world,
      leftOut: map.leftOut,
      nodes: map.nodes,
      edges: map.edges,
      tours: map.tours,
    }),
  )
  const generated = sandbox.CODEBASE_MAP_GENERATED
  return {
    project: { name: config.name, root: path.basename(ROOT) },
    ...plain,
    generated: generated ? { generatedAt: generated.generatedAt, commit: generated.commit, facts: generated } : null,
    files: files.map(rel),
  }
}

export function loadAll(config) {
  const out = { map: null, flows: null, errors: [] }
  try {
    out.map = loadMap(config)
  } catch (e) {
    out.errors.push('Map data: ' + e.message)
  }
  try {
    out.flows = loadFlows(ROOT, config.statecharts || 'docs/statecharts')
  } catch (e) {
    out.errors.push('Statecharts: ' + e.message)
  }
  return out
}

// What to watch, and whether a change needs a full page reload (viewer code) or new data.
export function watchedPaths(config) {
  const list = [
    { path: path.join(HERE, 'viewer'), kind: 'reload' },
    { path: path.join(HERE, 'config.json'), kind: 'data' },
  ]
  try {
    for (const f of dataFiles(config)) list.push({ path: f, kind: 'data' })
  } catch {}
  const charts = path.join(ROOT, config.statecharts || 'docs/statecharts')
  if (fs.existsSync(charts)) list.push({ path: charts, kind: 'data' })
  const skills = path.join(ROOT, '.claude', 'skills')
  if (fs.existsSync(skills)) list.push({ path: skills, kind: 'data' })
  return list
}

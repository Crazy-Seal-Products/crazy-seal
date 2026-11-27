// System Map app: three views over one stage.
//   Map    #/  or  #/map/<container>/<selected>   areas, then the pieces inside one
//   Tours  #/tour/<tour>/<step>                    a story, one block at a time
//   Flows  #/flow/<flow>/<config>[/<rule>/<step>]  pstack statecharts, and each bug path

import { Stage } from './stage.js'
import { worldLayout, gridLayout, layeredLayout, snakeLayout } from './layout.js'
import { icon } from './icons.js'
import { blockColors } from './iso.js'

const $ = (s) => document.querySelector(s)
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const enc = encodeURIComponent

// pstack's statechart group colours (references/render.md), light and dark.
const PSTACK = {
  light: { blue: '#c3e0ff', orange: '#f0d3bf', purple: '#e3d5ff', yellow: '#f0dcbf', teal: '#bfe3df', tan: '#e5d9ce', pink: '#ffcbe6' },
  dark: { blue: '#1b3857', orange: '#573117', purple: '#3c2e57', yellow: '#573d17', teal: '#174641', tan: '#3d3127', pink: '#57233e' },
}
const MARK_WORDS = {
  breaks: 'Breaks a rule',
  mayBreak: 'Breaks a rule in some cases',
  bugPath: 'On the shortest path to a bug',
  repeats: 'Repeats forever',
}
const STATUS = {
  stable: 'Stable',
  'in-progress': 'In progress',
  'built-not-live': 'Built, not live',
  'admin-only': 'Admin only',
  retired: 'Retired',
  'needs-review': 'Needs review',
}

const S = { data: null, idx: new Map(), kids: new Map(), back: new Map(), dark: false, paused: false, lastKey: null }

// ------------------------------------------------------------------ helpers

function md(text) {
  if (!text) return ''
  const inline = (t) =>
    esc(t)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  return String(text)
    .split(/\n\s*\n/)
    .map((block) => {
      let html = ''
      let list = []
      const flush = () => {
        if (list.length) html += '<ul>' + list.map((l) => `<li>${inline(l)}</li>`).join('') + '</ul>'
        list = []
      }
      for (const line of block.split('\n')) {
        const m = line.match(/^\s*[-*] (.*)$/)
        if (m) list.push(m[1])
        else {
          flush()
          if (line.trim()) html += `<p>${inline(line)}</p>`
        }
      }
      flush()
      return html
    })
    .join('')
}

function toast(msg) {
  const t = $('#toast')
  t.textContent = msg
  t.hidden = false
  clearTimeout(toast.t)
  toast.t = setTimeout(() => (t.hidden = true), 1600)
}

const store = {
  get(k) {
    try {
      return localStorage.getItem('system-map:' + k)
    } catch {
      return null
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('system-map:' + k, v)
    } catch {}
  },
}

// ------------------------------------------------------------------ data

const map = () => S.data?.map
const flows = () => S.data?.flows?.flows || []
const tours = () => map()?.tours || []
const realms = () => (map()?.nodes || []).filter((n) => !n.parent)

function index(data) {
  S.data = data
  S.idx = new Map()
  S.kids = new Map()
  S.back = new Map()
  for (const n of data.map?.nodes || []) S.idx.set(n.id, n)
  for (const n of data.map?.nodes || []) {
    if (n.parent) (S.kids.get(n.parent) || S.kids.set(n.parent, []).get(n.parent)).push(n)
    for (const l of n.links || []) (S.back.get(l) || S.back.set(l, []).get(l)).push(n.id)
  }
}

function realmOf(id) {
  let n = S.idx.get(id)
  while (n?.parent) n = S.idx.get(n.parent)
  return n
}
const colorOf = (id) => S.idx.get(id)?.color || realmOf(id)?.color || '#cfc6b6'
const iconOf = (id) => S.idx.get(id)?.icon || realmOf(id)?.icon || 'box'
const kidsOf = (id) => S.kids.get(id) || []
const where = (id) => {
  const n = S.idx.get(id)
  return `#/map/${n?.parent ? enc(n.parent) : '_'}/${enc(id)}`
}

// ------------------------------------------------------------------ routing

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const mode = parts[0] || 'map'
  if (mode === 'tour') return { mode, tour: parts[1], step: Number(parts[2]) || 1 }
  if (mode === 'flow') return { mode, flow: parts[1], config: parts[2], rule: parts[3], step: Number(parts[4]) || 0 }
  return { mode: 'map', container: parts[1] && parts[1] !== '_' ? parts[1] : null, sel: parts[2] || null }
}

function go(hash) {
  if (location.hash === hash) render()
  else location.hash = hash
}

// ------------------------------------------------------------------ render

let stage

function render({ replay = false } = {}) {
  if (!S.data) return
  hideTooltip()
  const r = parseRoute()
  document.querySelectorAll('.tab').forEach((t) => (t.dataset.tab === r.mode ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current')))
  if (replay) S.lastKey = null
  const view = r.mode === 'tour' ? renderTour(r) : r.mode === 'flow' ? renderFlow(r) : renderMap(r)
  if (!view) return
  const fresh = view.scene.key !== S.lastKey
  stage.render(view.scene, { fit: replay || fresh ? view.fit || true : false })
  S.lastKey = view.scene.key
  $('#crumbs').innerHTML = view.crumbs.map((c) => (c.href ? `<a href="${c.href}">${esc(c.label)}</a>` : `<span>${esc(c.label)}</span>`)).join('<span class="sep">/</span>')
  $('#title').textContent = view.title
  $('#subtitle').textContent = view.subtitle || ''
  $('#legend').innerHTML = view.legend || ''
  $('#panel').innerHTML = errors() + view.panel
  const tl = $('#timeline')
  tl.hidden = !view.timeline
  tl.innerHTML = view.timeline || ''
  document.title = `${view.title} · ${map()?.project?.name || 'System Map'}`
  if (view.after) view.after()
  renderDrawer()
}

function errors() {
  const list = S.data?.errors || []
  return list.length ? `<div class="error-box">${list.map(esc).join('<br>')}</div>` : ''
}

const packetLegend = (kinds = ['request', 'reply', 'job']) =>
  kinds.map((k) => `<span><i class="dot" style="background:var(--${k})"></i>${{ request: 'request', reply: 'reply', job: 'background job' }[k]}</span>`).join('')

// ---------------------------------------------------------------- map view

function renderMap(r) {
  const M = map()
  if (!M) return emptyView('No map data', 'Check config.json and the data files it names.')
  let container = r.container ? S.idx.get(r.container) : null
  if (container && !kidsOf(container.id).length) {
    go(where(container.id))
    return null
  }
  const items = container ? kidsOf(container.id) : realms()
  const ids = new Set(items.map((n) => n.id))
  const sel = r.sel && S.idx.has(r.sel) ? r.sel : null
  const selNode = sel ? S.idx.get(sel) : null
  const neighbours = new Set(sel ? [sel, ...(selNode.links || []), ...(S.back.get(sel) || [])] : [])

  let pos
  let edges = []
  if (!container) {
    pos = worldLayout(items, M.world)
    edges = (M.edges || [])
      .filter(([a, b]) => ids.has(a) && ids.has(b))
      .map(([a, b, label], i) => ({ id: `e${i}:${a}>${b}`, from: a, to: b, label, labelMode: 'always' }))
  } else {
    const flow = (container.flow || []).filter(([a, b]) => ids.has(a) && ids.has(b))
    const inFlow = [...new Set(flow.flatMap(([a, b]) => [a, b]))]
    const rest = items.map((n) => n.id).filter((id) => !inFlow.includes(id))
    if (inFlow.length) {
      pos = layeredLayout(inFlow, flow.map(([from, to]) => ({ from, to })), [flow[0][0]], { lx: 5, ly: 5.2 })
      const ys = [...pos.values()].map((p) => p[1])
      const xs = [...pos.values()].map((p) => p[0])
      const g = gridLayout(rest, 4.2, Math.max(2, Math.round((Math.max(...xs) - Math.min(...xs)) / 4.2) + 1))
      for (const [id, p] of g) pos.set(id, [p[0] + (Math.min(...xs) + Math.max(...xs)) / 2, p[1] + Math.max(...ys) + 4.6 + (g.size > 1 ? 1.5 : 0)])
    } else pos = gridLayout(items.map((n) => n.id), 4.2)
    edges = flow.map(([a, b, label], i) => ({ id: `f${i}:${a}>${b}`, from: a, to: b, label, labelMode: 'always' }))
    const seen = new Set(flow.map(([a, b]) => [a, b].sort().join('|')))
    const links = []
    for (const n of items)
      for (const l of n.links || []) {
        const k = [n.id, l].sort().join('|')
        if (ids.has(l) && !seen.has(k)) {
          seen.add(k)
          links.push({ id: `l:${n.id}>${l}`, from: n.id, to: l, labelMode: 'never', dashed: true, link: true })
        }
      }
    edges.push(...links.filter((e) => links.length <= 20 || e.from === sel || e.to === sel))
  }
  for (const e of edges) {
    if (!sel) e.state = e.link ? 'dim' : 'normal'
    else e.state = e.from === sel || e.to === sel ? 'hot' : 'dim'
  }

  const big = !container
  const nodes = items.map((n) => {
    const p = pos.get(n.id)
    const kids = kidsOf(n.id).length
    return {
      id: n.id,
      gx: p[0],
      gy: p[1],
      a: big ? 1.22 : 1,
      h: big ? 74 : 58,
      shape: n.shape || 'cube',
      color: colorOf(n.id),
      icon: iconOf(n.id),
      label: n.label,
      badge: kids ? `${kids}` : null,
      dashed: n.status === 'built-not-live' || n.status === 'retired',
      state: sel && !neighbours.has(n.id) ? 'dim' : 'normal',
      focus: n.id === sel,
    }
  })
  const plates = []
  if (container && pos.size) {
    const xs = [...pos.values()].map((p) => p[0])
    const ys = [...pos.values()].map((p) => p[1])
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    plates.push({ id: 'plate', gx: (x0 + x1) / 2, gy: (y0 + y1) / 2, ax: (x1 - x0) / 2 + 2.1, ay: (y1 - y0) / 2 + 2.1, label: container.label, color: colorOf(container.id) })
  }

  const crumbs = [{ label: 'Map', href: '#/' }]
  const chain = []
  for (let c = container; c; c = c.parent ? S.idx.get(c.parent) : null) chain.unshift(c)
  for (const c of chain) crumbs.push({ label: c.label, href: `#/map/${enc(c.id)}` })
  const title = container ? container.label : M.project?.name || M.title
  const subtitle = container ? container.short : `${realms().length} areas and ${M.nodes.length - realms().length} pieces. Click a block for details, double-click to go inside.`
  const legend =
    packetLegend(['request']) +
    `<span><i class="sw" style="background:var(--chip)"></i>number = pieces inside</span><span><i class="dash"></i>${container ? 'connects to' : 'built, not live'}</span>`

  const panel = sel ? nodePanel(selNode) : container ? nodePanel(container, true) : overviewPanel()
  const ambient = edges.filter((e) => (sel ? e.state === 'hot' : !e.link)).map((e) => e.id)
  return {
    scene: { key: 'map:' + (container?.id || '_'), nodes, edges, plates },
    crumbs,
    title,
    subtitle,
    legend,
    panel,
    after: () => stage.setAmbient(ambient, sel ? 900 : 1400),
  }
}

function overviewPanel() {
  const M = map()
  const gen = M.generated
  const flowList = flows()
  const broken = flowList.reduce((s, f) => s + (f.configs[0]?.report?.breaks.length || 0), 0)
  return `
    <section class="card panel-card">
      <div class="kicker"><span class="chip">Whole system</span>${M.updated ? `<span class="chip quiet">Updated ${esc(M.updated)}</span>` : ''}</div>
      <h2>${esc(M.project?.name || M.title)}</h2>
      <div class="stats">
        <div class="stat"><b>${realms().length}</b><span>areas</span></div>
        <div class="stat"><b>${M.nodes.length - realms().length}</b><span>pieces</span></div>
        <div class="stat"><b>${tours().length}</b><span>tours</span></div>
        <div class="stat"><b>${flowList.length}</b><span>checked flows</span></div>
      </div>
      <p class="short">A baseline of how ${esc(M.project?.name || 'this project')} is built. Each block is an area of the code; each arrow says how one leads to another. Double-click a block to go inside it.</p>
      ${gen ? `<p class="muted">Facts read from the code${gen.commit ? ` at <code>${esc(gen.commit)}</code>` : ''}${gen.generatedAt ? ` on ${esc(gen.generatedAt.slice(0, 10))}` : ''}.</p>` : ''}
    </section>
    ${tours().length ? `<section class="card panel-card"><h3>Tours</h3><div class="list">${tours().map((t) => `<a class="row-link" href="#/tour/${enc(t.id)}/1">${icon('footprints', 16)}<span class="grow"><b>${esc(t.title)}</b><span class="meta">${esc(t.blurb || '')}</span></span><span class="meta">${t.steps.length}</span></a>`).join('')}</div></section>` : ''}
    <section class="card panel-card"><h3>Checked flows</h3>${flowList.length ? `<div class="list">${flowList.map(flowRow).join('')}</div>${broken ? `<p class="muted">${broken} rule${broken === 1 ? '' : 's'} break in the current code.</p>` : ''}` : noFlowsHelp()}</section>
    ${M.leftOut ? `<section class="card panel-card"><h3>What this map leaves out</h3>${md(M.leftOut)}</section>` : ''}`
}

function flowRow(f) {
  const cur = f.configs[0]
  const n = cur?.report?.breaks.length || 0
  return `<a class="row-link" href="#/flow/${enc(f.id)}/${enc(cur?.id || '')}">${icon('workflow', 16)}<span class="grow"><b>${esc(f.title)}</b><span class="meta">${f.configs.map((c) => esc(c.id)).join(' · ')}</span></span>${n ? `<span class="chip bad">${n} break</span>` : `<span class="chip good">holds</span>`}</a>`
}

function noFlowsHelp() {
  return `<p class="muted">No statecharts yet. Model a flow where the order of events matters with pstack's <code>/statechart</code> skill, and save its <code>charts/&lt;config&gt;.mmd</code> and <code>.report.md</code> under <code>${esc(S.data.flows?.folder || 'docs/statecharts')}/&lt;flow&gt;/</code>. It shows up here on its own.</p>`
}

function nodePanel(n, isContainer = false) {
  const realm = realmOf(n.id)
  const kids = kidsOf(n.id)
  const links = (n.links || []).filter((l) => S.idx.has(l))
  const backs = (S.back.get(n.id) || []).filter((l) => !links.includes(l))
  const chip = (id) => `<button type="button" class="link-chip" data-go="${esc(where(id))}"><i class="sw" style="background:${colorOf(id)}"></i>${esc(S.idx.get(id).label)}</button>`
  const paths = (list) => `<div class="paths">${list.map((p) => `<button type="button" class="path-chip" data-copy="${esc(p)}" title="Copy">${esc(p)}</button>`).join('')}</div>`
  const flowRefs = (n.flows || []).map((id) => flows().find((f) => f.id === id)).filter(Boolean)
  return `
    <section class="card panel-card">
      <div class="kicker">
        ${realm && realm.id !== n.id ? `<span class="chip"><i class="sw" style="background:${colorOf(n.id)}"></i>${esc(realm.label)}</span>` : `<span class="chip"><i class="sw" style="background:${colorOf(n.id)}"></i>Area</span>`}
        ${n.status ? `<span class="chip quiet">${esc(STATUS[n.status] || n.status)}</span>` : ''}
        ${n.route ? `<span class="chip quiet">${esc(n.route)}</span>` : ''}
      </div>
      <h2>${esc(n.label)}</h2>
      ${n.short ? `<p class="short">${esc(n.short)}</p>` : ''}
      ${kids.length && !isContainer ? `<div class="btn-row"><a class="btn go" href="#/map/${enc(n.id)}">Open inside: ${kids.length} pieces ${icon('arrow-right', 16)}</a></div>` : ''}
      ${n.what ? `<h3>What it is</h3>${md(n.what)}` : ''}
      ${n.how ? `<h3>How it's built</h3>${md(n.how)}` : ''}
      ${n.rules?.length ? `<h3>Rules that keep it working</h3><ul>${n.rules.map((r) => `<li>${md(r).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul>` : ''}
      ${flowRefs.length ? `<h3>Checked flows</h3><div class="list">${flowRefs.map(flowRow).join('')}</div>` : ''}
      ${links.length ? `<h3>Connects to</h3><div class="links">${links.map(chip).join('')}</div>` : ''}
      ${backs.length ? `<h3>Used by</h3><div class="links">${backs.map(chip).join('')}</div>` : ''}
      ${n.files?.length ? `<h3>Files</h3>${paths(n.files)}` : ''}
      ${n.docs?.length ? `<h3>Docs</h3>${paths(n.docs)}` : ''}
      ${n.live ? live(n.live) : ''}
    </section>
    ${isContainer && kids.length ? `<section class="card panel-card"><h3>Inside</h3><div class="list">${kids.map((k) => `<a class="row-link" href="${where(k.id)}"><i class="sw" style="background:${colorOf(k.id)}"></i><span class="grow"><b>${esc(k.label)}</b><span class="meta">${esc(k.short || '')}</span></span>${kidsOf(k.id).length ? `<span class="meta">${kidsOf(k.id).length}</span>` : ''}</a>`).join('')}</div></section>` : ''}`
}

// Facts the project's refresh script read from the code, shown as a short list.
function live(key) {
  const g = map().generated
  if (!g) return ''
  const v = key === 'crons' ? g.facts.vercel?.crons : g.facts[key]
  if (v == null) return ''
  const name = (x) => (typeof x === 'object' && x ? x.label || x.title || x.name || x.id || x.path || x.words || '' : String(x))
  let body = ''
  if (Array.isArray(v)) body = `<ul>${v.slice(0, 12).map((x) => `<li>${esc(name(x))}${x?.href ? ` <code>${esc(x.href)}</code>` : x?.path && name(x) !== x.path ? ` <code>${esc(x.path)}</code>` : ''}</li>`).join('')}</ul>${v.length > 12 ? `<p class="muted">and ${v.length - 12} more</p>` : ''}`
  else if (typeof v === 'object') {
    const nums = Object.entries(v).filter(([, x]) => typeof x === 'number')
    const arrs = Object.entries(v).filter(([, x]) => Array.isArray(x))
    const strs = Object.entries(v).filter(([, x]) => typeof x === 'string')
    body =
      (nums.length ? `<div class="stats">${nums.map(([k, x]) => `<div class="stat"><b>${x}</b><span>${esc(k.replace(/([A-Z])/g, ' $1').toLowerCase())}</span></div>`).join('')}</div>` : '') +
      strs.map(([k, x]) => `<p><span class="muted">${esc(k)}:</span> ${esc(x)}</p>`).join('') +
      arrs.map(([k, x]) => `<p><span class="muted">${esc(k)}:</span> ${x.length}${x.length ? ', e.g. ' + x.slice(0, 5).map(name).map(esc).join(', ') : ''}</p>`).join('')
  }
  return `<h3>Live from the code</h3><div class="note-box">${body}<p class="muted">Read by the refresh script${g.commit ? ` at <code>${esc(g.commit)}</code>` : ''}.</p></div>`
}

// ---------------------------------------------------------------- tour view

function renderTour(r) {
  const list = tours()
  if (!list.length) return emptyView('No tours yet', 'Add tours to the map data: { id, title, blurb, steps: [{ node, text }] }.', 'tour')
  const tour = list.find((t) => t.id === r.tour) || list[0]
  if (tour.id !== r.tour) {
    go(`#/tour/${enc(tour.id)}/1`)
    return null
  }
  const steps = tour.steps.filter((s) => S.idx.has(s.node))
  const n = Math.min(Math.max(1, r.step), steps.length)
  const order = []
  const first = new Map()
  steps.forEach((s, i) => {
    if (!first.has(s.node)) {
      first.set(s.node, i)
      order.push(s.node)
    }
  })
  const pos = snakeLayout(order, 4, 4.4)
  const cur = steps[n - 1]
  const nodes = order
    .filter((id) => first.get(id) < n)
    .map((id) => ({
      id,
      gx: pos.get(id)[0],
      gy: pos.get(id)[1],
      a: 1,
      h: 58,
      color: colorOf(id),
      icon: iconOf(id),
      label: S.idx.get(id).label,
      focus: id === cur.node,
      state: 'normal',
    }))
  const edges = []
  const seenPair = new Set()
  for (let i = 1; i < n; i++) {
    const a = steps[i - 1].node
    const b = steps[i].node
    if (a === b) continue
    const k = a + '>' + b
    const hot = i === n - 1
    if (seenPair.has(k)) {
      if (hot) edges.find((e) => e.pair === k).state = 'hot'
      continue
    }
    seenPair.add(k)
    edges.push({ id: `t${i}`, pair: k, from: a, to: b, state: hot ? 'hot' : 'normal' })
  }
  const hotEdge = edges.find((e) => e.state === 'hot')
  const node = S.idx.get(cur.node)
  const realm = realmOf(cur.node)
  const visible = nodes.map((x) => x.id)
  const panel = `
    <section class="card panel-card">
      <div class="kicker"><span class="chip">Step ${n} / ${steps.length}</span><span class="chip quiet"><i class="sw" style="background:${colorOf(cur.node)};width:9px;height:9px;border-radius:50%;border:1.2px solid var(--line)"></i>${esc(realm?.label || '')}</span></div>
      <h2>${esc(node.label)}</h2>
      ${md(cur.text)}
      <div class="btn-row">
        <a class="btn" ${n > 1 ? `href="#/tour/${enc(tour.id)}/${n - 1}"` : 'aria-disabled="true" style="opacity:.45;pointer-events:none"'}>${icon('arrow-left', 16)} Back</a>
        <a class="btn go" ${n < steps.length ? `href="#/tour/${enc(tour.id)}/${n + 1}"` : `href="#/"`}>${n < steps.length ? `Next: ${esc(S.idx.get(steps[n].node).label)}` : 'Back to the map'} ${icon('arrow-right', 16)}</a>
      </div>
      <div class="keys"><span><kbd>←</kbd> <kbd>→</kbd> step</span><span><kbd>R</kbd> replay</span><span><kbd>Space</kbd> pause</span></div>
    </section>
    <section class="card panel-card">
      <h3>About this piece</h3>
      <p class="short">${esc(node.short || '')}</p>
      <div class="btn-row"><a class="btn" href="${where(node.id)}">${icon('map', 16)} See it on the map</a></div>
    </section>
    <section class="card panel-card"><h3>Other tours</h3><div class="list">${list.filter((t) => t !== tour).map((t) => `<a class="row-link" href="#/tour/${enc(t.id)}/1">${icon('footprints', 16)}<span class="grow"><b>${esc(t.title)}</b></span><span class="meta">${t.steps.length}</span></a>`).join('')}</div></section>`
  const timeline = timelineHtml(
    'In this tour',
    steps.map((s, i) => ({ href: `#/tour/${enc(tour.id)}/${i + 1}`, cap: S.idx.get(s.node).label, state: i + 1 < n ? 'done' : i + 1 === n ? 'now' : '' })),
    n,
  )
  return {
    scene: { key: 'tour:' + tour.id, nodes, edges },
    fit: visible,
    crumbs: [{ label: 'Tours', href: '#/tour' }, { label: tour.title }],
    title: tour.title,
    subtitle: tour.blurb,
    legend: packetLegend(['request']) + `<span><i class="ring" style="border-color:var(--focus)"></i>this step</span>`,
    panel,
    timeline,
    after: () => {
      stage.fit(visible)
      if (hotEdge) stage.pulse(hotEdge.id, { kind: 'request', delay: 250 })
    },
  }
}

function timelineHtml(head, items, n) {
  return `<div class="timeline-head"><span>${esc(head)}</span><span>Step ${n} of ${items.length}</span></div>
    <div class="dots">${items.map((it, i) => `<a class="tdot ${it.state}" href="${it.href}" title="${esc(it.cap)}"><span class="n">${it.label ?? i + 1}</span><span class="cap">${esc(it.cap)}</span></a>`).join('')}</div>`
}

// ---------------------------------------------------------------- flow view

function renderFlow(r) {
  const list = flows()
  if (!list.length)
    return {
      ...emptyView('No checked flows yet', 'Statecharts from pstack appear here.', 'flow'),
      panel: `<section class="card panel-card"><h2>Checked flows</h2>${noFlowsHelp()}</section>`,
    }
  const flow = list.find((f) => f.id === r.flow) || list[0]
  const cfg = flow.configs.find((c) => c.id === r.config) || flow.configs[0]
  if (flow.id !== r.flow || cfg.id !== r.config) {
    go(`#/flow/${enc(flow.id)}/${enc(cfg.id)}`)
    return null
  }
  const chart = cfg.chart
  const report = cfg.report
  const rules = flow.skill?.rules || {}
  const bug = r.rule ? report?.breaks.find((b) => b.rule === r.rule) : null
  const base = `#/flow/${enc(flow.id)}/${enc(cfg.id)}`
  const crumbs = [{ label: 'Flows', href: '#/flow' }, { label: flow.title, href: `#/flow/${enc(flow.id)}` }, { label: cfg.id, href: base }]
  if (bug) crumbs.push({ label: bug.rule })

  const tabs = `<div class="cfg-tabs">${flow.configs.map((c) => `<a class="cfg-tab" href="#/flow/${enc(flow.id)}/${enc(c.id)}" ${c === cfg ? 'aria-current="page"' : ''}>${c.report?.breaks.length ? '<i class="bad-dot"></i>' : ''}${esc(c.id)}</a>`).join('')}</div>`
  const files = [flow.spec, flow.view, ...cfg.files, flow.skill ? `.claude/skills/${flow.skill.name}/SKILL.md` : null].filter(Boolean)

  if (!chart) {
    return {
      scene: { key: 'flow:' + flow.id + ':' + cfg.id, nodes: [], edges: [], note: 'The checker drew no chart for this config.' },
      crumbs,
      title: flow.title,
      subtitle: `Config ${cfg.id}`,
      legend: '',
      panel: flowPanel(flow, cfg, tabs, files, rules, base),
    }
  }

  const byLabel = new Map(chart.states.map((s) => [s.label, s.id]))
  const ids = chart.states.map((s) => s.id)
  const pos = layeredLayout(ids, chart.edges, chart.starts, { lx: 5.4, ly: 4.6 })
  const pal = PSTACK[S.dark ? 'dark' : 'light']
  const path = bug ? bug.path.map((p) => byLabel.get(p.state) || null) : []
  const k = bug ? Math.min(Math.max(0, r.step), bug.path.length - 1) : 0
  const visited = new Set(path.slice(0, k + 1).filter(Boolean))
  const current = bug ? path[k] : null
  const focusId = current || (S.flowSel && pos.has(S.flowSel) ? S.flowSel : null)

  const nodes = chart.states.map((s) => {
    const p = pos.get(s.id)
    const marks = bug ? s.marks.filter((m) => m === 'breaks' || m === 'mayBreak').filter(() => s.id === current && k === bug.path.length - 1) : s.marks
    const top = pal[s.group] || (S.dark ? '#3a362f' : '#e8e1d4')
    return {
      id: s.id,
      gx: p[0],
      gy: p[1],
      a: 0.66,
      h: 30,
      colors: blockColors(top, { dark: S.dark, pastel: false }),
      label: s.label,
      pill: true,
      pillW: 170,
      marks: bug && visited.has(s.id) && s.id !== current ? [...marks, 'bugPath'] : marks,
      focus: s.id === focusId,
      state: bug ? (visited.has(s.id) ? 'normal' : 'dim') : focusId && s.id !== focusId && !chart.edges.some((e) => (e.from === focusId && e.to === s.id) || (e.to === focusId && e.from === s.id)) ? 'dim' : 'normal',
    }
  })
  const starts = chart.starts.filter((s) => pos.has(s))
  for (const [i, s] of starts.entries()) {
    const p = pos.get(s)
    nodes.push({ id: '__start' + i, gx: p[0] - 3.2, gy: p[1], a: 0.3, h: 0, shape: 'start', state: bug && k > 0 ? 'dim' : 'normal' })
  }
  let hotEdge = null
  const edges = chart.edges.map((e, i) => {
    const id = `c${i}`
    let state = 'normal'
    let isBug = false
    if (bug) {
      state = 'dim'
      for (let j = 1; j <= k; j++) {
        if (path[j - 1] === e.from && path[j] === e.to && (!bug.path[j].step || e.label.startsWith(bug.path[j].step.split(' [')[0]))) {
          state = j === k ? 'hot' : 'normal'
          isBug = true
          if (j === k) hotEdge = id
        }
      }
    } else if (focusId) state = e.from === focusId || e.to === focusId ? 'hot' : 'dim'
    return { id, from: e.from, to: e.to, label: e.label, labelMode: 'hot', state, bug: isBug && state === 'hot' }
  })
  if (bug && !hotEdge && k > 0) {
    const e = edges.find((x) => x.from === path[k - 1] && x.to === path[k])
    if (e) {
      e.state = 'hot'
      e.bug = true
      hotEdge = e.id
    }
  }
  starts.forEach((s, i) => edges.push({ id: 'start' + i, from: '__start' + i, to: s, state: bug && k > 0 ? 'dim' : 'normal' }))

  const groups = Object.entries(Object.fromEntries(chart.legend.filter((l) => pal[l.cls]).map((l) => [l.cls, l.label])))
  const usedMarks = [...new Set(chart.states.flatMap((s) => s.marks))]
  const legend =
    groups.map(([cls, label]) => `<span><i class="sw" style="background:${pal[cls]}"></i>${esc(label)}</span>`).join('') +
    usedMarks.map((m) => (m === 'breaks' || m === 'mayBreak' ? `<span><i class="sw" style="background:var(--bad-bg);border-color:${m === 'breaks' ? 'var(--bad)' : '#e8730c'}"></i>${MARK_WORDS[m]}</span>` : `<span><i class="ring" style="border-color:${m === 'bugPath' ? 'var(--bug)' : '#9b35d6'}"></i>${MARK_WORDS[m]}</span>`)).join('')

  let panel
  let timeline = null
  if (bug) {
    const step = bug.path[k]
    const last = k === bug.path.length - 1
    panel = `
      <section class="card panel-card">
        <div class="kicker"><span class="chip bad">Breaks</span><span class="chip quiet">${esc(bug.rule)}</span></div>
        <h2>${esc(rules[bug.rule] || bug.rule)}</h2>
        <div class="note-box ${last ? 'bad' : ''}">
          <p class="muted">Step ${k} of ${bug.path.length - 1}</p>
          ${k === 0 ? `<p>It starts here: <strong>${esc(step.state)}</strong>.</p>` : `<p>Then <strong>${esc(step.step)}</strong>.</p><p>Now: <strong>${esc(step.state)}</strong>${last ? ', and the rule breaks.' : '.'}</p>`}
          ${!current ? '<p class="muted">The chart does not draw this state.</p>' : ''}
        </div>
        ${last && bug.loop ? `<p>${esc(bug.loop)}</p>` : ''}
        <div class="btn-row">
          <a class="btn" ${k > 0 ? `href="${base}/${enc(bug.rule)}/${k - 1}"` : 'aria-disabled="true" style="opacity:.45;pointer-events:none"'}>${icon('arrow-left', 16)} Back</a>
          <a class="btn go" href="${last ? base : `${base}/${enc(bug.rule)}/${k + 1}`}">${last ? 'Done' : 'Next step'} ${icon('arrow-right', 16)}</a>
        </div>
        <div class="keys"><span><kbd>←</kbd> <kbd>→</kbd> step</span><span><kbd>R</kbd> replay</span><span><kbd>Esc</kbd> back to the chart</span></div>
      </section>
      ${flowPanel(flow, cfg, tabs, files, rules, base)}`
    timeline = timelineHtml(
      'Shortest path to the bug',
      bug.path.map((p, i) => ({ href: `${base}/${enc(bug.rule)}/${i}`, label: i, cap: i ? p.step : p.state, state: i < k ? 'done' : i === k ? 'now' + (i === bug.path.length - 1 ? ' bad' : '') : '' })),
      k + 1,
    )
  } else {
    const sel = focusId && chart.states.find((s) => s.id === focusId)
    panel = (sel ? statePanel(sel, chart) : '') + flowPanel(flow, cfg, tabs, files, rules, base)
  }
  return {
    scene: { key: 'flow:' + flow.id + ':' + cfg.id + (bug ? ':' + bug.rule : ''), nodes, edges },
    crumbs,
    title: flow.title,
    subtitle: report?.summary[0] || '',
    legend,
    panel,
    timeline,
    after: () => {
      if (hotEdge) stage.pulse(hotEdge, { kind: 'bug', delay: 200 })
      else if (focusId) stage.setAmbient(edges.filter((e) => e.state === 'hot').map((e) => e.id), 900)
      else stage.setAmbient(edges.filter((e) => !e.id.startsWith('start')).map((e) => e.id), 1100)
    },
  }
}

function statePanel(s, chart) {
  const out = chart.edges.filter((e) => e.from === s.id)
  const inn = chart.edges.filter((e) => e.to === s.id)
  const label = (id) => chart.states.find((x) => x.id === id)?.label || id
  const group = chart.legend.find((l) => l.cls === s.group)?.label
  return `<section class="card panel-card">
    <div class="kicker">${group ? `<span class="chip"><i class="sw" style="background:${PSTACK[S.dark ? 'dark' : 'light'][s.group]}"></i>${esc(group)}</span>` : ''}${s.marks.map((m) => `<span class="chip ${m === 'breaks' || m === 'mayBreak' ? 'bad' : 'quiet'}">${esc(MARK_WORDS[m])}</span>`).join('')}</div>
    <h2>${esc(s.label)}</h2>
    ${out.length ? `<h3>What can happen next</h3><ul>${out.map((e) => `<li>${esc(e.label)} → <strong>${esc(label(e.to))}</strong></li>`).join('')}</ul>` : '<p class="muted">Nothing happens after this.</p>'}
    ${inn.length ? `<h3>How you get here</h3><ul>${inn.map((e) => `<li>from <strong>${esc(label(e.from))}</strong>: ${esc(e.label)}</li>`).join('')}</ul>` : ''}
  </section>`
}

function flowPanel(flow, cfg, tabs, files, rules, base) {
  const rep = cfg.report
  const breaks = rep?.breaks || []
  const ruleRow = (name, kind, bug) => `
    <div class="rule ${kind === 'bad' ? 'bad' : ''}">
      <div class="kicker"><span class="chip ${kind}">${kind === 'bad' ? 'Breaks' : kind === 'good' ? 'Holds' : 'Not checked'}</span><span class="name">${esc(name)}</span></div>
      <div>${esc(rules[name] || (name === 'NoDeadlock' ? 'Every state has a way forward, or is a proper end.' : name))}</div>
      ${bug ? `<a class="btn" href="${base}/${enc(name)}/0">${icon('play', 14)} Walk the path: ${bug.path.length - 1} steps</a>` : ''}
    </div>`
  return `
    <section class="card panel-card">
      <div class="kicker"><span class="chip">Checked flow</span>${breaks.length ? `<span class="chip bad">${breaks.length} rule${breaks.length === 1 ? '' : 's'} break</span>` : `<span class="chip good">All rules hold</span>`}</div>
      <h2>${esc(flow.title)}</h2>
      ${tabs}
      ${(rep?.summary || []).map((l) => `<p class="muted">${esc(l)}</p>`).join('')}
      <h3>Rules</h3>
      ${breaks.map((b) => ruleRow(b.rule, 'bad', b)).join('')}
      ${(rep?.holds || []).map((n) => ruleRow(n, 'good')).join('')}
      ${(rep?.notChecked || []).map((n) => ruleRow(n, 'quiet')).join('')}
      ${flow.skill?.leftOut ? `<h3>What the model leaves out</h3><p>${md(flow.skill.leftOut).replace(/^<p>|<\/p>$/g, '')}</p>` : ''}
      <h3>Files</h3><div class="paths">${files.map((p) => `<button type="button" class="path-chip" data-copy="${esc(p)}" title="Copy">${esc(p)}</button>`).join('')}</div>
      ${flow.skill ? `<p class="muted" style="margin-top:10px">Recheck after a change with the <code>${esc(flow.skill.name)}</code> skill.</p>` : ''}
    </section>
    <section class="card panel-card"><h3>Other flows</h3><div class="list">${flows().filter((f) => f !== flow).map(flowRow).join('')}</div></section>`
}

function emptyView(title, text, mode = 'map') {
  return {
    scene: { key: 'empty:' + mode, nodes: [], edges: [], note: title },
    crumbs: [{ label: { map: 'Map', tour: 'Tours', flow: 'Flows' }[mode] }],
    title,
    subtitle: text,
    legend: '',
    panel: `<section class="card panel-card"><h2>${esc(title)}</h2><p>${esc(text)}</p></section>`,
  }
}

// ------------------------------------------------------------------ drawer

function renderDrawer() {
  const d = $('#drawer')
  const cur = location.hash || '#/'
  const a = (href, html, extra = '') => `<a href="${href}" ${cur === href ? 'aria-current="page"' : ''} ${extra}>${html}</a>`
  d.innerHTML = `
    <div class="drawer-head"><strong>${esc(map()?.project?.name || '')}</strong><button type="button" class="icon-btn small" id="drawer-close" aria-label="Close">${icon('x', 16)}</button></div>
    <h2>Map</h2>
    ${a('#/', `${icon('layout-grid', 16)}Whole system`)}
    ${realms().map((n) => a(`#/map/${enc(n.id)}`, `<i class="sw" style="background:${colorOf(n.id)}"></i>${esc(n.label)}<span class="meta">${kidsOf(n.id).length}</span>`)).join('')}
    <h2>Tours</h2>
    ${tours().map((t) => a(`#/tour/${enc(t.id)}/1`, `${icon('footprints', 16)}${esc(t.title)}<span class="meta">${t.steps.length}</span>`)).join('') || '<p class="muted">None yet.</p>'}
    <h2>Flows</h2>
    ${flows().map((f) => a(`#/flow/${enc(f.id)}/${enc(f.configs[0]?.id || '')}`, `${icon('workflow', 16)}${esc(f.title)}`) + f.configs.map((c) => a(`#/flow/${enc(f.id)}/${enc(c.id)}`, `${esc(c.id)}${c.report?.breaks.length ? `<span class="meta bad">${c.report.breaks.length} break</span>` : ''}`, 'class="sub"')).join('')).join('') || '<p class="muted">None yet.</p>'}`
  d.querySelector('#drawer-close').onclick = closeDrawer
}

function openDrawer() {
  $('#drawer').hidden = false
  $('#scrim').hidden = false
  $('#menu').setAttribute('aria-expanded', 'true')
  $('#drawer').querySelector('a[aria-current]')?.focus()
}
function closeDrawer() {
  $('#drawer').hidden = true
  $('#scrim').hidden = true
  $('#menu').setAttribute('aria-expanded', 'false')
}

// ------------------------------------------------------------------ tooltip

function showTooltip(id, x, y) {
  const t = $('#tooltip')
  const r = parseRoute()
  let html = ''
  if (r.mode === 'flow') {
    const f = flows().find((f) => f.id === r.flow)
    const s = f?.configs.find((c) => c.id === r.config)?.chart?.states.find((s) => s.id === id)
    if (s) html = `<b>${esc(s.label)}</b><span class="muted">Click for what can happen next</span>`
  } else {
    const n = S.idx.get(id)
    if (n) html = `<b>${esc(n.label)}</b>${esc(n.short || '')}${kidsOf(id).length && r.mode === 'map' ? `<br><span class="muted">Double-click to go inside</span>` : ''}`
  }
  if (!html) return hideTooltip()
  t.innerHTML = html
  t.hidden = false
  const w = t.offsetWidth
  t.style.left = Math.min(innerWidth - w - 12, x + 14) + 'px'
  t.style.top = y + 16 + 'px'
}
function hideTooltip() {
  $('#tooltip').hidden = true
}

// ------------------------------------------------------------------ input

function select(id) {
  const r = parseRoute()
  if (r.mode === 'map') {
    if (id && !S.idx.has(id)) return
    go(`#/map/${r.container ? enc(r.container) : '_'}${id ? '/' + enc(id) : ''}`)
  } else if (r.mode === 'flow') {
    if (r.rule) return
    S.flowSel = id && !id.startsWith('__start') ? id : null
    render()
  } else if (r.mode === 'tour' && id) {
    const t = tours().find((t) => t.id === r.tour)
    const i = t?.steps.findIndex((s) => s.node === id)
    if (i >= 0) go(`#/tour/${enc(t.id)}/${i + 1}`)
  }
}

function open(id) {
  const r = parseRoute()
  if (r.mode !== 'map') return
  if (kidsOf(id).length) go(`#/map/${enc(id)}`)
}

function stepBy(d) {
  const r = parseRoute()
  if (r.mode === 'tour') {
    const t = tours().find((t) => t.id === r.tour)
    const n = Math.min(Math.max(1, r.step + d), t.steps.length)
    if (n !== r.step) go(`#/tour/${enc(t.id)}/${n}`)
  } else if (r.mode === 'flow' && r.rule) {
    const f = flows().find((f) => f.id === r.flow)
    const bug = f?.configs.find((c) => c.id === r.config)?.report?.breaks.find((b) => b.rule === r.rule)
    if (!bug) return
    const n = Math.min(Math.max(0, r.step + d), bug.path.length - 1)
    if (n !== r.step) go(`#/flow/${enc(r.flow)}/${enc(r.config)}/${enc(r.rule)}/${n}`)
  }
}

function up() {
  const r = parseRoute()
  if (!$('#drawer').hidden) return closeDrawer()
  if (r.mode === 'map') {
    if (r.sel) return go(`#/map/${r.container ? enc(r.container) : '_'}`)
    const c = r.container && S.idx.get(r.container)
    if (c) go(c.parent ? `#/map/${enc(c.parent)}/${enc(c.id)}` : `#/map/_/${enc(c.id)}`)
  } else if (r.mode === 'flow') {
    if (r.rule) go(`#/flow/${enc(r.flow)}/${enc(r.config)}`)
    else if (S.flowSel) {
      S.flowSel = null
      render()
    }
  } else go('#/')
}

function setTheme(dark, save) {
  S.dark = dark
  stage.dark = dark
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  $('#theme').innerHTML = icon(dark ? 'sun' : 'moon')
  if (save) store.set('theme', dark ? 'dark' : 'light')
}

function setPaused(p) {
  S.paused = p
  stage.setPaused(p)
  $('#pause').innerHTML = icon(p ? 'play' : 'pause', 16)
  $('#pause').setAttribute('aria-pressed', String(p))
  $('#pause').setAttribute('aria-label', p ? 'Play the animation' : 'Pause the animation')
}

// ------------------------------------------------------------------ boot

async function load() {
  try {
    const res = await fetch('/api/all', { cache: 'no-store' })
    index(await res.json())
  } catch (e) {
    index({ map: null, flows: null, errors: ['Could not reach the System Map server: ' + e.message] })
  }
  $('#project').textContent = map()?.project?.name || 'System Map'
  $('#count-tours').textContent = tours().length || ''
  $('#count-flows').textContent = flows().length || ''
  document.querySelector('.tab[data-tab="tour"]').href = tours()[0] ? `#/tour/${enc(tours()[0].id)}/1` : '#/tour'
  document.querySelector('.tab[data-tab="flow"]').href = flows()[0] ? `#/flow/${enc(flows()[0].id)}/${enc(flows()[0].configs[0]?.id || '')}` : '#/flow'
}

async function boot() {
  stage = new Stage($('#stage'), {
    onSelect: (id) => select(id),
    onOpen: (id) => open(id),
    onHover: (id, x, y) => (id ? showTooltip(id, x, y) : hideTooltip()),
  })
  const saved = store.get('theme')
  setTheme(saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches, false)
  $('#menu').innerHTML = icon('menu')
  $('#fit').innerHTML = icon('maximize', 16)
  $('#replay').innerHTML = icon('rotate-ccw', 16)
  setPaused(false)
  $('#menu').onclick = openDrawer
  $('#scrim').onclick = closeDrawer
  $('#theme').onclick = () => {
    setTheme(!S.dark, true)
    render({ replay: false })
  }
  $('#fit').onclick = () => stage.fit()
  $('#replay').onclick = () => render({ replay: true })
  $('#pause').onclick = () => setPaused(!S.paused)
  document.addEventListener('click', (ev) => {
    const copy = ev.target.closest('[data-copy]')
    if (copy) {
      navigator.clipboard?.writeText(copy.dataset.copy).then(() => toast('Copied ' + copy.dataset.copy), () => toast(copy.dataset.copy))
      return
    }
    const nav = ev.target.closest('[data-go]')
    if (nav) go(nav.dataset.go)
    if (ev.target.closest('#drawer a')) closeDrawer()
  })
  document.addEventListener('keydown', (ev) => {
    if (ev.target.closest('input, textarea, select') || ev.metaKey || ev.ctrlKey || ev.altKey) return
    if (ev.key === 'ArrowRight') stepBy(1)
    else if (ev.key === 'ArrowLeft') stepBy(-1)
    else if (ev.key === 'Escape') up()
    else if (ev.key === 'r' || ev.key === 'R') render({ replay: true })
    else if (ev.key === 'f' || ev.key === 'F') stage.fit()
    else if (ev.key === ' ' && !ev.target.closest('button, a')) setPaused(!S.paused)
    else return
    ev.preventDefault()
  })
  addEventListener('hashchange', () => {
    S.flowSel = null
    render()
  })
  await load()
  render()
  try {
    const events = new EventSource('/api/events')
    events.onmessage = async (ev) => {
      if (ev.data === 'reload') return location.reload()
      await load()
      render()
      toast('Updated from disk')
    }
  } catch {}
}

boot()

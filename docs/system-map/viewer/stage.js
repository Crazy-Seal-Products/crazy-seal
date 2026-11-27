// The stage: draws a scene of blocks and links in isometric SVG, moves the camera,
// pops blocks in, and sends packets along links.
//
// A scene is plain data:
//   { key, plates: [{ id, gx, gy, ax, ay, label, color }],
//     nodes: [{ id, gx, gy, a, h, shape, color | colors, icon, label, sub, pill, badge,
//               state: 'normal'|'dim'|'ghost', focus, ring, marks: [], dashed, order }],
//     edges: [{ id, from, to, label, labelMode: 'always'|'hot'|'never', state: 'normal'|'dim'|'hot', dashed }] }

import { iso, cube, store, person, startDot, plate, route, linkPath, blockColors, footprint, rounded, mix } from './iso.js'
import { ICONS } from './icons.js'

const NS = 'http://www.w3.org/2000/svg'
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// pstack statechart marks (references/render.md), as block colours.
const MARK = {
  light: {
    breaks: { top: '#ffecee', left: '#f7d3d6', right: '#eebcc0', stroke: '#e72e3b', ink: '#cd2834' },
    mayBreak: { top: '#fff3e6', left: '#f9e0c6', right: '#f0cca7', stroke: '#e8730c', ink: '#b85a06' },
    bugPath: '#1680f3',
    repeats: '#9b35d6',
  },
  dark: {
    breaks: { top: '#3a2427', left: '#2e2021', right: '#26191b', stroke: '#cf2b35', ink: '#ff6463' },
    mayBreak: { top: '#3a2f1e', left: '#2e2619', right: '#251f14', stroke: '#d0700f', ink: '#ffa257' },
    bugPath: '#116dd2',
    repeats: '#9a3fcf',
  },
}

const overlaps = (a, b) => a[0] < b[0] + b[2] + 4 && b[0] < a[0] + a[2] + 4 && a[1] < b[1] + b[3] + 3 && b[1] < a[1] + a[3] + 3

let canvas
function measure(text, size, weight = 600) {
  canvas ||= document.createElement('canvas').getContext('2d')
  canvas.font = `${weight} ${size}px ${getComputedStyle(document.documentElement).getPropertyValue('--font')}`
  return canvas.measureText(text).width
}

function wrap(text, size, maxW, maxLines, weight) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w
    if (measure(next, size, weight) <= maxW || !cur) cur = next
    else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  const fits = lines.length <= maxLines && lines.every((l) => measure(l, size, weight) <= maxW)
  if (lines.length > maxLines) {
    lines.length = maxLines
    let last = lines[maxLines - 1]
    while (last.length > 1 && measure(last + '…', size, weight) > maxW) last = last.slice(0, -1)
    lines[maxLines - 1] = last.replace(/[\s,.:;]+$/, '') + '…'
  }
  return { lines, fits }
}

function fitText(text, maxW, maxLines, sizes = [13, 12, 11, 10], weight = 650) {
  for (const s of sizes) {
    const r = wrap(text, s, maxW, maxLines, weight)
    if (r.fits) return { ...r, size: s }
  }
  const s = sizes.at(-1)
  return { ...wrap(text, s, maxW, maxLines, weight), size: s }
}

function textBlock(lines, x, cy, size, cls, fill) {
  const lh = size * 1.2
  const y0 = cy - ((lines.length - 1) * lh) / 2
  return (
    `<text class="${cls}" x="${x}" y="${y0}" font-size="${size}" text-anchor="middle" dominant-baseline="central"${fill ? ` fill="${fill}"` : ''}>` +
    lines.map((l, i) => `<tspan x="${x}" y="${(y0 + i * lh).toFixed(1)}">${esc(l)}</tspan>`).join('') +
    `</text>`
  )
}

export function pill(x, y, text, { maxW = 150, lines = 3, size = 11, dot, cls = '' } = {}) {
  const t = wrap(text, size, maxW, lines, 600)
  const w = Math.max(...t.lines.map((l) => measure(l, size, 600))) + 20 + (dot ? 12 : 0)
  const lh = size * 1.25
  const h = t.lines.length * lh + 10
  const left = x - w / 2
  const tx = x + (dot ? 6 : 0)
  return {
    svg:
      `<g class="pill ${cls}"><rect x="${left.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(11, h / 2)}"/>` +
      (dot ? `<circle cx="${(left + 12).toFixed(1)}" cy="${(y + h / 2).toFixed(1)}" r="4" fill="${dot}" class="pill-dot"/>` : '') +
      textBlock(t.lines, tx.toFixed(1), y + h / 2, size, 'pill-text') +
      `</g>`,
    box: [left, y, w, h],
  }
}

export class Stage {
  constructor(host, handlers = {}) {
    this.host = host
    this.h = handlers
    this.dark = false
    this.paused = false
    this.seen = new Set()
    this.key = null
    this.packets = new Set()
    this.edgeEls = new Map()
    this.bounds = new Map()
    this.vb = { x: -500, y: -320, w: 1000, h: 640 }
    this.cam = null
    host.innerHTML = `
      <svg class="stage-svg" xmlns="${NS}" role="img" aria-label="Isometric map">
        <defs>
          <pattern id="iso-grid" width="64" height="32" patternUnits="userSpaceOnUse">
            <path d="M0 0L64 32M0 32L64 0" class="grid-line"/>
          </pattern>
          <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
          <marker id="mk-normal" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1.5 1.5L8.5 5L1.5 8.5Z" class="mk mk-normal"/></marker>
          <marker id="mk-hot" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1.5 1.5L8.5 5L1.5 8.5Z" class="mk mk-hot"/></marker>
          <marker id="mk-dim" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1.5 1.5L8.5 5L1.5 8.5Z" class="mk mk-dim"/></marker>
          <marker id="mk-bug" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1.5 1.5L8.5 5L1.5 8.5Z" class="mk mk-bug"/></marker>
        </defs>
        <rect class="bg" x="-50000" y="-50000" width="100000" height="100000"/>
        <rect class="grid" x="-50000" y="-50000" width="100000" height="100000" fill="url(#iso-grid)"/>
        <g class="l-plates"></g><g class="l-edges"></g><g class="l-nodes"></g><g class="l-labels"></g><g class="l-packets"></g>
        <text class="stage-note" x="0" y="0" text-anchor="middle"></text>
      </svg>`
    this.svg = host.querySelector('svg')
    this.L = Object.fromEntries(['plates', 'edges', 'nodes', 'labels', 'packets'].map((k) => [k, this.svg.querySelector('.l-' + k)]))
    this.note = this.svg.querySelector('.stage-note')
    this.bindInput()
    new ResizeObserver(() => this.applyView()).observe(host)
    const tick = (now) => {
      this.step(now)
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)
  }

  // ---------------------------------------------------------------- rendering

  render(scene, { fit = false } = {}) {
    this.stopPackets()
    clearInterval(this.ambientTimer)
    if (scene.key !== this.key) this.seen = new Set()
    this.key = scene.key
    this.scene = scene
    const dark = this.dark
    const marks = MARK[dark ? 'dark' : 'light']
    const stroke = dark ? '#0d0c0a' : '#2b2823'
    this.stroke = stroke
    this.edgeEls.clear()
    this.bounds.clear()

    let plates = ''
    const plateBounds = []
    for (const p of scene.plates || []) {
      const fill = mix(p.color || '#d8cfbf', dark ? '#24221e' : '#f7f2e8', dark ? 0.84 : 0.8)
      plates += `<g class="plate">${plate(p, fill, dark ? '#4a453d' : '#b7ab97')}`
      const corner = iso(p.gx - p.ax, p.gy + p.ay, 10)
      if (p.label) plates += pill(corner[0] + 18, corner[1] + 14, p.label, { maxW: 260, lines: 1, size: 12, cls: 'plate-pill' }).svg
      plates += `</g>`
      const f = footprint(p)
      plateBounds.push([Math.min(...f.map((q) => q[0])), Math.min(...f.map((q) => q[1])) - 10, Math.max(...f.map((q) => q[0])), Math.max(...f.map((q) => q[1])) + 30])
    }
    this.L.plates.innerHTML = plates
    plateBounds.forEach((b, i) => this.bounds.set('__plate' + i, b))

    const blocks = new Map()
    const ordered = [...scene.nodes].sort((a, b) => a.gx + a.gy - (b.gx + b.gy) || a.gx - b.gx)
    let nodesSvg = ''
    let labelsSvg = ''
    let popIndex = 0
    for (const n of ordered) {
      const a = n.a ?? 1
      const b = { gx: n.gx, gy: n.gy, ax: n.ax ?? a, ay: n.ay ?? a, h: n.h ?? 56 }
      let c = n.colors || blockColors(n.color || '#cfc6b6', { dark, pastel: n.pastel !== false })
      let edge = stroke
      let ink = c.ink
      const mk = n.marks || []
      const bad = mk.includes('breaks') ? marks.breaks : mk.includes('mayBreak') ? marks.mayBreak : null
      if (bad) {
        c = { ...c, top: bad.top, left: bad.left, right: bad.right }
        edge = bad.stroke
        ink = bad.ink
      }
      const shape = n.shape === 'store' ? store : n.shape === 'person' ? person : n.shape === 'start' ? startDot : cube
      const sh = shape(b, c, { stroke: edge, dashed: n.dashed, sw: bad ? 2.8 : 2.2 })
      blocks.set(n.id, { ...b, hull: sh.hull })

      const isNew = !this.seen.has(n.id)
      this.seen.add(n.id)
      const pop = isNew && !reduced()
      const delay = pop ? Math.min(popIndex++ * 45, 700) : 0
      let g = `<g class="node ${n.state || 'normal'}${pop ? ' pop' : ''}${n.focus ? ' focus' : ''}" data-id="${esc(n.id)}" style="${pop ? `animation-delay:${delay}ms` : ''}">`
      const shadow = footprint({ ...b, gx: b.gx + 0.16, gy: b.gy + 0.16 }, 0.1)
      if (n.shape !== 'person' && n.shape !== 'start')
        g += `<path class="shadow" d="${rounded(shadow, 10, true)}" filter="url(#soft)"/>`
      const rings = []
      if (n.focus) rings.push(['ring-focus', ''])
      if (mk.includes('bugPath')) rings.push(['ring-bug', ` style="stroke:${marks.bugPath}"`])
      if (mk.includes('repeats')) rings.push(['ring-repeats', ` style="stroke:${marks.repeats}"`])
      if (n.ring) rings.push(['ring-custom', ` style="stroke:${n.ring}"`])
      rings.forEach(([cls, style], i) => {
        g += `<path class="ring ${cls}" d="${rounded(footprint(b, 0.32 + i * 0.22), 12, true)}"${style}/>`
      })
      g += `<g class="lift">${sh.svg}`
      if (n.icon && ICONS[n.icon] && sh.top) {
        const s = n.iconSize || (b.ax >= 1 ? 22 : 16)
        g += `<svg class="icon" x="${(sh.top[0] - s / 2).toFixed(1)}" y="${(sh.top[1] - s / 2).toFixed(1)}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c.topInk || stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n.icon]}</svg>`
      } else if (n.topText && sh.top) {
        g += `<text class="top-text" x="${sh.top[0].toFixed(1)}" y="${sh.top[1].toFixed(1)}" text-anchor="middle" dominant-baseline="central" fill="${c.topInk || stroke}">${esc(n.topText)}</text>`
      }
      const onFace = !n.pill && sh.face && sh.faceH >= 40 && n.label
      if (onFace) {
        const t = fitText(n.label, sh.faceW, sh.faceH >= 64 ? 3 : 2, b.ax >= 1.15 ? [14, 13, 12, 11, 10] : [12.5, 11.5, 10.5, 9.5])
        const lh = t.size * 1.2
        const cy = sh.face[1] - sh.faceW / 9 + (n.sub ? -lh * 0.45 : 0)
        g += textBlock(t.lines, sh.face[0].toFixed(1), cy, t.size, 'face-text', ink)
        if (n.sub) g += textBlock([n.sub], sh.face[0].toFixed(1), cy + ((t.lines.length + 0.4) * lh) / 2 + 6, Math.max(9, t.size - 2.5), 'face-sub', ink)
      }
      if (n.badge != null && sh.top) {
        const p = iso(b.gx + b.ax * 0.55, b.gy - b.ay * 0.55, b.h)
        g += `<g class="badge"><rect x="${(p[0] - 4).toFixed(1)}" y="${(p[1] - 20).toFixed(1)}" width="${String(n.badge).length * 7 + 14}" height="18" rx="9"/><text x="${(p[0] + 3 + String(n.badge).length * 3.5).toFixed(1)}" y="${(p[1] - 10.5).toFixed(1)}" text-anchor="middle" dominant-baseline="central">${esc(n.badge)}</text></g>`
      }
      g += `</g></g>`
      nodesSvg += g

      let box = null
      if ((!onFace || n.pill) && n.label && n.shape !== 'start') {
        const p = pill(sh.foot[0], sh.foot[1] + 10, n.label, { maxW: n.pillW || 160, lines: 3, size: 11, dot: n.pillDot, cls: `node-pill ${n.state || ''}${bad ? ' bad' : ''}` })
        labelsSvg += `<g class="label-for ${n.state || 'normal'}${pop ? ' pop' : ''}" data-id="${esc(n.id)}" style="${pop ? `animation-delay:${delay + 120}ms` : ''}">${p.svg}</g>`
        box = p.box
      }
      const xs = sh.hull.map((p) => p[0])
      const ys = sh.hull.map((p) => p[1])
      let x0 = Math.min(...xs)
      let y0 = Math.min(...ys)
      let x1 = Math.max(...xs)
      let y1 = Math.max(...ys)
      if (box) {
        x0 = Math.min(x0, box[0])
        x1 = Math.max(x1, box[0] + box[2])
        y1 = Math.max(y1, box[1] + box[3])
      }
      this.bounds.set(n.id, [x0, y0 - 24, x1, y1])
    }
    this.L.nodes.innerHTML = nodesSvg

    const pairs = new Map()
    const placed = []
    const blocked = [...this.bounds.entries()].filter(([id]) => !id.startsWith('__plate')).map(([, b]) => [b[0] + 6, b[1] + 30, b[2] - b[0] - 12, b[3] - b[1] - 34])
    let edgesSvg = ''
    for (const e of scene.edges || []) {
      const A = blocks.get(e.from)
      const B = blocks.get(e.to)
      if (!A || !B || e.from === e.to) continue
      const k = [e.from, e.to].sort().join('|')
      const lane = pairs.get(k) || 0
      pairs.set(k, lane + 1)
      const pts = route(A, B, [...blocks.values()], lane === 0 ? 0 : lane % 2 ? lane : -lane)
      if (!pts) continue
      const { d, label, pts: spts } = linkPath(pts, 0, B.hull)
      const state = e.state || 'normal'
      const mk = e.bug ? 'bug' : state === 'hot' ? 'hot' : state === 'dim' ? 'dim' : 'normal'
      const isNew = !this.seen.has('edge:' + e.id)
      this.seen.add('edge:' + e.id)
      edgesSvg += `<path class="edge ${state}${e.dashed ? ' dashed' : ''}${e.bug ? ' bug' : ''}${isNew && !e.dashed && !reduced() ? ' draw' : ''}" data-edge="${esc(e.id)}" d="${d}" marker-end="url(#mk-${mk})">${e.label ? `<title>${esc(e.label)}</title>` : ''}</path>`
      if (e.label && (e.labelMode === 'always' || (e.labelMode === 'hot' && state === 'hot'))) {
        // Slide the label along its arrow until it covers no block and no other label;
        // a label with no free spot is left off (it still shows on hover and when hot).
        const opts = { maxW: e.labelW || 190, lines: 3, size: 10.5, cls: `edge-pill ${state}${e.bug ? ' bug' : ''}` }
        const segs = []
        for (let i = 1; i < spts.length; i++) segs.push([spts[i - 1], spts[i], Math.hypot(spts[i][0] - spts[i - 1][0], spts[i][1] - spts[i - 1][1])])
        segs.sort((a, b) => b[2] - a[2])
        const spots = [label]
        for (const [a, b] of segs) for (const t of [0.5, 0.32, 0.68, 0.18, 0.82]) spots.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
        let chosen = null
        for (const at of spots) {
          const probe = pill(at[0], at[1], e.label, opts)
          const p = pill(at[0], at[1] - probe.box[3] / 2, e.label, opts)
          if (!blocked.some((b) => overlaps(b, p.box)) && !placed.some((b) => overlaps(b, p.box))) {
            chosen = p
            break
          }
        }
        if (!chosen && state === 'hot') chosen = pill(label[0], label[1] - 11, e.label, opts)
        if (chosen) {
          placed.push(chosen.box)
          labelsSvg += `<g class="edge-label ${state}">${chosen.svg}</g>`
        }
      }
    }
    this.L.edges.innerHTML = edgesSvg
    this.L.labels.innerHTML = labelsSvg
    for (const el of this.L.edges.querySelectorAll('path.edge')) {
      this.edgeEls.set(el.dataset.edge, el)
      if (el.classList.contains('draw')) el.style.setProperty('--len', el.getTotalLength().toFixed(1))
    }
    this.note.textContent = scene.note || ''
    if (scene.note) {
      const v = this.vb
      this.note.setAttribute('x', 0)
      this.note.setAttribute('y', 0)
      if (!scene.nodes.length) this.vb = { x: -v.w / 2, y: -v.h / 2, w: v.w, h: v.h }
    }
    if (fit) this.fit(fit === true ? null : fit)
    this.applyView()
  }

  // ---------------------------------------------------------------- camera

  fit(ids = null, animate = true) {
    const list = ids ? ids.map((id) => this.bounds.get(id)).filter(Boolean) : [...this.bounds.values()]
    if (!list.length) return
    let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
    for (const b of list) {
      x0 = Math.min(x0, b[0])
      y0 = Math.min(y0, b[1])
      x1 = Math.max(x1, b[2])
      y1 = Math.max(y1, b[3])
    }
    const pad = 56
    const { width, height } = this.host.getBoundingClientRect()
    const aspect = width / Math.max(1, height)
    let w = x1 - x0 + pad * 2
    let h = y1 - y0 + pad * 2
    const minW = ids && ids.length <= 2 ? 760 : 520
    if (w < minW) w = minW
    if (w / h > aspect) h = w / aspect
    else w = h * aspect
    const target = { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h }
    if (!animate || reduced()) {
      this.vb = target
      this.cam = null
      this.applyView()
    } else this.cam = { from: { ...this.vb }, to: target, t0: performance.now(), dur: 650 }
  }

  applyView() {
    const { width, height } = this.host.getBoundingClientRect()
    if (!width || !height) return
    const v = this.vb
    const aspect = width / height
    const cx = v.x + v.w / 2
    const cy = v.y + v.h / 2
    let w = v.w
    let h = v.h
    if (w / h > aspect) h = w / aspect
    else w = h * aspect
    this.vb = { x: cx - w / 2, y: cy - h / 2, w, h }
    this.svg.setAttribute('viewBox', `${this.vb.x.toFixed(1)} ${this.vb.y.toFixed(1)} ${this.vb.w.toFixed(1)} ${this.vb.h.toFixed(1)}`)
    this.svg.style.setProperty('--zoom', (this.vb.w / width).toFixed(3))
  }

  zoomBy(k, cx, cy) {
    const v = this.vb
    const w = Math.min(9000, Math.max(260, v.w * k))
    const s = w / v.w
    const px = cx ?? v.x + v.w / 2
    const py = cy ?? v.y + v.h / 2
    this.cam = null
    this.vb = { x: px - (px - v.x) * s, y: py - (py - v.y) * s, w, h: v.h * s }
    this.applyView()
  }

  toWorld(clientX, clientY) {
    const r = this.svg.getBoundingClientRect()
    return [this.vb.x + ((clientX - r.left) / r.width) * this.vb.w, this.vb.y + ((clientY - r.top) / r.height) * this.vb.h]
  }

  bindInput() {
    let drag = null
    const svg = this.svg
    svg.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return
      drag = { x: ev.clientX, y: ev.clientY, vb: { ...this.vb }, moved: false, node: ev.target.closest('[data-id]')?.dataset.id }
      svg.setPointerCapture(ev.pointerId)
    })
    svg.addEventListener('pointermove', (ev) => {
      if (!drag) {
        const id = ev.target.closest('[data-id]')?.dataset.id
        if (id !== this.hoverId) {
          this.hoverId = id
          this.h.onHover?.(id, ev.clientX, ev.clientY)
        } else if (id) this.h.onHover?.(id, ev.clientX, ev.clientY)
        return
      }
      const dx = ev.clientX - drag.x
      const dy = ev.clientY - drag.y
      if (!drag.moved && Math.hypot(dx, dy) < 4) return
      drag.moved = true
      svg.classList.add('panning')
      const r = svg.getBoundingClientRect()
      this.cam = null
      this.vb = { ...drag.vb, x: drag.vb.x - (dx / r.width) * drag.vb.w, y: drag.vb.y - (dy / r.height) * drag.vb.h }
      this.applyView()
    })
    const end = (ev) => {
      if (!drag) return
      svg.classList.remove('panning')
      if (!drag.moved) this.h.onSelect?.(drag.node || null, ev)
      drag = null
    }
    svg.addEventListener('pointerup', end)
    svg.addEventListener('pointercancel', () => (drag = null))
    svg.addEventListener('pointerleave', () => {
      this.hoverId = null
      this.h.onHover?.(null)
    })
    svg.addEventListener('dblclick', (ev) => {
      const id = ev.target.closest('[data-id]')?.dataset.id
      if (id) this.h.onOpen?.(id)
    })
    svg.addEventListener(
      'wheel',
      (ev) => {
        ev.preventDefault()
        const [x, y] = this.toWorld(ev.clientX, ev.clientY)
        this.zoomBy(Math.exp(ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0016)), x, y)
      },
      { passive: false },
    )
  }

  // ---------------------------------------------------------------- packets

  pulse(edgeId, { kind = 'request', reverse = false, delay = 0, duration } = {}) {
    const path = this.edgeEls.get(edgeId)
    if (!path || reduced()) return Promise.resolve()
    const len = path.getTotalLength()
    const dur = duration || Math.max(650, Math.min(1700, len * 3.4))
    const g = document.createElementNS(NS, 'g')
    g.setAttribute('class', `packet ${kind}`)
    g.innerHTML = `<circle class="trail" r="4"/><circle class="dot" r="6"/>`
    g.style.opacity = 0
    this.L.packets.appendChild(g)
    return new Promise((res) =>
      this.packets.add({ path, len, g, t0: performance.now() + delay, dur, reverse, res }),
    )
  }

  setAmbient(edgeIds, every = 1300) {
    clearInterval(this.ambientTimer)
    if (!edgeIds.length || reduced()) return
    let i = 0
    const fire = () => {
      if (this.paused || document.hidden) return
      const e = edgeIds[i++ % edgeIds.length]
      this.pulse(typeof e === 'string' ? e : e.id, { kind: e.kind || 'request' })
    }
    fire()
    this.ambientTimer = setInterval(fire, every)
  }

  stopPackets() {
    for (const p of this.packets) {
      p.g.remove()
      p.res()
    }
    this.packets.clear()
  }

  setPaused(p) {
    if (p === this.paused) return
    const now = performance.now()
    if (p) this.pausedAt = now
    else for (const k of this.packets) k.t0 += now - this.pausedAt
    this.paused = p
  }

  step(now) {
    if (this.cam) {
      const { from, to, t0, dur } = this.cam
      const t = Math.min(1, (now - t0) / dur)
      const k = ease(t)
      this.vb = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k, w: from.w + (to.w - from.w) * k, h: from.h + (to.h - from.h) * k }
      this.applyView()
      if (t >= 1) this.cam = null
    }
    if (this.paused) return
    for (const p of this.packets) {
      const t = (now - p.t0) / p.dur
      if (t < 0) continue
      if (t >= 1) {
        p.g.remove()
        this.packets.delete(p)
        p.res()
        continue
      }
      const at = (u) => {
        const v = Math.max(0, Math.min(1, u))
        return p.path.getPointAtLength((p.reverse ? 1 - v : v) * p.len)
      }
      const k = ease(t)
      const a = at(k)
      const b = at(k - 0.06)
      const [dot, trail] = [p.g.querySelector('.dot'), p.g.querySelector('.trail')]
      dot.setAttribute('cx', a.x.toFixed(1))
      dot.setAttribute('cy', a.y.toFixed(1))
      trail.setAttribute('cx', b.x.toFixed(1))
      trail.setAttribute('cy', b.y.toFixed(1))
      p.g.style.opacity = t < 0.08 ? t / 0.08 : t > 0.9 ? (1 - t) / 0.1 : 1
    }
  }
}

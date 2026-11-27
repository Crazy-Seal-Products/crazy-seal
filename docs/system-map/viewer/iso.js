// Isometric drawing: grid-to-screen projection, block shapes and links routed along the grid.
// One grid unit is TW px wide and TH px tall on screen (2:1 isometric). Blocks stand on the
// ground plane; z lifts a point straight up the screen.

export const TW = 64
export const TH = 32
export const iso = (gx, gy, z = 0) => [((gx - gy) * TW) / 2, ((gx + gy) * TH) / 2 - z]

const f = (n) => Math.round(n * 10) / 10
const pt = (p) => `${f(p[0])} ${f(p[1])}`

// ------------------------------------------------------------------ colour

const parse = (hex) => {
  let h = String(hex || '#999999').replace('#', '')
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0)
}
const toHex = (rgb) => '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
export const mix = (a, b, t) => {
  const A = parse(a)
  const B = parse(b)
  return toHex(A.map((v, i) => v + (B[i] - v) * t))
}
const luminance = (hex) => {
  const [r, g, b] = parse(hex).map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export const inkOn = (hex) => (luminance(hex) > 0.28 ? '#221f1a' : '#f6f1e7')

// A block's three visible faces. `top` is used as given; the sides are shaded from it.
// `pastel` softens a saturated brand colour into the paper-like palette first.
export function blockColors(hex, { dark = false, pastel = true } = {}) {
  const top = pastel ? (dark ? mix(hex, '#2a2723', 0.5) : mix(hex, '#fffaf0', 0.55)) : hex
  const left = mix(top, dark ? '#000000' : '#3b3326', dark ? 0.16 : 0.12)
  const right = mix(top, dark ? '#000000' : '#3b3326', dark ? 0.3 : 0.24)
  return { top, left, right, ink: inkOn(left), topInk: inkOn(top) }
}

// ------------------------------------------------------------------ paths

// A polyline (or polygon) with its corners rounded by radius r.
export function rounded(points, r, closed = false) {
  const n = points.length
  if (n < 2) return ''
  const out = []
  const corner = (i) => {
    const p = points[(i + n) % n]
    const a = points[(i - 1 + n) % n]
    const b = points[(i + 1) % n]
    const da = Math.hypot(p[0] - a[0], p[1] - a[1]) || 1
    const db = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1
    const k = Math.min(r, da / 2, db / 2)
    return {
      in: [p[0] + ((a[0] - p[0]) * k) / da, p[1] + ((a[1] - p[1]) * k) / da],
      out: [p[0] + ((b[0] - p[0]) * k) / db, p[1] + ((b[1] - p[1]) * k) / db],
      p,
    }
  }
  if (closed) {
    const c0 = corner(0)
    out.push(`M${pt(c0.out)}`)
    for (let i = 1; i <= n; i++) {
      const c = corner(i)
      out.push(`L${pt(c.in)}Q${pt(c.p)} ${pt(c.out)}`)
    }
    return out.join('') + 'Z'
  }
  out.push(`M${pt(points[0])}`)
  for (let i = 1; i < n - 1; i++) {
    const c = corner(i)
    out.push(`L${pt(c.in)}Q${pt(c.p)} ${pt(c.out)}`)
  }
  out.push(`L${pt(points[n - 1])}`)
  return out.join('')
}

const poly = (points) => 'M' + points.map(pt).join('L') + 'Z'

// The ground diamond of a footprint, optionally grown by `grow` grid units.
export function footprint(b, grow = 0, z = 0) {
  const ax = b.ax + grow
  const ay = b.ay + grow
  return [iso(b.gx - ax, b.gy - ay, z), iso(b.gx + ax, b.gy - ay, z), iso(b.gx + ax, b.gy + ay, z), iso(b.gx - ax, b.gy + ay, z)]
}

// ------------------------------------------------------------------ shapes
// Each shape returns SVG markup plus anchor points: `top` (centre of the top face),
// `face` (centre of the front faces, for a label), `foot` (front corner on the ground).

let clipSeq = 0

export function cube(b, c, { dashed = false, stroke, sw = 2.2 } = {}) {
  const { gx, gy, ax, ay, h } = b
  const T0 = iso(gx - ax, gy - ay, h)
  const T1 = iso(gx + ax, gy - ay, h)
  const T2 = iso(gx + ax, gy + ay, h)
  const T3 = iso(gx - ax, gy + ay, h)
  const G1 = iso(gx + ax, gy - ay, 0)
  const G2 = iso(gx + ax, gy + ay, 0)
  const G3 = iso(gx - ax, gy + ay, 0)
  const r = Math.min(9, h / 3)
  const outline = rounded([T0, T1, G1, G2, G3, T3], r, true)
  const id = 'clip' + ++clipSeq
  const svg =
    `<clipPath id="${id}"><path d="${outline}"/></clipPath>` +
    `<g clip-path="url(#${id})">` +
    `<path d="${poly([T3, T2, G2, G3])}" fill="${c.left}"/>` +
    `<path d="${poly([T2, T1, G1, G2])}" fill="${c.right}"/>` +
    `<path d="${poly([T0, T1, T2, T3])}" fill="${c.top}"/>` +
    `<path d="M${pt(T3)}L${pt(T2)}L${pt(T1)}M${pt(T2)}L${pt(G2)}" fill="none" stroke="${stroke}" stroke-width="${sw * 0.8}" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>` +
    `</g>` +
    `<path d="${outline}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"${dashed ? ' stroke-dasharray="7 5"' : ''}/>`
  const top = iso(gx, gy, h)
  return { svg, top, face: [T2[0], (T2[1] + G2[1]) / 2], foot: G2, faceW: Math.min(ax, ay) * TW * 1.65, faceH: h, hull: [T0, T1, G1, G2, G3, T3] }
}

export function store(b, c, { stroke, sw = 2.2, dashed = false } = {}) {
  const { gx, gy, ax, h } = b
  const rx = (ax * Math.SQRT2 * TW) / 2
  const ry = (ax * Math.SQRT2 * TH) / 2
  const [cx, cy] = iso(gx, gy, 0)
  const ty = cy - h
  const body = `M${f(cx - rx)} ${f(ty)}L${f(cx - rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(cy)}L${f(cx + rx)} ${f(ty)}Z`
  const shade = `M${f(cx)} ${f(ty + ry)}L${f(cx)} ${f(cy + ry)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(cy)}L${f(cx + rx)} ${f(ty)}Z`
  const band = `M${f(cx - rx)} ${f(ty + h * 0.45)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(ty + h * 0.45)}`
  const dash = dashed ? ' stroke-dasharray="7 5"' : ''
  const svg =
    `<path d="${body}" fill="${c.left}"/>` +
    `<path d="${shade}" fill="${c.right}"/>` +
    `<path d="${band}" fill="none" stroke="${stroke}" stroke-width="${sw * 0.8}" opacity=".7"/>` +
    `<path d="${body}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"${dash}/>` +
    `<ellipse cx="${f(cx)}" cy="${f(ty)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c.top}" stroke="${stroke}" stroke-width="${sw}"${dash}/>`
  const hull = [[cx - rx, ty], [cx - rx * 0.7, ty - ry * 0.7], [cx, ty - ry], [cx + rx * 0.7, ty - ry * 0.7], [cx + rx, ty], [cx + rx, cy], [cx + rx * 0.7, cy + ry * 0.7], [cx, cy + ry], [cx - rx * 0.7, cy + ry * 0.7], [cx - rx, cy]]
  return { svg, top: [cx, ty], face: [cx, ty + h * 0.62 + ry * 0.4], foot: [cx, cy + ry], faceW: rx * 1.5, faceH: h, hull }
}

export function person(b, c, { stroke, sw = 2 } = {}) {
  const { gx, gy } = b
  const spots = [
    [gx - 0.35, gy + 0.3],
    [gx + 0.35, gy - 0.3],
    [gx + 0.15, gy + 0.55],
  ].sort((p, q) => p[0] + p[1] - (q[0] + q[1]))
  let svg = ''
  for (const [i, s] of spots.entries()) {
    const [x, y] = iso(s[0], s[1], 0)
    const fill = [c.top, c.left, mix(c.top, '#ffffff', 0.2)][i]
    svg +=
      `<ellipse cx="${f(x)}" cy="${f(y)}" rx="11" ry="5.5" fill="#000" opacity=".12"/>` +
      `<rect x="${f(x - 9)}" y="${f(y - 27)}" width="18" height="26" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>` +
      `<circle cx="${f(x)}" cy="${f(y - 35)}" r="7.5" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
  }
  const foot = iso(gx + 0.6, gy + 0.6, 0)
  const [hx, hy] = iso(gx, gy, 0)
  const hull = [[hx - 34, hy - 50], [hx + 34, hy - 50], [hx + 34, hy + 14], [hx - 34, hy + 14]]
  return { svg, top: iso(gx, gy, 52), face: null, foot, faceW: 0, faceH: 0, hull }
}

export function startDot(b, { stroke }) {
  const [x, y] = iso(b.gx, b.gy, 0)
  return {
    svg: `<ellipse cx="${f(x)}" cy="${f(y)}" rx="14" ry="7" fill="${stroke}"/><ellipse cx="${f(x)}" cy="${f(y - 3)}" rx="14" ry="7" fill="${stroke}"/>`,
    top: [x, y - 3],
    face: null,
    foot: [x, y + 7],
    faceW: 0,
    faceH: 0,
    hull: [[x - 14, y - 10], [x + 14, y - 10], [x + 14, y + 7], [x - 14, y + 7]],
  }
}

// A flat rounded platform under a group of blocks.
export function plate(b, fill, stroke, h = 10) {
  const T = footprint(b, 0, h)
  const G = footprint(b, 0, 0)
  const outline = rounded([T[0], T[1], G[1], G[2], G[3], T[3]], 12, true)
  return (
    `<path d="${outline}" fill="${mix(fill, stroke, 0.12)}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<path d="${rounded(T, 12, true)}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>`
  )
}

// ------------------------------------------------------------------ links

// Routes a link between two footprints along the grid's two axes, picking the shortest
// candidate that crosses the fewest other blocks and arrives on a visible side.
// Returns grid points; `lane` shifts parallel links apart.
export function route(A, B, blocks, lane = 0) {
  const off = lane * 0.42
  const dx = B.gx - A.gx
  const dy = B.gy - A.gy
  const sx = Math.sign(dx) || 1
  const sy = Math.sign(dy) || 1
  const gap = 0.12
  const exA = (s) => A.gx + s * (A.ax + gap)
  const eyA = (s) => A.gy + s * (A.ay + gap)
  const exB = (s) => B.gx - s * (B.ax + gap)
  const eyB = (s) => B.gy - s * (B.ay + gap)
  const c = []
  if (Math.abs(dy) < Math.min(A.ay, B.ay) * 0.9) {
    const y = (A.gy + B.gy) / 2 + off
    c.push([[exA(sx), y], [exB(sx), y]])
  }
  if (Math.abs(dx) < Math.min(A.ax, B.ax) * 0.9) {
    const x = (A.gx + B.gx) / 2 + off
    c.push([[x, eyA(sy)], [x, eyB(sy)]])
  }
  if (Math.abs(dx) > A.ax + 0.3 && Math.abs(dy) > B.ay + 0.3)
    c.push([[exA(sx), A.gy + off], [B.gx + off, A.gy + off], [B.gx + off, eyB(sy)]])
  if (Math.abs(dy) > A.ay + 0.3 && Math.abs(dx) > B.ax + 0.3)
    c.push([[A.gx + off, eyA(sy)], [A.gx + off, B.gy + off], [exB(sx), B.gy + off]])
  if (Math.abs(dx) > A.ax + B.ax + 0.8) {
    const mx = (exA(sx) + exB(sx)) / 2 + off
    c.push([[exA(sx), A.gy], [mx, A.gy], [mx, B.gy], [exB(sx), B.gy]])
  }
  if (Math.abs(dy) > A.ay + B.ay + 0.8) {
    const my = (eyA(sy) + eyB(sy)) / 2 + off
    c.push([[A.gx, eyA(sy)], [A.gx, my], [B.gx, my], [B.gx, eyB(sy)]])
  }
  for (const d of [1, -1]) {
    const ly = (d > 0 ? Math.max(A.gy + A.ay, B.gy + B.ay) : Math.min(A.gy - A.ay, B.gy - B.ay)) + d * (0.85 + Math.abs(off))
    c.push([[A.gx + off * 0.5, A.gy + d * (A.ay + gap)], [A.gx + off * 0.5, ly], [B.gx + off * 0.5, ly], [B.gx + off * 0.5, B.gy + d * (B.ay + gap)]])
    const lx = (d > 0 ? Math.max(A.gx + A.ax, B.gx + B.ax) : Math.min(A.gx - A.ax, B.gx - B.ax)) + d * (0.85 + Math.abs(off))
    c.push([[A.gx + d * (A.ax + gap), A.gy + off * 0.5], [lx, A.gy + off * 0.5], [lx, B.gy + off * 0.5], [B.gx + d * (B.ax + gap), B.gy + off * 0.5]])
  }
  const others = blocks.filter((b) => b !== A && b !== B)
  let best = null
  let bestScore = Infinity
  for (const pts of c) {
    let len = 0
    let hits = 0
    for (let i = 1; i < pts.length; i++) {
      const [p, q] = [pts[i - 1], pts[i]]
      len += Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1])
      for (const o of others) if (segHits(p, q, o, 0.2)) hits++
    }
    const last = pts.at(-1)
    const prev = pts.at(-2)
    // Arriving while moving +x or +y meets the block's back sides, which the block hides.
    const hiddenArrival = last[0] > prev[0] + 1e-6 || last[1] > prev[1] + 1e-6
    const score = hits * 40 + len + (pts.length - 2) * 0.9 + (hiddenArrival ? 1 : 0)
    if (score < bestScore) {
      bestScore = score
      best = pts
    }
  }
  return best
}

function segHits(p, q, b, pad) {
  const x0 = Math.min(p[0], q[0])
  const x1 = Math.max(p[0], q[0])
  const y0 = Math.min(p[1], q[1])
  const y1 = Math.max(p[1], q[1])
  return x1 > b.gx - b.ax - pad && x0 < b.gx + b.ax + pad && y1 > b.gy - b.ay - pad && y0 < b.gy + b.ay + pad
}

const inside = (p, hull) => {
  let c = false
  for (let i = 0, j = hull.length - 1; i < hull.length; j = i++) {
    const [xi, yi] = hull[i]
    const [xj, yj] = hull[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

// When a link ends behind its target block, stop it where it meets the block's outline,
// so the arrowhead shows at the edge of the block instead of under it.
export function trimToHull(s, hull) {
  if (!hull || s.length < 2 || !inside(s.at(-1), hull)) return s
  for (let i = s.length - 1; i > 0; i--) {
    const a = s[i - 1]
    const b = s[i]
    if (inside(a, hull)) continue
    let lo = 0
    let hi = 1
    for (let k = 0; k < 18; k++) {
      const m = (lo + hi) / 2
      if (inside([a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m], hull)) hi = m
      else lo = m
    }
    const cut = [a[0] + (b[0] - a[0]) * lo, a[1] + (b[1] - a[1]) * lo]
    return [...s.slice(0, i), cut]
  }
  return s
}

// Screen path for routed grid points, with rounded corners; also the label spot.
export function linkPath(points, z = 0, hull = null) {
  const s = trimToHull(
    points.map((p) => iso(p[0], p[1], z)),
    hull,
  )
  let best = 0
  let at = [(s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2]
  for (let i = 1; i < s.length; i++) {
    const L = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1])
    if (L > best) {
      best = L
      at = [(s[i][0] + s[i - 1][0]) / 2, (s[i][1] + s[i - 1][1]) / 2]
    }
  }
  return { d: rounded(s, 14), label: at, end: s.at(-1), pts: s }
}

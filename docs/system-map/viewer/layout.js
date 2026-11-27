// Where blocks stand on the grid. Every layout returns Map(id -> [gx, gy]).

// Top-level areas keep the arrangement of the map data (x, y, w, h in world units),
// compressed onto the grid, then nudged apart so no two blocks touch.
export function worldLayout(nodes, world, minGap = 5.6) {
  const pos = new Map()
  const S = Math.max(world?.w || 4000, world?.h || 2400) / 34
  for (const n of nodes) {
    const x = (n.x ?? 0) + (n.w ?? 0) / 2
    const y = (n.y ?? 0) + (n.h ?? 0) / 2
    pos.set(n.id, [x / S, y / S])
  }
  for (let pass = 0; pass < 60; pass++) {
    let moved = false
    const ids = [...pos.keys()]
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos.get(ids[i])
        const b = pos.get(ids[j])
        const dx = b[0] - a[0]
        const dy = b[1] - a[1]
        const d = Math.max(Math.abs(dx), Math.abs(dy))
        if (d >= minGap) continue
        moved = true
        const push = (minGap - d) / 2 + 0.01
        if (Math.abs(dx) >= Math.abs(dy)) {
          const s = Math.sign(dx) || 1
          a[0] -= s * push
          b[0] += s * push
        } else {
          const s = Math.sign(dy) || 1
          a[1] -= s * push
          b[1] += s * push
        }
      }
    if (!moved) break
  }
  return centre(snap(pos))
}

export function gridLayout(ids, spacing = 4, cols) {
  const n = ids.length
  const c = cols || Math.max(1, Math.ceil(Math.sqrt(n * 1.3)))
  const pos = new Map()
  ids.forEach((id, i) => pos.set(id, [(i % c) * spacing, Math.floor(i / c) * spacing]))
  return centre(pos)
}

// Layers by distance from the start along the arrows (+gx), then rows (+gy) ordered by
// the average row of neighbours to reduce crossings.
export function layeredLayout(ids, edges, starts = [], { lx = 5, ly = 4.2 } = {}) {
  const set = new Set(ids)
  const out = new Map(ids.map((id) => [id, []]))
  const inn = new Map(ids.map((id) => [id, []]))
  for (const e of edges)
    if (set.has(e.from) && set.has(e.to) && e.from !== e.to) {
      out.get(e.from).push(e.to)
      inn.get(e.to).push(e.from)
    }
  let roots = starts.filter((s) => set.has(s))
  if (!roots.length) roots = ids.filter((id) => !inn.get(id).length)
  if (!roots.length && ids.length) roots = [ids[0]]
  // Drop the arrows that loop back (found by a depth-first walk from the start), then put
  // each block one layer after its furthest predecessor, so a flow reads as a chain.
  const state = new Map()
  const forward = new Map(ids.map((id) => [id, []]))
  const walk = (id) => {
    state.set(id, 1)
    for (const t of out.get(id)) {
      if (state.get(t) === 1) continue
      forward.get(id).push(t)
      if (!state.has(t)) walk(t)
    }
    state.set(id, 2)
  }
  for (const r of roots) if (!state.has(r)) walk(r)
  for (const id of ids) if (!state.has(id)) walk(id)
  const layer = new Map()
  const depth = (id, seen = new Set()) => {
    if (layer.has(id)) return layer.get(id)
    seen.add(id)
    let d = 0
    for (const [from, tos] of forward) if (tos.includes(id) && !seen.has(from)) d = Math.max(d, depth(from, seen) + 1)
    layer.set(id, d)
    return d
  }
  for (const id of ids) depth(id)
  const layers = []
  for (const id of ids) (layers[layer.get(id)] ||= []).push(id)
  const row = new Map()
  const place = () => layers.forEach((L) => L?.forEach((id, i) => row.set(id, i - (L.length - 1) / 2)))
  place()
  const mean = (list) => (list.length ? list.reduce((s, id) => s + row.get(id), 0) / list.length : null)
  for (let sweep = 0; sweep < 6; sweep++) {
    const order = sweep % 2 ? [...layers].reverse() : layers
    for (const L of order) {
      if (!L) continue
      const key = new Map(L.map((id) => [id, mean(sweep % 2 ? out.get(id) : inn.get(id)) ?? row.get(id)]))
      L.sort((a, b) => key.get(a) - key.get(b))
      L.forEach((id, i) => row.set(id, i - (L.length - 1) / 2))
    }
  }
  const pos = new Map()
  for (const id of ids) pos.set(id, [layer.get(id) * lx, row.get(id) * ly])
  return centre(pos)
}

// A path that winds back and forth, for tours: each row runs along +gx, the next comes back.
export function snakeLayout(ids, perRow = 4, spacing = 4.4) {
  const pos = new Map()
  ids.forEach((id, i) => {
    const r = Math.floor(i / perRow)
    const k = i % perRow
    const x = r % 2 ? perRow - 1 - k : k
    pos.set(id, [x * spacing, r * spacing])
  })
  return centre(pos)
}

function snap(pos) {
  for (const p of pos.values()) {
    p[0] = Math.round(p[0] * 2) / 2
    p[1] = Math.round(p[1] * 2) / 2
  }
  return pos
}

function centre(pos) {
  if (!pos.size) return pos
  const xs = [...pos.values()].map((p) => p[0])
  const ys = [...pos.values()].map((p) => p[1])
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  for (const p of pos.values()) {
    p[0] -= cx
    p[1] -= cy
  }
  return pos
}

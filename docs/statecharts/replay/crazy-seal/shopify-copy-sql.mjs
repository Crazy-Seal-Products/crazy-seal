// A JavaScript copy of upsert_shopify_customers and upsert_shopify_orders in
// supabase/migrations/019_shopify_copy_newest_wins.sql, called through .rpc() on the replays' fake
// database. Each call runs whole, like the SQL function's one transaction. The SQL itself is checked
// by shopify-copy-sql.check.mjs.
import { randomUUID } from 'node:crypto'

// Same or newer updated_at replaces; a deleted row is never replaced.
const replaces = (stored, row) =>
  !stored.deleted_at &&
  (stored.shopify_updated_at == null ||
    (row.shopify_updated_at != null && Date.parse(row.shopify_updated_at) >= Date.parse(stored.shopify_updated_at)))

function write(rows, row) {
  const { id, deleted_at, ...values } = structuredClone(row)
  const stored = rows.find((r) => r.shopify_id === values.shopify_id)
  if (!stored) {
    const added = { id: randomUUID(), deleted_at: null, ...values }
    rows.push(added)
    return added
  }
  if (!replaces(stored, values)) return null
  return Object.assign(stored, values)
}

const functions = {
  upsert_shopify_customers(db, { p_rows }) {
    return p_rows.filter((row) => write(db.rows('shopify_customers'), row)).length
  },
  upsert_shopify_orders(db, { p_orders }) {
    let written = 0
    for (const { line_items: items = [], ...row } of p_orders) {
      const saved = write(db.rows('shopify_orders'), row)
      if (!saved) continue
      written += 1
      const keep = new Set(items.map((item) => item.shopify_id))
      const lines = db.rows('shopify_order_line_items')
      const others = lines.filter((line) => line.order_id !== saved.id || keep.has(line.shopify_id))
      lines.splice(0, lines.length, ...others)
      for (const item of items) {
        const values = { ...structuredClone(item), order_id: saved.id, order_shopify_id: saved.shopify_id }
        const line = lines.find((l) => l.shopify_id === item.shopify_id)
        if (line) Object.assign(line, values)
        else lines.push({ id: randomUUID(), ...values })
      }
    }
    return written
  },
}

// Adds .rpc() to a fake database from ../fake-supabase.mjs. Like its queries, a call resolves on a later
// microtask and runs db.hooks.before first ({ table: null, op: 'rpc', name, args }), which may throw.
export function withSqlFunctions(db) {
  db.rpc = async (name, args) => {
    await Promise.resolve()
    const fn = functions[name]
    if (!fn) return { data: null, error: { code: 'PGRST202', message: `fake db: no function ${name}` } }
    for (const hook of db.hooks.before) await hook({ table: null, op: 'rpc', name, args })
    const data = fn(db, structuredClone(args))
    db.log.push({ table: null, op: 'rpc', name, ok: true })
    await Promise.resolve()
    return { data, error: null }
  }
  return db
}

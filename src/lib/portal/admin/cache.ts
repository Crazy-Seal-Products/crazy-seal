/**
 * Small in-process cache for admin aggregates. Each server instance keeps its
 * own copy for `ttlMs`; `clearAdminCache()` runs after a Shopify refresh so
 * the next page load recomputes from fresh rows.
 */

const store = new Map<string, { at: number; value: Promise<unknown> }>()

export function memo<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as Promise<T>
  const value = load().catch((err) => {
    store.delete(key)
    throw err
  })
  store.set(key, { at: Date.now(), value })
  return value
}

export function clearAdminCache() {
  store.clear()
}

/**
 * Pages through a PostgREST query 1,000 rows at a time (the API's row cap).
 * `page(from, to)` must apply `.range(from, to)` and a stable order.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  max = 50_000,
): Promise<T[]> {
  const size = 1000
  const rows: T[] = []
  for (let from = 0; from < max; from += size) {
    let { data, error } = await page(from, from + size - 1)
    if (error && /fetch failed/i.test(error.message)) {
      // One retry for a dropped connection.
      await new Promise((r) => setTimeout(r, 400))
      ;({ data, error } = await page(from, from + size - 1))
    }
    if (error) throw new Error(error.message)
    rows.push(...(data ?? []))
    if (!data || data.length < size) break
  }
  return rows
}

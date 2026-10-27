export type SearchParams = Promise<Record<string, string | string[] | undefined>>

export function one(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v
  return s?.trim() || undefined
}

export function pageNum(v: string | string[] | undefined): number {
  const n = Number(one(v))
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1
}

export function pick<T extends string>(v: string | string[] | undefined, allowed: readonly { key: T }[], fallback: T): T {
  const s = one(v)
  return allowed.some((a) => a.key === s) ? (s as T) : fallback
}

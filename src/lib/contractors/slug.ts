/**
 * Page addresses for contractors (/contractor/<slug>). Plain module: the
 * admin editor suggests one as you type; the save action checks it.
 * scripts/import-contractors.mjs makes them the same way.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function slugify(v: string | null | undefined): string {
  return String(v ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
}

/** `base`, or `base-2`, `base-3`… whichever isn't taken. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || 'contractor'
  if (!taken.has(root)) return root
  for (let n = 2; ; n++) if (!taken.has(`${root}-${n}`)) return `${root}-${n}`
}

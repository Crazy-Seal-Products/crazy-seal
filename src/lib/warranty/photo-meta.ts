export type PhotoKind = 'before' | 'after'

export interface PhotoMetaEntry {
  kind?: PhotoKind | null
  favorite?: boolean
}

export type PhotoMetaMap = Record<string, PhotoMetaEntry>

export const PHOTO_KINDS: PhotoKind[] = ['before', 'after']

export function inferPhotoKind(url: string): PhotoKind | null {
  const filename = decodeURIComponent((url.split('?')[0] || '').split('/').pop() || '')
  const name = filename.replace(/\.[a-z0-9]+$/i, '').toLowerCase()
  const before = /(^|[^a-z])before([^a-z]|$)/.test(name)
  const after = /(^|[^a-z])after([^a-z]|$)/.test(name)
  if (before && !after) return 'before'
  if (after && !before) return 'after'
  return null
}

export function getPhotoKind(url: string, meta?: PhotoMetaMap | null): PhotoKind | null {
  const entry = meta?.[url]
  if (entry && Object.prototype.hasOwnProperty.call(entry, 'kind')) {
    return entry.kind === 'before' || entry.kind === 'after' ? entry.kind : null
  }
  return inferPhotoKind(url)
}

export function isPhotoFavorite(url: string, meta?: PhotoMetaMap | null): boolean {
  return !!meta?.[url]?.favorite
}

export function mergePhotoMeta(
  current: PhotoMetaMap | null | undefined,
  url: string,
  patch: PhotoMetaEntry,
): PhotoMetaMap {
  const next: PhotoMetaMap = { ...(current || {}) }
  next[url] = { ...(next[url] || {}), ...patch }
  return next
}

export function photoSetSummary(urls: string[], meta?: PhotoMetaMap | null) {
  let before = 0
  let after = 0
  let unclassified = 0
  let favorites = 0
  for (const url of urls) {
    const kind = getPhotoKind(url, meta)
    if (kind === 'before') before++
    else if (kind === 'after') after++
    else unclassified++
    if (isPhotoFavorite(url, meta)) favorites++
  }
  return { before, after, unclassified, favorites }
}

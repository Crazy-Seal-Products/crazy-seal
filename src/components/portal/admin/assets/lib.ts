/**
 * Site assets: types, helpers and the calls to the /api/admin/assets and
 * /api/admin/mediaconvert routes. Everything lives under site-assets/ in the
 * media bucket and is served from media.crazyseal.com.
 */

export type VariantType = 'original' | '1080p' | '720p' | 'thumb'

export interface VideoVariant {
  type: VariantType
  key: string
  url: string
  size?: number
}

export interface AssetFile {
  key: string
  url: string
  name: string
  size: number
  lastModified?: string
  /** Folder path under site-assets/, e.g. "video/marketing". */
  category: string
  path?: string
  /** Set on a MediaConvert output group: the versions this entry stands for. */
  variants?: VideoVariant[]
}

export type Listing = {
  path: string
  folders: string[]
  files: AssetFile[]
  /** The list route reads one S3 page (1,000 keys) with no paging, so a full page means some items are missing. */
  truncated?: boolean
  error?: string
}

const S3_PAGE = 1000

export type DropItem = { file: File; relativePath: string }

export type Kind = 'image' | 'video' | 'audio' | 'pdf' | 'other'

export const PREFIX = 'site-assets/'

// ─── Paths ────────────────────────────────────────────────────────────────

export function splitPath(p: string | null | undefined): string[] {
  return (p ?? '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** The folder name the upload route will use (it lowercases and dashes the rest). */
export function sanitizeFolder(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/-]/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '')
}

// ─── Files ────────────────────────────────────────────────────────────────

const VARIANT_NAME = /^(.+)-(original|1080p|720p|thumb)(?:\.\d+)?\.(mp4|jpg|jpeg)$/i
const VARIANT_SUFFIX = /-(original|1080p|720p|thumb)(?:\.\d+)?\.(mp4|jpg|jpeg)$/i
const VARIANT_ORDER: VariantType[] = ['original', '1080p', '720p', 'thumb']

/** Fold MediaConvert outputs (name-1080p.mp4, name-thumb.0000000.jpg, …) into one entry per video. */
export function groupVideoVariants(files: AssetFile[]): AssetFile[] {
  const out = new Map<string, AssetFile>()
  for (const file of files) {
    const m = file.name.match(VARIANT_NAME)
    if (!m) {
      out.set(file.key, file)
      continue
    }
    const baseKey = file.key.replace(VARIANT_SUFFIX, '')
    const existing = out.get(baseKey)
    const group = existing?.variants ? existing : { ...file, key: baseKey, name: m[1], variants: [] as VideoVariant[] }
    group.variants!.push({ type: m[2].toLowerCase() as VariantType, key: file.key, url: file.url, size: file.size })
    out.set(baseKey, group)
  }
  return [...out.values()].map((f) => {
    if (!f.variants) return f
    const variants = [...f.variants].sort((a, b) => VARIANT_ORDER.indexOf(a.type) - VARIANT_ORDER.indexOf(b.type))
    const main = variants.find((v) => v.type === '1080p') ?? variants.find((v) => v.type === 'original') ?? variants.find((v) => v.type === '720p') ?? variants[0]
    const onlyThumb = variants.every((v) => v.type === 'thumb')
    return {
      ...f,
      variants,
      url: main.url,
      name: f.name + (onlyThumb ? '.jpg' : '.mp4'),
      size: variants.reduce((sum, v) => sum + (v.size ?? 0), 0),
    }
  })
}

export function kindOf(f: Pick<AssetFile, 'name' | 'variants'>): Kind {
  if (f.variants?.length) return 'video'
  if (/\.(jpe?g|png|gif|webp|svg)$/i.test(f.name)) return 'image'
  if (/\.(mp4|webm|mov|avi)$/i.test(f.name)) return 'video'
  if (/\.(mp3|wav|ogg|m4a)$/i.test(f.name)) return 'audio'
  if (/\.pdf$/i.test(f.name)) return 'pdf'
  return 'other'
}

/** A raw video that MediaConvert hasn't turned into web versions yet. */
export function canProcess(f: AssetFile): boolean {
  return kindOf(f) === 'video' && !f.variants?.length
}

/** The S3 objects behind an entry: every version for a processed video. */
export function objectKeys(f: AssetFile): string[] {
  return f.variants?.length ? f.variants.map((v) => v.key) : [f.key]
}

export function thumbOf(f: AssetFile): string | undefined {
  return f.variants?.find((v) => v.type === 'thumb')?.url
}

export function fileType(name: string): string {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(i + 1).toUpperCase() : 'FILE'
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/** The CDN link with each path segment URL-encoded, so names with spaces paste cleanly. */
export function encodeUrl(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname
      .split('/')
      .map((s) => encodeURIComponent(decodeURIComponent(s)))
      .join('/')
    return `${u.origin}${path}${u.search}${u.hash}`
  } catch {
    return url
  }
}

export function errorText(e: unknown): string {
  return e instanceof Error ? e.message : 'Unknown error'
}

export function plural(n: number, word: string): string {
  return `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`
}

// ─── Drag and drop from the desktop ───────────────────────────────────────

type EntryItem = DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry | null }

export function hasDirectory(items: DataTransferItemList | null | undefined): boolean {
  if (!items) return false
  for (let i = 0; i < items.length; i++) if ((items[i] as EntryItem).webkitGetAsEntry?.()?.isDirectory) return true
  return false
}

/**
 * Files from a drop, walking into dropped folders (relativePath keeps the
 * folder structure). Entries are taken synchronously: the browser empties
 * the DataTransfer as soon as the drop event returns.
 */
export async function readDrop(dt: DataTransfer): Promise<DropItem[]> {
  const plain = Array.from(dt.files)
  if (!hasDirectory(dt.items)) return plain.map((file) => ({ file, relativePath: file.name }))

  const roots: (FileSystemEntry | File)[] = []
  for (let i = 0; i < dt.items.length; i++) {
    const item = dt.items[i] as EntryItem
    const entry = item.webkitGetAsEntry?.()
    const file = entry ? null : item.getAsFile()
    if (entry) roots.push(entry)
    else if (file) roots.push(file)
  }

  const result: DropItem[] = []
  const fileOf = (e: FileSystemFileEntry) => new Promise<File>((res, rej) => e.file(res, rej))
  async function walk(dir: FileSystemDirectoryEntry, base: string): Promise<void> {
    const reader = dir.createReader()
    const batch = () => new Promise<FileSystemEntry[]>((res, rej) => reader.readEntries(res, rej))
    let entries: FileSystemEntry[] = []
    for (let next = await batch(); next.length > 0; next = await batch()) entries = entries.concat(next)
    for (const e of entries) {
      const path = `${base}/${e.name}`
      if (e.isFile) result.push({ file: await fileOf(e as FileSystemFileEntry), relativePath: path })
      else if (e.isDirectory) await walk(e as FileSystemDirectoryEntry, path)
    }
  }
  for (const root of roots) {
    if (root instanceof File) result.push({ file: root, relativePath: root.name })
    else if (root.isFile) result.push({ file: await fileOf(root as FileSystemFileEntry), relativePath: root.name })
    else if (root.isDirectory) await walk(root as FileSystemDirectoryEntry, root.name)
  }
  return result
}

// ─── API calls ────────────────────────────────────────────────────────────

async function call<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: 'no-store', ...init })
  const data = (await res.json().catch(() => null)) as (T & { error?: string; message?: string }) | null
  if (!res.ok || !data) throw new Error(data?.error || data?.message || `Request failed (${res.status})`)
  return data
}

const json = (body: unknown, method = 'POST'): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

/** One folder's contents; at the root, the top-level categories. Never throws. */
export async function loadListing(path: string): Promise<Listing> {
  try {
    if (!path) {
      const d = await call<{ categories?: string[] }>('/api/admin/assets/list/')
      return { path, folders: d.categories ?? [], files: [] }
    }
    const d = await call<{ subfolders?: string[]; files?: AssetFile[] }>(`/api/admin/assets/list/?category=${encodeURIComponent(path)}`)
    const folders = d.subfolders ?? []
    const raw = d.files ?? []
    // The route drops the folder marker and .keep from the page, hence the 2 of slack.
    return { path, folders, files: groupVideoVariants(raw), truncated: folders.length + raw.length >= S3_PAGE - 2 }
  } catch (e) {
    return { path, folders: [], files: [], error: errorText(e) }
  }
}

export function deleteObject(s3Key: string) {
  return call<{ success: boolean }>('/api/admin/assets/upload/', json({ s3Key }, 'DELETE'))
}

export function moveObjects(fileKeys: string[], targetFolder: string) {
  return call<{ success: boolean; movedCount: number; errors?: string[] }>('/api/admin/assets/move/', json({ fileKeys, targetFolder }))
}

export function createFolder(folderName: string, parentPath: string[]) {
  return call<{ success: boolean; key: string }>('/api/admin/assets/create-folder/', json({ folderName, parentPath }))
}

export function startVideoJob(inputKey: string, filename: string) {
  return call<{ jobId?: string; status?: string; outputPath?: string }>('/api/admin/mediaconvert/trigger/', json({ inputKey, filename }))
}

export function videoJobStatus(jobId: string) {
  return call<{ status?: string; percentComplete?: number; errorMessage?: string }>(`/api/admin/mediaconvert/status/?jobId=${encodeURIComponent(jobId)}`)
}

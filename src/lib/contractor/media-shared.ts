// Photos and videos on a contractor's projects (media_assets, in
// supabase/migrations/033_quotes.sql): stages, limits, file types and the
// record the portal's gallery shows. Plain module: safe to import from client
// components. Reads and writes are in media.ts and media-actions.ts.

export const MEDIA_STAGES = ['before', 'progress', 'after', 'claim', 'other'] as const
export type MediaStage = (typeof MEDIA_STAGES)[number]

/** The project gallery's groups, in order. Claim shows once the project has a claim; Other only when something is in it. */
export const GALLERY_STAGES: readonly MediaStage[] = ['before', 'progress', 'after', 'claim', 'other']

/** Stages a contractor can upload into or move to. */
export const UPLOAD_STAGES: readonly MediaStage[] = ['before', 'progress', 'after', 'claim']

export const MEDIA_STAGE_LABEL: Record<MediaStage, string> = {
  before: 'Before',
  progress: 'Progress',
  after: 'After',
  claim: 'Claim',
  other: 'Other',
}

export const MEDIA_STAGE_HINT: Record<MediaStage, string> = {
  before: 'The roof as you found it',
  progress: 'Prep, seams and coats',
  after: 'The finished roof',
  claim: 'For the warranty claim',
  other: 'Everything else',
}

export type MediaKind = 'photo' | 'video'
export type MediaStatus = 'uploading' | 'ready' | 'processing' | 'failed'

export const MAX_BYTES: Record<MediaKind, number> = {
  photo: 25 * 1024 * 1024,
  video: 500 * 1024 * 1024,
}

/** How many photos and videos one project can hold. */
export const MAX_PER_PROJECT = 500

export const CAPTION_MAX = 500

// The photo types the warranty forms take (src/app/api/upload/presign), and
// the videos phones and cameras record.
const PHOTO_EXT: Record<string, string> = {
  heic: 'image/heic',
  heif: 'image/heif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
}
const VIDEO_EXT: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/x-m4v',
  mov: 'video/quicktime',
  webm: 'video/webm',
}
const PHOTO_TYPES = new Set(Object.values(PHOTO_EXT))
const VIDEO_TYPES = new Set(Object.values(VIDEO_EXT))

/** For file inputs. HEIC and MOV are listed by extension too: some browsers report them with no type. */
export const MEDIA_ACCEPT = 'image/*,video/*,.heic,.heif,.mov,.m4v'

/**
 * Whether a file is a photo or a video we take, and the Content-Type to store
 * it with, or null. Browsers often report HEIC and MOV as empty or
 * application/octet-stream, so the extension decides then.
 */
export function resolveMedia(fileName: string, mime: string): { kind: MediaKind; contentType: string } | null {
  const type = (mime || '').toLowerCase().trim()
  if (PHOTO_TYPES.has(type)) return { kind: 'photo', contentType: type }
  if (VIDEO_TYPES.has(type)) return { kind: 'video', contentType: type }
  if (type && type !== 'application/octet-stream' && !type.startsWith('image/') && !type.startsWith('video/')) return null
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (PHOTO_EXT[ext] && (!type || !type.startsWith('video/'))) return { kind: 'photo', contentType: PHOTO_EXT[ext] }
  if (VIDEO_EXT[ext] && (!type || !type.startsWith('image/'))) return { kind: 'video', contentType: VIDEO_EXT[ext] }
  return null
}

/** "24.3 MB" */
export function fileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  const mb = bytes / (1024 * 1024)
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

/** Why a file can't be uploaded, or null when it can. */
export function mediaProblem(fileName: string, mime: string, bytes: number): string | null {
  const media = resolveMedia(fileName, mime)
  if (!media) return `${fileName} isn’t a photo or video we can take (JPG, PNG, HEIC, MP4, MOV or WebM).`
  if (!(bytes > 0)) return `${fileName} is empty.`
  if (bytes > MAX_BYTES[media.kind]) return `${fileName} is ${fileSize(bytes)}. ${media.kind === 'photo' ? 'Photos' : 'Videos'} can be up to ${fileSize(MAX_BYTES[media.kind])}.`
  return null
}

/** One photo or video in a project's gallery. */
export interface MediaItem {
  id: string
  projectId: string | null
  stage: MediaStage
  kind: MediaKind
  url: string
  mime: string | null
  bytes: number | null
  fileName: string | null
  caption: string | null
  status: MediaStatus
  posterUrl: string | null
  playbackUrl: string | null
  createdAt: string
  /** Pro Hub account that uploaded it. */
  uploadedBy: string | null
  uploadedByStaff: string | null
  /** Part of the project's warranty registration / a claim. */
  onRegistration: boolean
  onClaim: boolean
}

/** A photo the warranty forms can reuse from the project, instead of uploading it again. */
export interface MediaPick {
  id: string
  url: string
  caption: string | null
  fileName: string | null
}

/** The project's ready photos for the warranty forms, by stage. */
export interface ProjectPhotos {
  before: MediaPick[]
  after: MediaPick[]
  claim: MediaPick[]
}

/** Whether the browser can likely show this photo in an <img> (HEIC only in Safari). */
export function isHeic(item: { mime?: string | null; url: string }): boolean {
  return /heic|heif/i.test(item.mime ?? '') || /\.(heic|heif)$/i.test(item.url)
}

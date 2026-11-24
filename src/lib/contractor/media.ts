import { randomUUID } from 'crypto'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createAdminClient } from '@/lib/supabase/admin'
import { MEDIA_STAGE_LABEL, type MediaItem, type MediaKind, type MediaPick, type MediaStage, type MediaStatus, type ProjectPhotos } from './media-shared'

/**
 * Photos and videos on a contractor's projects (media_assets, service role
 * only): reads for the project page and the warranty forms, the S3 side of an
 * upload, and linking a project's photos to its warranty registration or a
 * claim. Server only. Writes from the portal go through media-actions.ts.
 *
 * Files go straight from the browser to the media bucket with a presigned PUT,
 * as the warranty forms' photos do (src/app/api/upload/presign: same bucket,
 * CDN and user-uploads/ prefix), under
 *   user-uploads/projects/<contractor id>/<project id>/<ms>-<random>-<file name>
 * The stage isn't in the key, so moving a photo between stages never moves
 * the object.
 */

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.S3_BUCKET_NAME || 'crazy-seal-media'
const CDN_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || `https://${process.env.CLOUDFRONT_DOMAIN || 'media.crazyseal.com'}`

export const MEDIA_COLS =
  'id, contractor_id, project_id, warranty_registration_id, warranty_claim_id, stage, kind, s3_key, url, mime, bytes, file_name, caption, status, poster_url, playback_url, uploaded_by, uploaded_by_staff, created_at'

export interface MediaRow {
  id: string
  contractor_id: string | null
  project_id: string | null
  warranty_registration_id: string | null
  warranty_claim_id: string | null
  stage: MediaStage
  kind: MediaKind
  s3_key: string
  url: string
  mime: string | null
  bytes: number | string | null
  file_name: string | null
  caption: string | null
  status: MediaStatus
  poster_url: string | null
  playback_url: string | null
  uploaded_by: string | null
  uploaded_by_staff: string | null
  created_at: string
}

export function toMediaItem(row: MediaRow): MediaItem {
  return {
    id: row.id,
    projectId: row.project_id,
    stage: row.stage,
    kind: row.kind,
    url: row.url,
    mime: row.mime,
    bytes: row.bytes == null ? null : Number(row.bytes),
    fileName: row.file_name,
    caption: row.caption,
    status: row.status,
    posterUrl: row.poster_url,
    playbackUrl: row.playback_url,
    createdAt: row.created_at,
    uploadedBy: row.uploaded_by,
    uploadedByStaff: row.uploaded_by_staff,
    onRegistration: Boolean(row.warranty_registration_id),
    onClaim: Boolean(row.warranty_claim_id),
  }
}

/* ---------------------------------------------------------------- S3 side */

/** "IMG_0042.HEIC" -> "IMG_0042.HEIC"; anything else unsafe in a key becomes "_". Keeps the extension. */
function safeName(fileName: string): string {
  const clean = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_') || 'file'
  if (clean.length <= 80) return clean
  const dot = clean.lastIndexOf('.')
  const ext = dot > 0 && clean.length - dot <= 6 ? clean.slice(dot) : ''
  return clean.slice(0, 80 - ext.length) + ext
}

export function mediaKey(contractorId: string, projectId: string, fileName: string): string {
  return `user-uploads/projects/${contractorId}/${projectId}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName(fileName)}`
}

export function mediaUrl(key: string): string {
  return `${CDN_URL}/${key}`
}

/** A presigned PUT for one object, good for an hour (the upload has to start by then). */
export async function presignMediaPut(key: string, contentType: string): Promise<string> {
  return getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }), { expiresIn: 3600 })
}

/**
 * The size of an uploaded object (a HEAD, read only): its bytes, 'missing'
 * when it isn't there, or null when S3 won't say (no read permission, or S3
 * is unreachable), in which case the caller trusts the browser.
 */
export async function uploadedSize(key: string): Promise<number | 'missing' | null> {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
    return typeof head.ContentLength === 'number' ? head.ContentLength : null
  } catch (err) {
    const e = err as { name?: string; $metadata?: { httpStatusCode?: number } }
    if (e?.name === 'NotFound' || e?.$metadata?.httpStatusCode === 404) return 'missing'
    console.error('[contractor-media] head', key, e?.name ?? err)
    return null
  }
}

/* ------------------------------------------------------------------- reads */

/** The project's photos and videos (ready or processing), oldest first, and whether it has a warranty claim. */
export async function listProjectMedia(contractorId: string, projectId: string): Promise<{ items: MediaItem[]; hasClaim: boolean }> {
  const db = createAdminClient()
  const [media, claims] = await Promise.all([
    db
      .from('media_assets')
      .select(MEDIA_COLS)
      .eq('project_id', projectId)
      .eq('contractor_id', contractorId)
      .in('status', ['ready', 'processing'])
      .order('created_at', { ascending: true })
      .limit(1000),
    db.from('warranty_claims').select('id').eq('project_id', projectId).limit(1),
  ])
  if (media.error) throw new Error(`media_assets: ${media.error.message}`)
  if (claims.error) throw new Error(`warranty_claims: ${claims.error.message}`)
  return { items: ((media.data ?? []) as MediaRow[]).map(toMediaItem), hasClaim: (claims.data ?? []).length > 0 }
}

/** The project's newest warranty claim, which photos added to its Claim group belong to. */
export async function newestClaimId(projectId: string): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .from('warranty_claims')
    .select('id')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>()
  if (error) throw new Error(`warranty_claims: ${error.message}`)
  return data?.id ?? null
}

/** The warranty forms take at most 30 photos a field (photoUrls in warranties.ts). */
const PICK_LIMIT = 30

/**
 * Ready photos the warranty forms can reuse from a project: before and after
 * photos not on a registration yet, and claim photos not on a claim yet.
 */
export async function projectPhotos(contractorId: string, projectId: string): Promise<ProjectPhotos> {
  const { data, error } = await createAdminClient()
    .from('media_assets')
    .select('id, url, caption, file_name, stage, warranty_registration_id, warranty_claim_id')
    .eq('project_id', projectId)
    .eq('contractor_id', contractorId)
    .eq('kind', 'photo')
    .eq('status', 'ready')
    .in('stage', ['before', 'after', 'claim'])
    .order('created_at', { ascending: true })
    .limit(300)
  if (error) throw new Error(`media_assets: ${error.message}`)
  const out: ProjectPhotos = { before: [], after: [], claim: [] }
  type Row = { id: string; url: string; caption: string | null; file_name: string | null; stage: 'before' | 'after' | 'claim'; warranty_registration_id: string | null; warranty_claim_id: string | null }
  for (const r of (data ?? []) as Row[]) {
    const linked = r.stage === 'claim' ? r.warranty_claim_id : r.warranty_registration_id
    if (linked || out[r.stage].length >= PICK_LIMIT) continue
    const pick: MediaPick = { id: r.id, url: r.url, caption: r.caption, fileName: r.file_name }
    out[r.stage].push(pick)
  }
  return out
}

/* --------------------------------------------------------------- warranty */

/**
 * After a warranty registration (or claim) is saved for a project: ties the
 * project's photos that went with it (matched by URL) to it, so the gallery
 * marks them and they stay with the warranty. Only the contractor's own rows
 * on that project, only before/after photos for a registration and claim
 * photos for a claim, and only rows not tied to one yet. Never throws: the
 * registration is already saved.
 */
export async function linkWarrantyMedia(opts: { contractorId: string; projectId: string; urls: string[]; registrationId?: string; claimId?: string }): Promise<void> {
  const urls = [...new Set(opts.urls.filter(Boolean))].slice(0, 100)
  if (!urls.length || (!opts.registrationId && !opts.claimId)) return
  try {
    const now = new Date().toISOString()
    const base = createAdminClient().from('media_assets')
    const q = opts.registrationId
      ? base
          .update({ warranty_registration_id: opts.registrationId, updated_at: now })
          .in('stage', ['before', 'after'])
          .is('warranty_registration_id', null)
      : base.update({ warranty_claim_id: opts.claimId, updated_at: now }).eq('stage', 'claim').is('warranty_claim_id', null)
    const { error } = await q.eq('contractor_id', opts.contractorId).eq('project_id', opts.projectId).eq('kind', 'photo').in('url', urls)
    if (error) console.error('[contractor-media] link warranty', error.message)
  } catch (err) {
    console.error('[contractor-media] link warranty', err)
  }
}

/* ---------------------------------------------------------------- activity */

/** "6 before photos", "4 before photos and 1 after video". */
export function mediaCountPhrase(rows: Array<{ stage: MediaStage; kind: MediaKind }>): string {
  const counts = new Map<string, number>()
  for (const r of rows) {
    const key = `${r.stage}:${r.kind}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const parts = [...counts.entries()].map(([key, n]) => {
    const [stage, kind] = key.split(':') as [MediaStage, MediaKind]
    const label = stage === 'other' ? '' : `${MEDIA_STAGE_LABEL[stage].toLowerCase()} `
    return `${n} ${label}${kind}${n === 1 ? '' : 's'}`
  })
  if (parts.length <= 1) return parts[0] ?? ''
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

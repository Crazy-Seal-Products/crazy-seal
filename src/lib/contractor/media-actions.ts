'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from './activity'
import { isUuid } from './customers'
import { portalAction } from './guard'
import { MEDIA_COLS, mediaCountPhrase, mediaKey, mediaUrl, newestClaimId, presignMediaPut, toMediaItem, uploadedSize, type MediaRow } from './media'
import {
  CAPTION_MAX,
  MAX_BYTES,
  MAX_PER_PROJECT,
  MEDIA_STAGE_LABEL,
  MEDIA_STAGES,
  UPLOAD_STAGES,
  fileSize,
  mediaProblem,
  resolveMedia,
  type MediaItem,
  type MediaStage,
} from './media-shared'
import { getProjectRow } from './projects'
import type { ProjectRow } from './types'
import type { ContractorViewer } from './viewer'

/**
 * Writes to a project's photos and videos from the portal's project page.
 * Each one checks the role (portalAction('projects.edit'), refused in View
 * as) and scopes the write to the viewer's contractor and a project they can
 * see (getProjectRow: a sales rep only their own).
 *
 * An upload is three steps: startMediaUpload records the row ('uploading')
 * and returns a presigned PUT, the browser sends the file straight to S3, and
 * finishMediaUploads checks the object is there and within the size limit and
 * marks it 'ready'. Videos play from the original file: the MediaConvert
 * pipeline (src/app/api/admin/mediaconvert) is staff-only and browser-polled,
 * with nothing to finish a job server-side, so it isn't used here.
 *
 * Deleting removes the row only. The S3 object stays: there's no shared,
 * safe delete helper (the admin asset routes delete inline), and a warranty
 * registration or claim may still link to the file.
 */

type Fail = { ok: false; error: string }
export type StartUploadResult = { ok: true; item: MediaItem; uploadUrl: string; contentType: string } | Fail
export type FinishUploadsResult = { ok: true; items: MediaItem[]; failed: { id: string; error: string }[] } | Fail
export type MediaResult = { ok: true; item: MediaItem } | Fail
export type DeleteMediaResult = { ok: true } | Fail

const GONE = 'That project isn’t available any more. Reload the page.'
const MEDIA_GONE = 'That photo or video isn’t here any more. Reload the page.'
const SAVE_FAILED = 'That didn’t save. Try again, or call Crazy Seal if it keeps happening.'

function failed(err: unknown): Fail {
  console.error('[contractor-media]', err)
  return { ok: false, error: SAVE_FAILED }
}

function projectPath(id: string): string {
  return `/portal/projects/${id}/`
}

async function loadMedia(viewer: ContractorViewer, id: unknown): Promise<{ row: MediaRow; project: ProjectRow } | null> {
  if (!isUuid(id)) return null
  const { data, error } = await createAdminClient().from('media_assets').select(MEDIA_COLS).eq('id', id).eq('contractor_id', viewer.contractor.id).maybeSingle<MediaRow>()
  if (error) throw new Error(`media_assets: ${error.message}`)
  if (!data?.project_id) return null
  const project = await getProjectRow(viewer, data.project_id)
  return project ? { row: data, project } : null
}

/** Records a new upload on a project and returns where the browser PUTs the file. */
export async function startMediaUpload(input: { projectId: string; stage: string; fileName: string; mime: string; bytes: number }): Promise<StartUploadResult> {
  const g = await portalAction('projects.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const project = await getProjectRow(viewer, input?.projectId)
    if (!project) return { ok: false, error: GONE }
    const stage = UPLOAD_STAGES.find((s) => s === input.stage)
    if (!stage) return { ok: false, error: 'Pick Before, Progress, After or Claim.' }
    const fileName = String(input.fileName ?? '').trim().slice(0, 200) || 'file'
    const mime = String(input.mime ?? '').slice(0, 100)
    const bytes = Math.floor(Number(input.bytes))
    const problem = mediaProblem(fileName, mime, bytes)
    if (problem) return { ok: false, error: problem }
    const media = resolveMedia(fileName, mime)!

    const db = createAdminClient()
    const { count, error: countError } = await db
      .from('media_assets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', project.id)
      .eq('contractor_id', viewer.contractor.id)
    if (countError) throw new Error(`media_assets count: ${countError.message}`)
    if ((count ?? 0) >= MAX_PER_PROJECT) return { ok: false, error: `This project has ${MAX_PER_PROJECT} photos and videos, the most it can hold. Delete some first.` }

    const key = mediaKey(viewer.contractor.id, project.id, fileName)
    const [claimId, uploadUrl] = await Promise.all([stage === 'claim' ? newestClaimId(project.id) : Promise.resolve(null), presignMediaPut(key, media.contentType)])
    const { data, error } = await db
      .from('media_assets')
      .insert({
        contractor_id: viewer.contractor.id,
        project_id: project.id,
        warranty_claim_id: claimId,
        stage,
        kind: media.kind,
        s3_key: key,
        url: mediaUrl(key),
        mime: media.contentType,
        bytes,
        file_name: fileName,
        status: 'uploading',
        uploaded_by: viewer.hasAccount ? viewer.proUserId : null,
      })
      .select(MEDIA_COLS)
      .single<MediaRow>()
    if (error || !data) throw new Error(`media_assets insert: ${error?.message ?? 'no row'}`)
    return { ok: true, item: toMediaItem(data), uploadUrl, contentType: media.contentType }
  } catch (err) {
    return failed(err)
  }
}

/**
 * After the browser's PUTs: checks each upload reached S3 within the size
 * limit and marks it ready (an upload that didn't is removed and reported).
 * With `announce`, logs one line for the batch ("Added 6 before photos to
 * “Smith RV roof”") and refreshes the project page.
 */
export async function finishMediaUploads(input: { projectId: string; ids: string[]; announce?: boolean }): Promise<FinishUploadsResult> {
  const g = await portalAction('projects.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const project = await getProjectRow(viewer, input?.projectId)
    if (!project) return { ok: false, error: GONE }
    const ids = (Array.isArray(input.ids) ? input.ids : []).filter(isUuid).slice(0, 200)
    if (!ids.length) return { ok: true, items: [], failed: [] }

    const db = createAdminClient()
    const { data, error } = await db.from('media_assets').select(MEDIA_COLS).in('id', ids).eq('project_id', project.id).eq('contractor_id', viewer.contractor.id)
    if (error) throw new Error(`media_assets: ${error.message}`)

    const items: MediaItem[] = []
    const problems: { id: string; error: string }[] = []
    await Promise.all(
      ((data ?? []) as MediaRow[]).map(async (row) => {
        if (row.status !== 'uploading') {
          items.push(toMediaItem(row))
          return
        }
        const name = row.file_name || 'That file'
        const size = await uploadedSize(row.s3_key)
        const tooBig = typeof size === 'number' && size > MAX_BYTES[row.kind]
        if (size === 'missing' || tooBig) {
          // The row goes; an oversized object stays in the bucket (nothing here deletes from S3).
          await db.from('media_assets').delete().eq('id', row.id).eq('contractor_id', viewer.contractor.id)
          problems.push({
            id: row.id,
            error: tooBig ? `${name} is ${fileSize(size as number)}, over the ${fileSize(MAX_BYTES[row.kind])} limit.` : `${name} didn’t finish uploading. Try it again.`,
          })
          return
        }
        const { data: updated, error: uError } = await db
          .from('media_assets')
          .update({ status: 'ready', bytes: typeof size === 'number' ? size : row.bytes, updated_at: new Date().toISOString() })
          .eq('id', row.id)
          .eq('contractor_id', viewer.contractor.id)
          .select(MEDIA_COLS)
          .single<MediaRow>()
        if (uError || !updated) throw new Error(`media_assets ready: ${uError?.message ?? 'no row'}`)
        items.push(toMediaItem(updated))
      }),
    )

    if (input.announce) {
      const added = items.filter((i) => i.status === 'ready' || i.status === 'processing')
      if (added.length) {
        await logActivity(viewer, {
          entity: 'projects',
          entityId: project.id,
          action: 'create',
          summary: `Added ${mediaCountPhrase(added)} to “${project.name}”`,
        })
      }
      revalidatePath(projectPath(project.id))
    }
    return { ok: true, items, failed: problems }
  } catch (err) {
    return failed(err)
  }
}

/** Changes a photo or video's caption and/or moves it to another stage. */
export async function updateMedia(input: { id: string; caption?: string | null; stage?: string }): Promise<MediaResult> {
  const g = await portalAction('projects.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const found = await loadMedia(viewer, input?.id)
    if (!found) return { ok: false, error: MEDIA_GONE }
    const { row, project } = found
    if (row.status === 'uploading') return { ok: false, error: 'That one is still uploading.' }

    const patch: Partial<Pick<MediaRow, 'caption' | 'stage' | 'warranty_claim_id'>> = {}
    if (input.caption !== undefined) {
      const caption = typeof input.caption === 'string' ? input.caption.trim().slice(0, CAPTION_MAX) : ''
      if ((caption || null) !== row.caption) patch.caption = caption || null
    }
    let movedTo: MediaStage | null = null
    if (input.stage !== undefined) {
      const stage = MEDIA_STAGES.find((s) => s === input.stage)
      if (!stage) return { ok: false, error: 'Pick a stage.' }
      if (stage !== row.stage) {
        patch.stage = stage
        movedTo = stage
        // Moved into Claim: it belongs to the project's newest claim, as an upload there does.
        if (stage === 'claim' && !row.warranty_claim_id) patch.warranty_claim_id = await newestClaimId(project.id)
      }
    }
    if (!Object.keys(patch).length) return { ok: true, item: toMediaItem(row) }

    const { data, error } = await createAdminClient()
      .from('media_assets')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('contractor_id', viewer.contractor.id)
      .select(MEDIA_COLS)
      .single<MediaRow>()
    if (error || !data) throw new Error(`media_assets update: ${error?.message ?? 'no row'}`)

    if (movedTo) {
      await logActivity(viewer, {
        entity: 'projects',
        entityId: project.id,
        action: 'update',
        summary: `Moved a ${row.kind} from ${MEDIA_STAGE_LABEL[row.stage]} to ${MEDIA_STAGE_LABEL[movedTo]} on “${project.name}”`,
      })
    }
    revalidatePath(projectPath(project.id))
    return { ok: true, item: toMediaItem(data) }
  } catch (err) {
    return failed(err)
  }
}

/**
 * Deletes a photo or video from the project (the row; the S3 object stays).
 * Also how the browser drops an upload whose PUT failed, which isn't logged.
 */
export async function deleteMedia(input: { id: string }): Promise<DeleteMediaResult> {
  const g = await portalAction('projects.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const found = await loadMedia(viewer, input?.id)
    if (!found) return { ok: true }
    const { row, project } = found
    const { error } = await createAdminClient().from('media_assets').delete().eq('id', row.id).eq('contractor_id', viewer.contractor.id)
    if (error) throw new Error(`media_assets delete: ${error.message}`)
    if (row.status !== 'uploading') {
      const label = row.stage === 'other' ? '' : `${MEDIA_STAGE_LABEL[row.stage].toLowerCase()} `
      await logActivity(viewer, { entity: 'projects', entityId: project.id, action: 'delete', summary: `Deleted a ${label}${row.kind} from “${project.name}”` })
      revalidatePath(projectPath(project.id))
    }
    return { ok: true }
  } catch (err) {
    return failed(err)
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import type { ModuleRow } from '@/lib/portal/accelerator'
import { requirePortalAdmin } from './auth'
import { cleanModule, getAcceleratorAdmin, getModuleRow, slugify, toModuleDraft, uniqueSlug, type ModuleDraft } from './accelerator'

/**
 * Writes for Contractors → Accelerator Program. Every change shows in the Pro
 * Portal on the next page load. Each action loads the program first, which
 * seeds the tables from the built-in modules if nobody has edited them yet.
 */

function refresh() {
  // Covers the admin pages and the dealer portal (both under /portal).
  revalidatePath('/portal', 'layout')
}

async function editor() {
  const admin = await requirePortalAdmin('accelerator')
  return { by: admin.name || admin.email, at: new Date().toISOString() }
}

const isPublishable = (row: Pick<ModuleRow, 'lessons'>) => (row.lessons ?? []).length > 0

export async function saveProgram(input: { name: string; title: string; description: string }): Promise<ActionResult> {
  const { by, at } = await editor()
  const name = String(input?.name ?? '').trim().slice(0, 80)
  const title = String(input?.title ?? '').trim().slice(0, 120)
  const description = String(input?.description ?? '').trim().slice(0, 400)
  if (!name || !title) return { ok: false, error: 'Add a program name and a headline.' }
  await getAcceleratorAdmin()
  const { error } = await createAdminClient()
    .from('accelerator_program')
    .upsert({ id: 1, name, title, description, updated_at: at, updated_by: by }, { onConflict: 'id' })
  if (error) return { ok: false, error: 'Could not save. Try again.' }
  refresh()
  return { ok: true, message: 'Saved' }
}

export async function createModule(title: string): Promise<ActionResult & { slug?: string }> {
  const { by, at } = await editor()
  const clean = String(title ?? '').trim().slice(0, 120)
  if (!clean) return { ok: false, error: 'Give the module a title.' }
  const { modules } = await getAcceleratorAdmin()
  const slug = uniqueSlug(slugify(clean) || 'module', new Set(modules.map((m) => m.slug)))
  const position = Math.max(0, ...modules.map((m) => m.position)) + 1
  const { error } = await createAdminClient().from('accelerator_modules').insert({
    slug,
    position,
    title: clean,
    eyebrow: clean.slice(0, 40),
    is_published: false,
    updated_at: at,
    updated_by: by,
  })
  if (error) return { ok: false, error: 'Could not add the module. Try again.' }
  refresh()
  return { ok: true, slug }
}

export async function saveModule(slug: string, draft: ModuleDraft): Promise<ActionResult & { draft?: ModuleDraft }> {
  const { by, at } = await editor()
  await getAcceleratorAdmin()
  const row = await getModuleRow(String(slug))
  if (!row) return { ok: false, error: 'This module was deleted.' }
  const clean = cleanModule(draft)
  if (!clean.ok) return clean
  if (row.is_published && !isPublishable(clean.value)) {
    return { ok: false, error: 'A published module needs at least one lesson. Add one, or unpublish the module first.' }
  }
  const { data, error } = await createAdminClient()
    .from('accelerator_modules')
    .update({ ...clean.value, updated_at: at, updated_by: by })
    .eq('id', row.id)
    .select('*')
    .single<ModuleRow>()
  if (error || !data) return { ok: false, error: 'Could not save. Try again.' }
  refresh()
  return { ok: true, message: 'Saved', draft: toModuleDraft(data) }
}

export async function setModulePublished(slug: string, published: boolean): Promise<ActionResult> {
  const { by, at } = await editor()
  const { modules } = await getAcceleratorAdmin()
  const row = modules.find((m) => m.slug === slug)
  if (!row) return { ok: false, error: 'Not found' }
  if (published && !isPublishable(row)) return { ok: false, error: 'Add at least one lesson (and save) before publishing.' }
  if (!published && modules.filter((m) => m.is_published).length <= 1) {
    return { ok: false, error: 'Keep at least one module published.' }
  }
  const { error } = await createAdminClient()
    .from('accelerator_modules')
    .update({ is_published: published, updated_at: at, updated_by: by })
    .eq('id', row.id)
  if (error) return { ok: false, error: 'Could not save. Try again.' }
  refresh()
  return { ok: true, message: published ? 'Published' : 'Moved to drafts' }
}

export async function moveModule(slug: string, direction: 'up' | 'down'): Promise<ActionResult> {
  await editor()
  const { modules } = await getAcceleratorAdmin()
  const from = modules.findIndex((m) => m.slug === slug)
  const to = direction === 'up' ? from - 1 : from + 1
  if (from < 0 || to < 0 || to >= modules.length) return { ok: true }
  const order = [...modules]
  ;[order[from], order[to]] = [order[to], order[from]]
  const supabase = createAdminClient()
  const results = await Promise.all(
    order.map((m, i) => (m.position === i + 1 ? null : supabase.from('accelerator_modules').update({ position: i + 1 }).eq('id', m.id))),
  )
  if (results.some((r) => r?.error)) return { ok: false, error: 'Could not reorder. Try again.' }
  refresh()
  return { ok: true }
}

export async function deleteModule(slug: string): Promise<ActionResult> {
  await editor()
  const { modules } = await getAcceleratorAdmin()
  const row = modules.find((m) => m.slug === slug)
  if (!row) return { ok: true }
  if (row.is_published && modules.filter((m) => m.is_published).length <= 1) {
    return { ok: false, error: 'Keep at least one module published.' }
  }
  const { error } = await createAdminClient().from('accelerator_modules').delete().eq('id', row.id)
  if (error) return { ok: false, error: 'Could not delete. Try again.' }
  refresh()
  return { ok: true, message: 'Deleted' }
}

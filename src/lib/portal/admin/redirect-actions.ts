'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin } from './auth'
import { cleanSource, findLoop, validateRedirect, type ManagedRedirect } from './redirects'

/**
 * Writes to `managed_redirects`. Rows go live on crazyseal.com within a
 * minute (src/proxy.ts caches the enabled rows for 60 seconds), so every
 * change is validated here first, the way the old Redirects page did.
 */

export interface RedirectInput {
  source: string
  destination: string
  permanent: boolean
  notes: string
}

const UUID_RE = /^[0-9a-f-]{36}$/i

function refresh() {
  revalidatePath('/portal/admin/redirects')
}

async function liveRulesExcept(id: string | null) {
  let query = createAdminClient().from('managed_redirects').select('id, source, destination').eq('enabled', true)
  if (id) query = query.neq('id', id)
  const { data, error } = await query.returns<Pick<ManagedRedirect, 'id' | 'source' | 'destination'>[]>()
  if (error) throw new Error(error.message)
  return data ?? []
}

function loopError(chain: string[]) {
  return `That would create a redirect loop: ${chain.join(' → ')}.`
}

export async function saveRedirect(id: string | null, input: RedirectInput): Promise<ActionResult & { id?: string }> {
  await requirePortalAdmin('redirects')
  if (id && !UUID_RE.test(id)) return { ok: false, error: 'Unknown redirect' }
  const source = String(input?.source ?? '')
  const destination = String(input?.destination ?? '')
  const invalid = validateRedirect(source, destination)
  if (invalid) return { ok: false, error: invalid }

  const payload = {
    source: cleanSource(source),
    destination: destination.trim(),
    permanent: input.permanent !== false,
    notes: String(input.notes ?? '').trim() || null,
    updated_at: new Date().toISOString(),
  }

  try {
    const chain = findLoop(payload.source, payload.destination, await liveRulesExcept(id))
    if (chain) return { ok: false, error: loopError(chain) }
  } catch {
    return { ok: false, error: 'Could not check the other redirects. Try again.' }
  }

  const supabase = createAdminClient()
  const res = id
    ? await supabase.from('managed_redirects').update(payload).eq('id', id).select('id').single()
    : await supabase.from('managed_redirects').insert(payload).select('id').single()
  if (res.error) {
    return { ok: false, error: res.error.code === '23505' ? 'A redirect for that source path already exists.' : 'Could not save the redirect.' }
  }
  refresh()
  return { ok: true, message: id ? 'Saved' : 'Created', id: res.data.id }
}

export async function setRedirectEnabled(id: string, enabled: boolean): Promise<ActionResult> {
  await requirePortalAdmin('redirects')
  if (!UUID_RE.test(id)) return { ok: false, error: 'Unknown redirect' }
  const supabase = createAdminClient()

  if (enabled) {
    const { data: row } = await supabase.from('managed_redirects').select('source, destination').eq('id', id).maybeSingle()
    if (!row) return { ok: false, error: 'Redirect not found' }
    try {
      const chain = findLoop(row.source, row.destination, await liveRulesExcept(id))
      if (chain) return { ok: false, error: loopError(chain) }
    } catch {
      return { ok: false, error: 'Could not check the other redirects. Try again.' }
    }
  }

  const { error } = await supabase
    .from('managed_redirects')
    .update({ enabled: !!enabled, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  refresh()
  return { ok: true, message: enabled ? 'Live' : 'Turned off' }
}

export async function deleteRedirect(id: string): Promise<ActionResult> {
  await requirePortalAdmin('redirects')
  if (!UUID_RE.test(id)) return { ok: false, error: 'Unknown redirect' }
  const { error } = await createAdminClient().from('managed_redirects').delete().eq('id', id)
  if (error) return { ok: false, error: 'Could not delete' }
  refresh()
  return { ok: true, message: 'Deleted' }
}

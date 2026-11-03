'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin } from './auth'
import { clearAdminCache } from './cache'
import { LEAD_STATUSES } from './leads'

export async function setLeadStatus(id: string, status: string): Promise<ActionResult> {
  await requirePortalAdmin()
  if (!LEAD_STATUSES.some((s) => s.key === status)) return { ok: false, error: 'Unknown status' }
  const { error } = await createAdminClient().from('leads').update({ status }).eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  // The "new applications" badge counts business leads with status new.
  clearAdminCache()
  revalidatePath('/portal/admin', 'layout')
  return { ok: true }
}

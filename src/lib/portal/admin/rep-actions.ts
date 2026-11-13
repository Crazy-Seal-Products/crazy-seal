'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { logAccess } from './access-log'
import { requirePortalAdmin } from './auth'
import { forget } from './cache'
import { getRepRoster, ROSTER_CACHE_KEY, staffLogins } from './reps'

/**
 * Writes to `sales_reps` (migration 025). Managing reps is part of managing
 * people, so it takes the Users & roles section: linking a login decides
 * whose numbers a Sales rep sees.
 */

export interface RepInput {
  /** The tag on their orders. */
  name: string
  /** Admin login to link, or '' for none. */
  staffEmail: string
  /** Dollars, or '' for no goal. */
  monthlyGoal: string
  active: boolean
}

const UUID_RE = /^[0-9a-f-]{36}$/i
// Shopify splits tags on commas, so a rep's name can't hold one.
const NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} .'’-]{0,39}$/u

export async function saveRep(id: string | null, input: RepInput): Promise<ActionResult> {
  const admin = await requirePortalAdmin('users')
  if (id && !UUID_RE.test(id)) return { ok: false, error: 'Unknown rep' }

  const roster = await getRepRoster()
  if (!roster.stored) return { ok: false, error: 'Run migration 025_sales_reps.sql first.' }

  const name = String(input?.name ?? '').trim().replace(/\s+/g, ' ')
  if (!NAME_RE.test(name)) return { ok: false, error: 'Use the name exactly as it’s tagged on orders: letters, numbers and spaces, up to 40 characters.' }

  const email = String(input?.staffEmail ?? '').trim().toLowerCase() || null
  if (email && !(await staffLogins()).some((s) => s.email === email)) return { ok: false, error: 'That login isn’t an active admin user.' }

  const goalRaw = String(input?.monthlyGoal ?? '').replace(/[$,\s]/g, '')
  const goal = goalRaw ? Number(goalRaw) : null
  if (goal != null && !(Number.isFinite(goal) && goal >= 0 && goal < 100_000_000)) return { ok: false, error: 'Enter the monthly goal in dollars, or leave it empty.' }

  const before = id ? roster.reps.find((r) => r.id === id) : null
  if (id && !before) return { ok: false, error: 'Unknown rep' }

  const row = { name, staff_email: email, monthly_goal: goal, is_active: Boolean(input?.active), updated_at: new Date().toISOString(), updated_by: admin.email }
  const db = createAdminClient()
  const { error } = id ? await db.from('sales_reps').update(row).eq('id', id) : await db.from('sales_reps').insert(row)
  if (error) {
    if (error.code === '23505') return { ok: false, error: /email/i.test(error.message) ? 'That login is already linked to another rep.' : `There’s already a rep named ${name}.` }
    return { ok: false, error: error.message }
  }

  // Linking decides whose numbers a login sees, so it goes in the access log.
  const was = before?.staffEmail ?? null
  if (was !== email) {
    if (was) await logAccess(admin, 'sales_rep_link', was, { rep: before?.name ?? name, linked: false })
    if (email) await logAccess(admin, 'sales_rep_link', email, { rep: name, linked: true })
  }

  forget(ROSTER_CACHE_KEY)
  revalidatePath('/portal/admin/reps')
  return { ok: true, message: 'Saved' }
}

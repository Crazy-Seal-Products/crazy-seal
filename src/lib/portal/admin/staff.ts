import { createAdminClient } from '@/lib/supabase/admin'
import type { StaffRow } from './auth'

/**
 * Staff accounts: rows in `staff`, each tied to a Supabase auth user. These
 * are the people who can sign in to the Crazy Seal Admin (see ./auth).
 */

export interface StaffMember extends StaffRow {
  lastSignInAt: string | null
  /** Signed in within the last 30 days. */
  recent: boolean
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000

export async function getStaff(): Promise<StaffMember[]> {
  const db = createAdminClient()
  const { data } = await db.from('staff').select('*').order('created_at', { ascending: true })
  const rows = (data ?? []) as StaffRow[]

  const signIns = await Promise.all(
    rows.map(async (r) => {
      if (!r.auth_user_id) return null
      const { data: u } = await db.auth.admin.getUserById(r.auth_user_id)
      return u?.user?.last_sign_in_at ?? null
    }),
  )

  const now = Date.now()
  return rows
    .map((r, i) => {
      const lastSignInAt = signIns[i]
      return { ...r, lastSignInAt, recent: Boolean(lastSignInAt && now - Date.parse(lastSignInAt) < MONTH_MS) }
    })
    .sort((a, b) => Number(b.is_active) - Number(a.is_active))
}

/** Supabase has no lookup by email, so page through the (small) user list. */
export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const db = createAdminClient()
  const wanted = email.toLowerCase()
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const hit = data.users.find((u) => u.email?.toLowerCase() === wanted)
    if (hit) return hit.id
    if (data.users.length < 200) return null
  }
  return null
}

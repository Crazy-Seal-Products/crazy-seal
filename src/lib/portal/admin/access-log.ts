import { createAdminClient } from '@/lib/supabase/admin'

/**
 * `admin_access_log`: admin sign-ins and every change to who can do what in
 * the admin. Writing never throws, so a logging hiccup can't block a sign-in
 * or a role change.
 */

export type AccessAction =
  | 'sign_in'
  | 'role_change'
  | 'access_on'
  | 'access_off'
  | 'staff_added'
  | 'password_reset'
  | 'permissions'

export interface AccessLogRow {
  id: string
  actor_email: string
  actor_name: string | null
  target_email: string | null
  action: AccessAction
  detail: Record<string, unknown> | null
  created_at: string
}

export async function logAccess(
  actor: { email: string; name?: string | null },
  action: AccessAction,
  target: string | null,
  detail?: Record<string, unknown>,
): Promise<void> {
  try {
    const { error } = await createAdminClient()
      .from('admin_access_log')
      .insert({ actor_email: actor.email, actor_name: actor.name ?? null, target_email: target, action, detail: detail ?? null })
    if (error) console.error('[access-log]', error.message)
  } catch (err) {
    console.error('[access-log]', err)
  }
}

/** Latest entries, optionally only those by or about one email. Empty if the table isn't there yet. */
export async function recentAccess(opts: { email?: string; limit?: number } = {}): Promise<AccessLogRow[]> {
  let query = createAdminClient()
    .from('admin_access_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 20)
  if (opts.email) {
    // Quoted so a comma or bracket in an address can't break the filter.
    const v = `"${opts.email.replace(/["\\]/g, '\\$&')}"`
    query = query.or(`actor_email.eq.${v},target_email.eq.${v}`)
  }
  const { data, error } = await query
  if (error) {
    console.error('[access-log]', error.message)
    return []
  }
  return (data ?? []) as AccessLogRow[]
}

import { createAdminClient } from '@/lib/supabase/admin'
import type { TeamMember } from './types'

/**
 * A contractor's team: contractor_members with each member's Pro Hub account.
 * Disabled members are included (the Team page shows them); pickers for
 * "assigned to" should use activeTeam().
 */
export async function listTeam(contractorId: string): Promise<TeamMember[]> {
  const db = createAdminClient()
  const { data: members, error } = await db
    .from('contractor_members')
    .select('pro_user_id, contractor_id, role, status, title, invited_by, created_at, updated_at')
    .eq('contractor_id', contractorId)
    .order('created_at')
  if (error) throw new Error(`contractor_members: ${error.message}`)
  if (!members?.length) return []
  const { data: users, error: usersError } = await db
    .from('pro_users')
    .select('id, email, display_name, phone, last_login_at, password_hash')
    .in(
      'id',
      members.map((m) => m.pro_user_id),
    )
  if (usersError) throw new Error(`pro_users: ${usersError.message}`)
  const byId = new Map((users ?? []).map((u) => [u.id as string, u]))
  return members.map((m) => {
    const u = byId.get(m.pro_user_id)
    return {
      ...(m as Omit<TeamMember, 'email' | 'name' | 'phone' | 'last_login_at' | 'has_password'>),
      email: (u?.email as string) ?? '',
      name: (u?.display_name as string | null) ?? null,
      phone: (u?.phone as string | null) ?? null,
      last_login_at: (u?.last_login_at as string | null) ?? null,
      has_password: Boolean(u?.password_hash),
    }
  })
}

/** Members who can be assigned work (not disabled). */
export async function activeTeam(contractorId: string): Promise<TeamMember[]> {
  return (await listTeam(contractorId)).filter((m) => m.status !== 'disabled')
}

/** "Jordan Ellis", or their email. */
export function memberName(m: Pick<TeamMember, 'name' | 'email'> | null | undefined): string {
  return m?.name?.trim() || m?.email || 'Unassigned'
}

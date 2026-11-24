import { createAdminClient } from '@/lib/supabase/admin'
import type { ActivityAction, ActivityRow } from './types'
import type { ContractorViewer } from './viewer'
import { ROLE_INFO } from './roles'

/**
 * The contractor's activity log (contractor_activity): who did what in their
 * portal, in plain words ("Jordan moved Smith RV roof to Won"). Writing never
 * throws: a failed log line must not fail the change it describes.
 */

export interface ActivityInput {
  actorId: string | null
  actorName: string
  actorRole: string | null
  entity: string
  entityId: string | null
  action: ActivityAction
  summary: string
  changes?: Record<string, [unknown, unknown]> | null
}

export async function logContractorActivity(contractorId: string, input: ActivityInput): Promise<void> {
  try {
    const { error } = await createAdminClient()
      .from('contractor_activity')
      .insert({
        contractor_id: contractorId,
        actor_id: input.actorId,
        actor_name: input.actorName.slice(0, 120),
        actor_role: input.actorRole,
        entity: input.entity,
        entity_id: input.entityId,
        action: input.action,
        summary: input.summary.slice(0, 500),
        changes: input.changes && Object.keys(input.changes).length ? input.changes : null,
      })
    if (error) console.error('[contractor-activity] insert failed', error.message)
  } catch (err) {
    console.error('[contractor-activity] insert failed', err)
  }
}

/** Logs an action the signed-in team member took. */
export async function logActivity(
  viewer: ContractorViewer,
  entry: { entity: string; entityId?: string | null; action: ActivityAction; summary: string; changes?: ActivityInput['changes'] },
): Promise<void> {
  await logContractorActivity(viewer.contractor.id, {
    actorId: viewer.hasAccount ? viewer.proUserId : null,
    actorName: viewer.name,
    actorRole: viewer.role,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    action: entry.action,
    summary: entry.summary,
    changes: entry.changes ?? null,
  })
}

/** Field-by-field [before, after] for the fields that changed. */
export function diff<T extends Record<string, unknown>>(before: T, after: Partial<T>): Record<string, [unknown, unknown]> {
  const out: Record<string, [unknown, unknown]> = {}
  for (const [key, value] of Object.entries(after)) {
    const old = before[key]
    if (JSON.stringify(old ?? null) !== JSON.stringify(value ?? null)) out[key] = [old ?? null, value ?? null]
  }
  return out
}

export async function listActivity(contractorId: string, opts: { limit?: number; entity?: string; entityId?: string } = {}): Promise<ActivityRow[]> {
  let q = createAdminClient()
    .from('contractor_activity')
    .select('*')
    .eq('contractor_id', contractorId)
    .order('at', { ascending: false })
    .limit(Math.min(opts.limit ?? 100, 500))
  if (opts.entity) q = q.eq('entity', opts.entity)
  if (opts.entityId) q = q.eq('entity_id', opts.entityId)
  const { data, error } = await q
  if (error) throw new Error(`contractor_activity: ${error.message}`)
  return (data ?? []) as ActivityRow[]
}

/** "Owner", "Sales rep", "Crazy Seal", or the stored role as-is. */
export function actorRoleLabel(role: string | null): string {
  if (!role) return ''
  if (role === 'crazy_seal') return 'Crazy Seal'
  return ROLE_INFO[role as keyof typeof ROLE_INFO]?.label ?? role
}

'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { diff, logActivity } from './activity'
import { FormError, getCustomer, insertCustomer, parseCustomerInput, resolveAssignee } from './customers'
import { portalAction, type PortalResult } from './guard'
import { can } from './roles'
import { activeTeam } from './team-data'
import type { CustomerRow } from './types'

/**
 * Adds or edits one of the contractor's customers (customers.edit: everyone
 * but operations, who can only look). A sales rep's new customers are theirs,
 * and they can't hand a customer to someone else. With an `id` the form edits
 * that customer, scoped to the viewer's contractor; without one it adds.
 */
export async function saveCustomer(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('customers.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const team = await activeTeam(viewer.contractor.id)
    const id = fd.get('id')

    if (typeof id !== 'string' || !id) {
      const input = parseCustomerInput(fd)
      const assignedTo = resolveAssignee(viewer, fd, 'assigned_to', team, viewer.hasAccount ? viewer.proUserId : null)
      const row = await insertCustomer(viewer, input, assignedTo)
      revalidatePath('/portal', 'layout')
      return { ok: true, id: row.id, message: `Added ${row.name}.` }
    }

    const before = await getCustomer(viewer, id)
    if (!before) throw new FormError('That customer isn’t available any more. Reload the page.')
    const input = parseCustomerInput(fd, '', before)
    const assignedTo = can(viewer.role, 'sales.view_all') ? resolveAssignee(viewer, fd, 'assigned_to', team, before.assigned_to, before.assigned_to) : before.assigned_to
    const patch: Partial<CustomerRow> = { ...input, assigned_to: assignedTo }
    const changes = diff(before as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    if (!Object.keys(changes).length) return { ok: true, id: before.id, message: 'Nothing changed.' }

    const { data, error } = await createAdminClient()
      .from('contractor_customers')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', before.id)
      .eq('contractor_id', viewer.contractor.id)
      .select('id')
    if (error) throw new Error(`contractor_customers update: ${error.message}`)
    if (!data?.length) throw new FormError('That customer isn’t available any more. Reload the page.')
    await logActivity(viewer, { entity: 'customers', entityId: before.id, action: 'update', summary: `Updated customer ${input.name}`, changes })
    revalidatePath('/portal', 'layout')
    return { ok: true, id: before.id, message: 'Saved.' }
  } catch (err) {
    if (err instanceof FormError) return { ok: false, error: err.message }
    console.error('[contractor-customers]', err)
    return { ok: false, error: 'That didn’t save. Try again, or call Crazy Seal if it keeps happening.' }
  }
}

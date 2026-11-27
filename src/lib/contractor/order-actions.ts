'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from './activity'
import { portalAction, type GuardResult, type PortalResult } from './guard'
import { contractorOwnsOrder } from './orders'
import { can } from './roles'

/**
 * Orders page writes: link one of the contractor's Shopify orders to one of
 * their projects (contractor_project_orders, linked_by = the person's email).
 * Needs orders.create or projects.edit, and a role that can see orders.
 */

async function linker(): Promise<GuardResult> {
  const viaOrders = await portalAction('orders.create')
  if (viaOrders.ok) return viaOrders
  const viaProjects = await portalAction('projects.edit')
  if (!viaProjects.ok) return viaOrders
  if (!can(viaProjects.viewer.role, 'orders.view')) return { ok: false, error: 'Your role can’t see orders. Ask your company’s owner or admin.' }
  return viaProjects
}

export async function linkOrderToProject(shopifyOrderId: string, projectId: string): Promise<PortalResult> {
  const g = await linker()
  if (!g.ok) return g
  const viewer = g.viewer
  if (!/^[0-9a-f-]{36}$/i.test(String(projectId ?? ''))) return { ok: false, error: 'Pick a project.' }

  const db = createAdminClient()
  const [{ data: project }, order] = await Promise.all([
    db.from('contractor_projects').select('id, name').eq('id', projectId).eq('contractor_id', viewer.contractor.id).maybeSingle<{ id: string; name: string }>(),
    contractorOwnsOrder(viewer.contractor, String(shopifyOrderId ?? '')),
  ])
  if (!project) return { ok: false, error: 'That project isn’t one of yours. Refresh the page.' }
  if (!order) return { ok: false, error: 'That order isn’t one of your company’s.' }

  const { data: inserted, error } = await db
    .from('contractor_project_orders')
    .upsert({ project_id: project.id, shopify_order_id: shopifyOrderId, linked_by: viewer.email || viewer.name }, { onConflict: 'project_id,shopify_order_id', ignoreDuplicates: true })
    .select('project_id')
  if (error) {
    console.error('[contractor-orders] link', error.message)
    return { ok: false, error: 'Could not link the order. Try again.' }
  }
  if (!inserted?.length) return { ok: true, message: `${order.name} is already on ${project.name}` }

  await logActivity(viewer, {
    entity: 'projects',
    entityId: project.id,
    action: 'update',
    summary: `${viewer.firstName} linked order ${order.name} to ${project.name}`,
  })
  revalidatePath('/portal/orders/')
  revalidatePath(`/portal/projects/${project.id}/`)
  return { ok: true, message: `Linked ${order.name} to ${project.name}` }
}

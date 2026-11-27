import { createAdminClient } from '@/lib/supabase/admin'
import type { ProUser } from '@/lib/pro/auth'
import type { ShopifyOrder } from '@/lib/pro/shopify'
import { loadCustomerAndOrders } from '@/lib/shopify/commerce'
import type { PortalContractor } from './types'

/**
 * Orders in the portal: the contractor's Crazy Seal orders plus everything
 * the Pro Hub showed for the signed-in account, newest first, each once.
 *
 * The contractor's orders come from the local copy of Shopify (shopify_orders)
 * for the Shopify customers linked to the contractor
 * (contractors.shopify_customer_ids) and each active team member's (their
 * pro_users.shopify_customer_id, or the customer with their email). The
 * account's own orders come from the Pro Hub's loader (loadCustomerAndOrders),
 * which reads the same copy and only asks Shopify when the copy doesn't have
 * the customer yet. Nothing here changes an account.
 */

export interface OrderLine {
  title: string
  quantity: number
  /** For re-ordering (/api/store/checkout). */
  variantId: string | null
}

export interface PortalOrder {
  shopifyId: string
  name: string
  createdAt: string | null
  total: number | null
  financialStatus: string | null
  fulfillmentStatus: string | null
  cancelled: boolean
  itemCount: number
  customerName: string | null
  lines: OrderLine[]
  /** Projects this order is linked to (contractor_project_orders). */
  projects: { id: string; name: string }[]
}

export interface PortalOrders {
  orders: PortalOrder[]
  /** The account's orders couldn't be loaded (Shopify was asked and failed). */
  shopifyError: string | null
}

export interface CheckoutQuote {
  id: string
  number: string
  name: string
  total: number
  invoiceUrl: string | null
  checkoutAt: string | null
  project: { id: string; name: string } | null
}

export interface ProjectOption {
  id: string
  name: string
  stage: string
}

/** The contractor fields the order lookups need. */
export type OrderContractor = Pick<PortalContractor, 'id' | 'shopify_customer_ids'>

const ORDER_LIMIT = 200

/**
 * The Shopify customer ids whose orders are this contractor's. Only active
 * team members count: an invited email hasn't proved it's theirs yet, and a
 * member whose access is off no longer brings their orders in.
 */
export async function contractorCustomerIds(contractor: OrderContractor): Promise<string[]> {
  const db = createAdminClient()
  const ids = new Set((contractor.shopify_customer_ids ?? []).filter(Boolean))
  const { data: members, error } = await db.from('contractor_members').select('pro_user_id').eq('contractor_id', contractor.id).eq('status', 'active')
  if (error) throw new Error(`contractor_members: ${error.message}`)
  if (members?.length) {
    const { data: users, error: usersError } = await db
      .from('pro_users')
      .select('email, shopify_customer_id')
      .in(
        'id',
        members.map((m: { pro_user_id: string }) => m.pro_user_id),
      )
    if (usersError) throw new Error(`pro_users: ${usersError.message}`)
    const people = (users ?? []) as { email: string | null; shopify_customer_id: string | null }[]
    for (const u of people) if (u.shopify_customer_id) ids.add(u.shopify_customer_id)
    // The customer with a member's email (exact match, any case). PostgREST reads `*` in a like
    // pattern as a wildcard whatever the escaping, so such emails are skipped, and every row
    // found is checked for exact equality.
    const emails = [...new Set(people.map((u) => u.email?.trim().toLowerCase()).filter((e): e is string => Boolean(e) && !e!.includes('*')))]
    const byEmail = await Promise.all(
      emails.map(async (email) => {
        const { data } = await db
          .from('shopify_customers')
          .select('shopify_id, email')
          .ilike('email', email.replace(/[\\%_]/g, '\\$&'))
          .is('deleted_at', null)
          .limit(5)
        return ((data ?? []) as { shopify_id: string; email: string | null }[]).filter((c) => c.email?.trim().toLowerCase() === email)
      }),
    )
    for (const rows of byEmail) for (const c of rows) ids.add(c.shopify_id)
  }
  return [...ids]
}

interface OrderRow {
  shopify_id: string
  name: string
  shopify_created_at: string | null
  total_price: number | string | null
  current_total_price: number | string | null
  financial_status: string | null
  fulfillment_status: string | null
  cancelled_at: string | null
  customer_display_name: string | null
  shopify_order_line_items: { title: string | null; quantity: number | null; variant_shopify_id: string | null }[] | null
}

const num = (v: number | string | null | undefined) => (v === null || v === undefined || v === '' ? null : Number(v))

/** The contractor's orders from the local copy (no project links yet). */
async function companyOrders(contractor: OrderContractor): Promise<PortalOrder[]> {
  const customerIds = await contractorCustomerIds(contractor)
  if (!customerIds.length) return []
  const { data, error } = await createAdminClient()
    .from('shopify_orders')
    .select(
      'shopify_id, name, shopify_created_at, total_price, current_total_price, financial_status, fulfillment_status, cancelled_at, customer_display_name, shopify_order_line_items(title, quantity, variant_shopify_id)',
    )
    .in('customer_shopify_id', customerIds)
    .is('deleted_at', null)
    .eq('test', false)
    .order('shopify_created_at', { ascending: false })
    .limit(ORDER_LIMIT)
  if (error) throw new Error(`shopify_orders: ${error.message}`)
  return ((data ?? []) as unknown as OrderRow[]).map((o) => {
    const lines = (o.shopify_order_line_items ?? []).map((li) => ({ title: li.title || 'Item', quantity: Number(li.quantity) || 0, variantId: li.variant_shopify_id }))
    return {
      shopifyId: o.shopify_id,
      name: o.name,
      createdAt: o.shopify_created_at,
      total: num(o.current_total_price) ?? num(o.total_price),
      financialStatus: o.financial_status,
      fulfillmentStatus: o.fulfillment_status,
      cancelled: Boolean(o.cancelled_at),
      itemCount: lines.reduce((n, li) => n + li.quantity, 0),
      customerName: o.customer_display_name,
      lines,
      projects: [],
    }
  })
}

function fromShopifyOrder(o: ShopifyOrder): PortalOrder {
  const lines = o.lineItems.map((li) => ({ title: li.title, quantity: li.quantity, variantId: li.variantId }))
  return {
    shopifyId: o.id,
    name: o.name,
    createdAt: o.createdAt,
    total: num(o.total),
    financialStatus: o.financialStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    cancelled: false,
    itemCount: lines.reduce((n, li) => n + li.quantity, 0),
    customerName: null,
    lines,
    projects: [],
  }
}

/** Back to the Pro Hub's order shape, for its warranty loader (loadJobsForPro). */
export function toShopifyOrder(o: PortalOrder): ShopifyOrder {
  return {
    id: o.shopifyId,
    name: o.name,
    createdAt: o.createdAt ?? new Date(0).toISOString(),
    fulfillmentStatus: o.fulfillmentStatus,
    financialStatus: o.financialStatus,
    total: o.total === null ? null : String(o.total),
    currency: null,
    lineItems: o.lines.map((li) => ({ ...li, sku: null })),
  }
}

/** The account's own orders, as the Pro Hub loaded them. */
async function accountOrders(user: ProUser): Promise<{ orders: PortalOrder[]; error: string | null }> {
  if (!user.email) return { orders: [], error: null }
  try {
    const { orders } = await loadCustomerAndOrders(user.email)
    return { orders: orders.map(fromShopifyOrder), error: null }
  } catch (err) {
    console.error('[portal-orders] account orders', err)
    return { orders: [], error: 'Some of your orders couldn’t be loaded from the store just now. Try again in a minute.' }
  }
}

async function attachProjects(contractorId: string, orders: PortalOrder[]): Promise<void> {
  if (!orders.length) return
  const db = createAdminClient()
  const { data: links, error } = await db
    .from('contractor_project_orders')
    .select('project_id, shopify_order_id')
    .in(
      'shopify_order_id',
      orders.map((o) => o.shopifyId),
    )
  if (error) throw new Error(`contractor_project_orders: ${error.message}`)
  const rows = (links ?? []) as { project_id: string; shopify_order_id: string }[]
  if (!rows.length) return
  const { data: projects, error: projectError } = await db
    .from('contractor_projects')
    .select('id, name')
    .eq('contractor_id', contractorId)
    .in('id', [...new Set(rows.map((l) => l.project_id))])
  if (projectError) throw new Error(`contractor_projects: ${projectError.message}`)
  const names = new Map(((projects ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name]))
  for (const o of orders) {
    o.projects = rows.filter((l) => l.shopify_order_id === o.shopifyId && names.has(l.project_id)).map((l) => ({ id: l.project_id, name: names.get(l.project_id)! }))
  }
}

/**
 * The orders the portal shows: the contractor's (when there is one) and the
 * signed-in account's, each once, newest first, with the contractor's
 * projects each is linked to. `user` is null in a base view with no account.
 */
export async function loadPortalOrders(user: ProUser | null, contractor?: OrderContractor | null): Promise<PortalOrders> {
  const [company, account] = await Promise.all([
    contractor ? companyOrders(contractor) : Promise.resolve([]),
    user ? accountOrders(user) : Promise.resolve({ orders: [], error: null }),
  ])
  const byId = new Map<string, PortalOrder>()
  for (const o of [...company, ...account.orders]) if (!byId.has(o.shopifyId)) byId.set(o.shopifyId, o)
  const orders = [...byId.values()].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, ORDER_LIMIT)
  if (contractor) await attachProjects(contractor.id, orders)
  return { orders, shopifyError: account.error }
}

/** Is this Shopify order one of the contractor's? */
export async function contractorOwnsOrder(contractor: OrderContractor, shopifyOrderId: string): Promise<{ name: string } | null> {
  const { data, error } = await createAdminClient()
    .from('shopify_orders')
    .select('name, customer_shopify_id')
    .eq('shopify_id', shopifyOrderId)
    .is('deleted_at', null)
    .maybeSingle<{ name: string; customer_shopify_id: string | null }>()
  if (error) throw new Error(`shopify_orders: ${error.message}`)
  if (!data?.customer_shopify_id) return null
  const ids = await contractorCustomerIds(contractor)
  return ids.includes(data.customer_shopify_id) ? { name: data.name } : null
}

/** Quotes the contractor started checkout on and hasn't paid yet, with their Shopify checkout link. */
export async function listCheckoutQuotes(contractorId: string): Promise<CheckoutQuote[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('quotes')
    .select('id, number, name, total, invoice_url, checkout_at, project_id')
    .eq('contractor_id', contractorId)
    .eq('status', 'checkout')
    .order('checkout_at', { ascending: false, nullsFirst: false })
    .limit(50)
  if (error) throw new Error(`quotes: ${error.message}`)
  const rows = (data ?? []) as { id: string; number: string; name: string; total: number | string; invoice_url: string | null; checkout_at: string | null; project_id: string | null }[]
  const projectIds = [...new Set(rows.map((r) => r.project_id).filter((id): id is string => Boolean(id)))]
  const names = new Map<string, string>()
  if (projectIds.length) {
    const { data: projects } = await db.from('contractor_projects').select('id, name').eq('contractor_id', contractorId).in('id', projectIds)
    for (const p of (projects ?? []) as { id: string; name: string }[]) names.set(p.id, p.name)
  }
  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    name: r.name,
    total: Number(r.total) || 0,
    invoiceUrl: r.invoice_url,
    checkoutAt: r.checkout_at,
    project: r.project_id && names.has(r.project_id) ? { id: r.project_id, name: names.get(r.project_id)! } : null,
  }))
}

/** The contractor's projects, most recently changed first, for "link to project" pickers. */
export async function projectOptions(contractorId: string): Promise<ProjectOption[]> {
  const { data, error } = await createAdminClient()
    .from('contractor_projects')
    .select('id, name, stage')
    .eq('contractor_id', contractorId)
    .order('updated_at', { ascending: false })
    .limit(300)
  if (error) throw new Error(`contractor_projects: ${error.message}`)
  return (data ?? []) as ProjectOption[]
}

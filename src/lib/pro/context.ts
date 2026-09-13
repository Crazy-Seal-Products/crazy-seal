import { createAdminClient } from '@/lib/supabase/admin'
import type { ProUser } from './auth'
import { REBATE_MILESTONES, type ProStatus } from './config'
import { loadCustomerAndOrders } from '@/lib/shopify/commerce'
import type { ShopifyCustomerSummary, ShopifyOrder } from './shopify'
import { deriveStatuses, orderNumberVariants } from './status'

export interface ProContext {
  user: ProUser
  statuses: ProStatus[]
  customer: ShopifyCustomerSummary | null
  orders: ShopifyOrder[]
  shopifyError: string | null
}

export async function loadProContext(user: ProUser): Promise<ProContext> {
  let customer: ShopifyCustomerSummary | null = null
  let orders: ShopifyOrder[] = []
  let shopifyError: string | null = null

  try {
    const loaded = await loadCustomerAndOrders(user.email)
    customer = loaded.customer
    orders = loaded.orders
    if (customer) {
      if (customer.id !== user.shopify_customer_id || customer.displayName !== user.display_name) {
        const supabase = createAdminClient()
        await supabase
          .from('pro_users')
          .update({
            shopify_customer_id: customer.id,
            display_name: user.display_name || customer.displayName,
            phone: user.phone || customer.phone,
          })
          .eq('id', user.id)
      }
    }
  } catch (err) {
    shopifyError = err instanceof Error ? err.message : String(err)
    console.error('[pro] Shopify lookup failed:', shopifyError)
  }

  const statuses = deriveStatuses({
    tags: customer?.tags ?? [],
    orderCount: customer?.numberOfOrders ?? orders.length,
    statusOverride: user.status_override,
  })

  return { user, statuses, customer, orders, shopifyError }
}

export function nextRebate(orderCount: number): { current: number; next: number; remaining: number } | null {
  const next = REBATE_MILESTONES.find((m) => orderCount < m)
  if (!next) return { current: orderCount, next: orderCount, remaining: 0 }
  return { current: orderCount, next, remaining: next - orderCount }
}

export function orderHasWarranty(orderName: string, warrantyOrderNumbers: string[]): boolean {
  const variants = new Set(orderNumberVariants(orderName).map((v) => v.toLowerCase()))
  return warrantyOrderNumbers.some((n) => variants.has(n.trim().toLowerCase()))
}

export interface WarrantyRow {
  id: string
  name: string
  email: string
  phone: string | null
  customer_details: string | null
  order_number: string | null
  install_type: string | null
  status: string
  created_at: string
  before_photo_urls: string[] | null
  after_photo_urls: string[] | null
}

export interface ClaimRow {
  id: string
  name: string
  email: string
  order_number: string | null
  failure_description: string | null
  status: string
  created_at: string
}

export interface TransferRow {
  id: string
  new_owner_name: string
  new_owner_email: string
  order_number: string | null
  status: string
  created_at: string
}

export async function loadJobsForPro(ctx: ProContext): Promise<{
  registrations: WarrantyRow[]
  claims: ClaimRow[]
  transfers: TransferRow[]
}> {
  const supabase = createAdminClient()
  const orderVariants = ctx.orders.flatMap((o) => orderNumberVariants(o.name))
  const uniqueVariants = [...new Set(orderVariants)]

  const registrationsById = new Map<string, WarrantyRow>()

  const { data: filed } = await supabase
    .from('warranty_registrations')
    .select('id, name, email, phone, customer_details, order_number, install_type, status, created_at, before_photo_urls, after_photo_urls')
    .eq('filed_by_pro_user_id', ctx.user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  for (const row of filed ?? []) registrationsById.set(row.id, row as WarrantyRow)

  const { data: byEmail } = await supabase
    .from('warranty_registrations')
    .select('id, name, email, phone, customer_details, order_number, install_type, status, created_at, before_photo_urls, after_photo_urls')
    .or(`email.eq."${ctx.user.email}",installer_email.eq."${ctx.user.email}"`)
    .order('created_at', { ascending: false })
    .limit(200)

  for (const row of byEmail ?? []) registrationsById.set(row.id, row as WarrantyRow)

  if (uniqueVariants.length) {
    const { data: byOrder } = await supabase
      .from('warranty_registrations')
      .select('id, name, email, phone, customer_details, order_number, install_type, status, created_at, before_photo_urls, after_photo_urls')
      .in('order_number', uniqueVariants)
      .order('created_at', { ascending: false })
      .limit(200)
    for (const row of byOrder ?? []) registrationsById.set(row.id, row as WarrantyRow)
  }

  const claimsById = new Map<string, ClaimRow>()
  const transfersById = new Map<string, TransferRow>()

  const { data: claimsEmail } = await supabase
    .from('warranty_claims')
    .select('id, name, email, order_number, failure_description, status, created_at')
    .eq('email', ctx.user.email)
    .order('created_at', { ascending: false })
    .limit(100)
  for (const row of claimsEmail ?? []) claimsById.set(row.id, row as ClaimRow)

  const { data: transfersEmail } = await supabase
    .from('warranty_transfers')
    .select('id, new_owner_name, new_owner_email, order_number, status, created_at')
    .or(`new_owner_email.eq."${ctx.user.email}",original_owner_email.eq."${ctx.user.email}"`)
    .order('created_at', { ascending: false })
    .limit(100)
  for (const row of transfersEmail ?? []) transfersById.set(row.id, row as TransferRow)

  if (uniqueVariants.length) {
    const { data: claimsOrder } = await supabase
      .from('warranty_claims')
      .select('id, name, email, order_number, failure_description, status, created_at')
      .in('order_number', uniqueVariants)
      .limit(100)
    for (const row of claimsOrder ?? []) claimsById.set(row.id, row as ClaimRow)

    const { data: transfersOrder } = await supabase
      .from('warranty_transfers')
      .select('id, new_owner_name, new_owner_email, order_number, status, created_at')
      .in('order_number', uniqueVariants)
      .limit(100)
    for (const row of transfersOrder ?? []) transfersById.set(row.id, row as TransferRow)
  }

  const sortDesc = <T extends { created_at: string }>(rows: T[]) =>
    rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))

  return {
    registrations: sortDesc([...registrationsById.values()]),
    claims: sortDesc([...claimsById.values()]),
    transfers: sortDesc([...transfersById.values()]),
  }
}

export function publicUser(ctx: ProContext) {
  return {
    id: ctx.user.id,
    email: ctx.user.email,
    displayName: ctx.user.display_name || ctx.customer?.displayName || null,
    businessName: ctx.user.business_name,
    phone: ctx.user.phone || ctx.customer?.phone || null,
    statuses: ctx.statuses,
    hasPassword: Boolean(ctx.user.password_hash),
  }
}

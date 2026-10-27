import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchAndUpsertOrder } from '@/lib/shopify/sync'
import type { MailingAddress, ShopifyCustomerNode, ShopifyOrderNode } from '@/lib/shopify/commerce-map'
import { allLineItems, allOrders, itemSummary, lineUnits, orderSales, type LineItemLite } from './sales'

/**
 * Single order / customer records for the admin detail pages. These read the
 * full Shopify payload kept on each row, so everything Shopify returned
 * (fulfillments, tracking, transactions, refunds, addresses…) is viewable.
 */

export interface MoneyBagLite {
  shopMoney?: { amount?: string | null } | null
}

export interface OrderFulfillment {
  id: string
  status?: string | null
  displayStatus?: string | null
  createdAt?: string | null
  deliveredAt?: string | null
  estimatedDeliveryAt?: string | null
  trackingInfo?: { company?: string | null; number?: string | null; url?: string | null }[] | null
}

export interface OrderTransaction {
  id: string
  kind?: string | null
  status?: string | null
  gateway?: string | null
  formattedGateway?: string | null
  processedAt?: string | null
  amountSet?: MoneyBagLite | null
}

export interface OrderRefund {
  id: string
  note?: string | null
  createdAt?: string | null
  totalRefundedSet?: MoneyBagLite | null
}

export interface OrderShippingLine {
  id: string
  title?: string | null
  code?: string | null
  discountedPriceSet?: MoneyBagLite | null
}

export interface OrderDiscountApplication {
  code?: string | null
  title?: string | null
  value?: { amount?: string | null; percentage?: number | null } | null
}

export interface OrderLineItemFull {
  shopify_id: string
  title: string | null
  variant_title: string | null
  sku: string | null
  quantity: number | null
  current_quantity: number | null
  unfulfilled_quantity: number | null
  product_shopify_id: string | null
  original_unit_price: number | null
  discounted_unit_price: number | null
  discounted_total: number | null
}

export interface OrderDetail {
  row: {
    shopify_id: string
    legacy_resource_id: string | null
    name: string
    email: string | null
    phone: string | null
    customer_shopify_id: string | null
    customer_display_name: string | null
    financial_status: string | null
    fulfillment_status: string | null
    return_status: string | null
    cancelled_at: string | null
    cancel_reason: string | null
    closed_at: string | null
    processed_at: string | null
    subtotal_price: number | null
    total_price: number | null
    total_tax: number | null
    total_discounts: number | null
    total_shipping: number | null
    total_refunded: number | null
    total_outstanding: number | null
    current_total_price: number | null
    tags: string[]
    note: string | null
    source_name: string | null
    po_number: string | null
    shipping_address: MailingAddress | null
    billing_address: MailingAddress | null
    discount_codes: string[]
    payment_gateway_names: string[]
    shopify_created_at: string | null
    synced_at: string | null
    payload: ShopifyOrderNode
  }
  items: OrderLineItemFull[]
  customer: { legacy_resource_id: string | null; display_name: string | null; email: string | null; number_of_orders: number; amount_spent: number | null; tags: string[] } | null
}

const ORDER_DETAIL_COLS =
  'shopify_id, legacy_resource_id, name, email, phone, customer_shopify_id, customer_display_name, financial_status, fulfillment_status, return_status, cancelled_at, cancel_reason, closed_at, processed_at, subtotal_price, total_price, total_tax, total_discounts, total_shipping, total_refunded, total_outstanding, current_total_price, tags, note, source_name, po_number, shipping_address, billing_address, discount_codes, payment_gateway_names, shopify_created_at, synced_at, payload'

export const getOrderDetail = cache(async (legacyId: string): Promise<OrderDetail | null> => {
  if (!/^\d+$/.test(legacyId)) return null
  const supabase = createAdminClient()

  const read = () =>
    supabase.from('shopify_orders').select(ORDER_DETAIL_COLS).eq('legacy_resource_id', legacyId).is('deleted_at', null).maybeSingle()

  let { data: row } = await read()
  if (!row) {
    // Not in the copy yet (placed since the last refresh) — pull it from Shopify.
    const node = await fetchAndUpsertOrder(`gid://shopify/Order/${legacyId}`).catch(() => null)
    if (!node) return null
    ;({ data: row } = await read())
    if (!row) return null
  }

  const order = row as OrderDetail['row'] & { id?: string }
  const [{ data: items }, { data: customer }] = await Promise.all([
    supabase
      .from('shopify_order_line_items')
      .select('shopify_id, title, variant_title, sku, quantity, current_quantity, unfulfilled_quantity, product_shopify_id, original_unit_price, discounted_unit_price, discounted_total')
      .eq('order_shopify_id', order.shopify_id)
      .order('id'),
    order.customer_shopify_id
      ? supabase
          .from('shopify_customers')
          .select('legacy_resource_id, display_name, email, number_of_orders, amount_spent, tags')
          .eq('shopify_id', order.customer_shopify_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return {
    row: { ...order, tags: order.tags ?? [], discount_codes: order.discount_codes ?? [], payment_gateway_names: order.payment_gateway_names ?? [] },
    items: (items ?? []) as OrderLineItemFull[],
    customer: customer ? { ...customer, tags: customer.tags ?? [] } as OrderDetail['customer'] : null,
  }
})

// ─── Customer ─────────────────────────────────────────────────────────────

export interface CustomerDetail {
  row: {
    shopify_id: string
    legacy_resource_id: string | null
    email: string | null
    phone: string | null
    first_name: string | null
    last_name: string | null
    display_name: string | null
    note: string | null
    tags: string[]
    state: string | null
    tax_exempt: boolean | null
    verified_email: boolean | null
    number_of_orders: number
    amount_spent: number | null
    default_address: MailingAddress | null
    addresses: MailingAddress[]
    email_marketing_state: string | null
    sms_marketing_state: string | null
    is_dealer: boolean
    is_commercial: boolean
    shopify_created_at: string | null
    shopify_updated_at: string | null
    synced_at: string | null
    payload: ShopifyCustomerNode
  }
  orders: { shopify_id: string; legacy_resource_id: string | null; name: string; created: string; sales: number; financial_status: string | null; fulfillment_status: string | null; items: string; units: number; source_name: string | null }[]
  products: { title: string; units: number; sales: number }[]
  proUser: { email: string; last_login_at: string | null; created_at: string; password_hash: string | null; status_override: string | null } | null
  leads: { id: string; created_at: string; lead_type: string | null; project_type: string | null; business_name: string | null; status: string | null; message: string | null }[]
  warranties: { id: string; created_at: string; install_type: string | null; status: string | null; name: string | null }[]
}

export const getCustomerDetail = cache(async (legacyId: string): Promise<CustomerDetail | null> => {
  if (!/^\d+$/.test(legacyId)) return null
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('shopify_customers')
    .select('shopify_id, legacy_resource_id, email, phone, first_name, last_name, display_name, note, tags, state, tax_exempt, verified_email, number_of_orders, amount_spent, default_address, addresses, email_marketing_state, sms_marketing_state, is_dealer, is_commercial, shopify_created_at, shopify_updated_at, synced_at, payload')
    .eq('legacy_resource_id', legacyId)
    .is('deleted_at', null)
    .maybeSingle()
  if (!data) return null
  const row = { ...data, tags: data.tags ?? [], addresses: data.addresses ?? [] } as CustomerDetail['row']
  // Only plain addresses go into PostgREST filters (values are quoted too).
  const email = row.email && /^[^\s",()]+@[^\s",()]+$/.test(row.email) ? row.email.toLowerCase() : null

  const [orders, items, proUser, leads, warranties] = await Promise.all([
    allOrders(),
    allLineItems(),
    supabase
      .from('pro_users')
      .select('email, last_login_at, created_at, password_hash, status_override')
      .or(email ? `shopify_customer_id.eq."${row.shopify_id}",email.eq."${email}"` : `shopify_customer_id.eq."${row.shopify_id}"`)
      .limit(1)
      .maybeSingle(),
    email
      ? supabase.from('leads').select('id, created_at, lead_type, project_type, business_name, status, message').ilike('email', email).order('created_at', { ascending: false }).limit(20)
      : Promise.resolve({ data: [] }),
    email
      ? supabase.from('warranty_registrations').select('id, created_at, install_type, status, name').or(`email.ilike."${email}",installer_email.ilike."${email}"`).order('created_at', { ascending: false }).limit(20)
      : Promise.resolve({ data: [] }),
  ])

  const mine = orders.filter((o) => o.customer_shopify_id === row.shopify_id || (email && o.email?.toLowerCase() === email))
  const ids = new Set(mine.map((o) => o.shopify_id))
  const lis = items.filter((li) => ids.has(li.order_shopify_id))
  const byOrder = new Map<string, LineItemLite[]>()
  for (const li of lis) byOrder.set(li.order_shopify_id, [...(byOrder.get(li.order_shopify_id) ?? []), li])

  const products = new Map<string, { title: string; units: number; sales: number }>()
  for (const li of lis) {
    const title = li.product_title ?? li.title ?? 'Item'
    const p = products.get(title) ?? { title, units: 0, sales: 0 }
    p.units += lineUnits(li)
    p.sales += Number(li.discounted_total ?? 0)
    products.set(title, p)
  }

  return {
    row,
    orders: mine.map((o) => ({
      shopify_id: o.shopify_id,
      legacy_resource_id: o.legacy_resource_id,
      name: o.name,
      created: o.shopify_created_at,
      sales: orderSales(o),
      financial_status: o.financial_status,
      fulfillment_status: o.fulfillment_status,
      items: itemSummary(byOrder.get(o.shopify_id) ?? []),
      units: (byOrder.get(o.shopify_id) ?? []).reduce((n, li) => n + lineUnits(li), 0),
      source_name: o.source_name,
    })),
    products: [...products.values()].sort((a, b) => b.sales - a.sales),
    proUser: (proUser.data as CustomerDetail['proUser']) ?? null,
    leads: (leads.data ?? []) as CustomerDetail['leads'],
    warranties: (warranties.data ?? []) as CustomerDetail['warranties'],
  }
})

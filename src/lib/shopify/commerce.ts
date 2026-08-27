import { createAdminClient } from '@/lib/supabase/admin'
import { HIGH_VOLUME_ORDER_THRESHOLD } from '@/lib/pro/config'
import {
  findShopifyCustomerByEmail,
  getShopifyOrdersForCustomer,
  type ShopifyCustomerSummary,
  type ShopifyOrder,
} from '@/lib/pro/shopify'
import { fetchAndUpsertCustomer } from './sync'

interface CustomerRow {
  shopify_id: string
  display_name: string | null
  email: string | null
  phone: string | null
  tags: string[] | null
  number_of_orders: number | null
  amount_spent: number | string | null
  amount_spent_currency: string | null
}

interface OrderRow {
  shopify_id: string
  name: string
  shopify_created_at: string | null
  fulfillment_status: string | null
  financial_status: string | null
  total_price: number | string | null
  currency: string | null
  shopify_order_line_items?: Array<{
    title: string | null
    quantity: number | null
    variant_shopify_id: string | null
    sku: string | null
  }>
}

function mapCustomer(row: CustomerRow): ShopifyCustomerSummary {
  const spent = row.amount_spent == null ? null : String(row.amount_spent)
  return {
    id: row.shopify_id,
    displayName: row.display_name || row.email || 'Customer',
    email: row.email,
    phone: row.phone,
    tags: row.tags ?? [],
    numberOfOrders: row.number_of_orders ?? 0,
    amountSpent: spent && row.amount_spent_currency
      ? `${spent} ${row.amount_spent_currency}`
      : spent,
  }
}

function mapOrder(row: OrderRow): ShopifyOrder {
  return {
    id: row.shopify_id,
    name: row.name,
    createdAt: row.shopify_created_at || new Date(0).toISOString(),
    fulfillmentStatus: row.fulfillment_status,
    financialStatus: row.financial_status,
    total: row.total_price == null ? null : String(row.total_price),
    currency: row.currency,
    lineItems: (row.shopify_order_line_items ?? []).map((li) => ({
      title: li.title || 'Item',
      quantity: li.quantity ?? 0,
      variantId: li.variant_shopify_id,
      sku: li.sku,
    })),
  }
}

export async function getLocalCustomerByEmail(email: string): Promise<ShopifyCustomerSummary | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('shopify_customers')
    .select('shopify_id, display_name, email, phone, tags, number_of_orders, amount_spent, amount_spent_currency')
    .ilike('email', email)
    .is('deleted_at', null)
    .limit(5)

  const rows = (data ?? []) as CustomerRow[]
  const exact = rows.find((r) => r.email?.toLowerCase() === email.toLowerCase())
  const pick = exact ?? rows[0]
  return pick ? mapCustomer(pick) : null
}

export async function getLocalOrdersForCustomer(customerShopifyId: string): Promise<ShopifyOrder[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('shopify_orders')
    .select('shopify_id, name, shopify_created_at, fulfillment_status, financial_status, total_price, currency, shopify_order_line_items(title, quantity, variant_shopify_id, sku)')
    .eq('customer_shopify_id', customerShopifyId)
    .is('deleted_at', null)
    .order('shopify_created_at', { ascending: false })
    .limit(200)

  return ((data ?? []) as OrderRow[]).map(mapOrder)
}

export async function listLocalDealers(limit = 80): Promise<ShopifyCustomerSummary[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('shopify_customers')
    .select('shopify_id, display_name, email, phone, tags, number_of_orders, amount_spent, amount_spent_currency')
    .eq('is_dealer', true)
    .is('deleted_at', null)
    .order('number_of_orders', { ascending: false })
    .limit(limit)

  return ((data ?? []) as CustomerRow[]).map(mapCustomer)
}

export async function listLocalHighVolume(limit = 80): Promise<ShopifyCustomerSummary[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('shopify_customers')
    .select('shopify_id, display_name, email, phone, tags, number_of_orders, amount_spent, amount_spent_currency')
    .gte('number_of_orders', HIGH_VOLUME_ORDER_THRESHOLD)
    .is('deleted_at', null)
    .order('number_of_orders', { ascending: false })
    .limit(limit)

  return ((data ?? []) as CustomerRow[]).map(mapCustomer)
}

/**
 * Prefer the local Shopify copy. If the customer is missing, hit Admin GraphQL,
 * persist the full record, and return it so Pro Hub still works before a full sync.
 */
export async function loadCustomerAndOrders(email: string): Promise<{
  customer: ShopifyCustomerSummary | null
  orders: ShopifyOrder[]
}> {
  let customer = await getLocalCustomerByEmail(email)
  if (!customer) {
    const live = await findShopifyCustomerByEmail(email)
    if (live) {
      try {
        await fetchAndUpsertCustomer(live.id)
        customer = await getLocalCustomerByEmail(email) ?? live
      } catch {
        customer = live
      }
    }
  }

  if (!customer) return { customer: null, orders: [] }

  let orders = await getLocalOrdersForCustomer(customer.id)
  if (!orders.length) {
    try {
      orders = await getShopifyOrdersForCustomer(customer.id)
    } catch {
      orders = []
    }
  }

  return { customer, orders }
}

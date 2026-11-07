import { createAdminClient } from '@/lib/supabase/admin'
import { shopifyAdminGraphql } from './admin'
import {
  CUSTOMER_BY_ID_QUERY,
  CUSTOMERS_PAGE_QUERY,
  ORDER_BY_ID_QUERY,
  ORDERS_PAGE_QUERY,
} from './commerce-queries'
import {
  customerRow,
  lineItemRows,
  orderRow,
  type ConnectionPage,
  type ShopifyCustomerNode,
  type ShopifyOrderNode,
} from './commerce-map'

export type SyncResource = 'customers' | 'orders'
export type SyncTarget = 'all' | SyncResource

export interface SyncResourceResult {
  resource: SyncResource
  pages: number
  upserted: number
  hasMore: boolean
  cursor: string | null
  error: string | null
}

export interface SyncResult {
  resources: SyncResourceResult[]
  hasMore: boolean
}

const DEFAULT_MAX_PAGES = 20

interface SyncStateRow {
  resource: string
  cursor: string | null
  records_synced: number
  last_completed_at: string | null
  last_error: string | null
}

async function loadState(resource: SyncResource): Promise<SyncStateRow | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('shopify_sync_state')
    .select('resource, cursor, records_synced, last_completed_at, last_error')
    .eq('resource', resource)
    .maybeSingle()
  return data as SyncStateRow | null
}

async function saveState(row: {
  resource: SyncResource
  cursor: string | null
  records_synced: number
  last_completed_at: string | null
  last_error: string | null
}) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('shopify_sync_state').upsert({
    ...row,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'resource' })
  if (error) throw new Error(`sync state save failed: ${error.message}`)
}

// Webhooks, the admin refresh, the full sync and one-off fetches overlap, so a slow one can hold an
// older version than the one stored. The SQL functions (supabase/migrations/019) write a record only
// when Shopify's updatedAt is the same or newer, never bring back a deleted one, and replace an order's
// line items in the same transaction. Each returns whether it wrote.

export async function upsertShopifyCustomer(node: ShopifyCustomerNode): Promise<boolean> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('upsert_shopify_customers', { p_rows: [customerRow(node)] })
  if (error) throw new Error(`customer upsert failed: ${error.message}`)
  return data === 1
}

export async function upsertShopifyOrder(node: ShopifyOrderNode): Promise<boolean> {
  const supabase = createAdminClient()
  const row = { ...orderRow(node), line_items: lineItemRows(node.id, node.lineItems?.nodes ?? []) }
  const { data, error } = await supabase.rpc('upsert_shopify_orders', { p_orders: [row] })
  if (error) throw new Error(`order upsert failed: ${error.message}`)
  return data === 1
}

export async function markShopifyDeleted(table: 'shopify_customers' | 'shopify_orders', shopifyId: string) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const { error } = await supabase
    .from(table)
    .update({ deleted_at: now, synced_at: now })
    .eq('shopify_id', shopifyId)
    .is('deleted_at', null)
  if (error) throw new Error(`delete mark failed: ${error.message}`)
}

export async function fetchAndUpsertCustomer(shopifyId: string) {
  const data = await shopifyAdminGraphql<{ customer: ShopifyCustomerNode | null }>(
    CUSTOMER_BY_ID_QUERY,
    { id: shopifyId },
  )
  if (!data.customer) return null
  await upsertShopifyCustomer(data.customer)
  return data.customer
}

export async function fetchAndUpsertOrder(shopifyId: string) {
  const data = await shopifyAdminGraphql<{ order: ShopifyOrderNode | null }>(
    ORDER_BY_ID_QUERY,
    { id: shopifyId },
  )
  if (!data.order) return null
  await upsertShopifyOrder(data.order)
  return data.order
}

async function syncOne(
  resource: SyncResource,
  maxPages: number,
  reset: boolean,
): Promise<SyncResourceResult> {
  const previous = reset ? null : await loadState(resource)
  const resume = Boolean(previous?.cursor)
  let cursor = resume ? previous!.cursor : null
  let records = resume ? previous!.records_synced : 0
  let pages = 0
  let hasMore = true

  try {
    while (pages < maxPages) {
      if (resource === 'customers') {
        const data = await shopifyAdminGraphql<{ customers: ConnectionPage<ShopifyCustomerNode> }>(
          CUSTOMERS_PAGE_QUERY,
          { cursor },
        )
        const page = data.customers
        for (const node of page.nodes ?? []) {
          await upsertShopifyCustomer(node)
          records += 1
        }
        hasMore = Boolean(page.pageInfo?.hasNextPage)
        cursor = hasMore ? page.pageInfo.endCursor : null
      } else {
        const data = await shopifyAdminGraphql<{ orders: ConnectionPage<ShopifyOrderNode> }>(
          ORDERS_PAGE_QUERY,
          { cursor },
        )
        const page = data.orders
        for (const node of page.nodes ?? []) {
          await upsertShopifyOrder(node)
          records += 1
        }
        hasMore = Boolean(page.pageInfo?.hasNextPage)
        cursor = hasMore ? page.pageInfo.endCursor : null
      }

      pages += 1
      await saveState({
        resource,
        cursor,
        records_synced: records,
        last_completed_at: hasMore ? null : new Date().toISOString(),
        last_error: null,
      })

      if (!hasMore) break
    }

    return { resource, pages, upserted: records, hasMore, cursor, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await saveState({
      resource,
      cursor,
      records_synced: records,
      last_completed_at: null,
      last_error: message,
    })
    return { resource, pages, upserted: records, hasMore: true, cursor, error: message }
  }
}

async function isComplete(resource: SyncResource) {
  const state = await loadState(resource)
  return Boolean(state?.last_completed_at) && !state?.cursor
}

export async function syncShopifyCommerce(opts?: {
  resource?: SyncTarget
  maxPages?: number
  reset?: boolean
}): Promise<SyncResult> {
  const resource = opts?.resource ?? 'all'
  const maxPages = Math.max(1, Math.min(opts?.maxPages ?? DEFAULT_MAX_PAGES, 80))
  const customersDone = await isComplete('customers')
  const ordersDone = await isComplete('orders')
  const reset = Boolean(opts?.reset) || (resource === 'all' && customersDone && ordersDone)
  const results: SyncResourceResult[] = []
  let remaining = maxPages

  if (resource === 'all' || resource === 'customers') {
    if (reset || !customersDone) {
      const result = await syncOne('customers', remaining, reset)
      results.push(result)
      remaining -= result.pages
      if (result.error) return { resources: results, hasMore: true }
    }
  }

  if ((resource === 'all' || resource === 'orders') && remaining > 0) {
    if (reset || !ordersDone) {
      results.push(await syncOne('orders', remaining, reset))
    }
  }

  return {
    resources: results,
    hasMore: results.some((r) => r.hasMore || r.error),
  }
}

export async function getShopifySyncStatus() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('shopify_sync_state')
    .select('resource, cursor, records_synced, last_completed_at, last_error, updated_at')
    .order('resource')

  const { count: customers } = await supabase
    .from('shopify_customers')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)

  const { count: orders } = await supabase
    .from('shopify_orders')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)

  return {
    state: data ?? [],
    counts: { customers: customers ?? 0, orders: orders ?? 0 },
  }
}

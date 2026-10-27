import { createAdminClient } from '@/lib/supabase/admin'
import { shopifyAdminGraphql } from '@/lib/shopify/admin'
import { CUSTOMER_NODE_FIELDS, ORDER_NODE_FIELDS } from '@/lib/shopify/commerce-queries'
import type { ConnectionPage, ShopifyCustomerNode, ShopifyOrderNode } from '@/lib/shopify/commerce-map'
import { upsertShopifyCustomer, upsertShopifyOrder } from '@/lib/shopify/sync'
import { clearAdminCache } from './cache'

/**
 * Keeps the Supabase copy of Shopify current for the admin: pulls orders and
 * customers updated since the newest row already stored, oldest first, so a
 * capped run resumes where it stopped. Complements the full sync in
 * src/lib/shopify/sync.ts and the webhooks (which may not be registered).
 */

const ORDERS_SINCE_QUERY = /* GraphQL */ `
  query AdminOrdersSince($cursor: String, $query: String) {
    orders(first: 25, after: $cursor, sortKey: UPDATED_AT, query: $query) {
      pageInfo { hasNextPage endCursor }
      nodes { ${ORDER_NODE_FIELDS} }
    }
  }
`

const CUSTOMERS_SINCE_QUERY = /* GraphQL */ `
  query AdminCustomersSince($cursor: String, $query: String) {
    customers(first: 50, after: $cursor, sortKey: UPDATED_AT, query: $query) {
      pageInfo { hasNextPage endCursor }
      nodes { ${CUSTOMER_NODE_FIELDS} }
    }
  }
`

export interface RefreshResult {
  orders: number
  customers: number
  hasMore: boolean
  error: string | null
  at: string
}

const STALE_MS = 10 * 60_000
let running: Promise<RefreshResult> | null = null
let lastRun: { at: number; result: RefreshResult } | null = null

async function watermark(table: 'shopify_orders' | 'shopify_customers'): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from(table)
    .select('shopify_updated_at')
    .not('shopify_updated_at', 'is', null)
    .order('shopify_updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.shopify_updated_at ?? null
}

async function inBatches<T>(items: T[], size: number, run: (item: T) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(run))
}

async function pull<T>(
  query: string,
  since: string | null,
  maxPages: number,
  upsert: (node: T) => Promise<unknown>,
  key: 'orders' | 'customers',
): Promise<{ count: number; hasMore: boolean }> {
  let cursor: string | null = null
  let count = 0
  // Re-read a minute of overlap: upserts are idempotent, gaps are not.
  const filter = since ? `updated_at:>='${new Date(new Date(since).getTime() - 60_000).toISOString()}'` : null
  for (let page = 0; page < maxPages; page++) {
    const data: Record<string, ConnectionPage<T>> = await shopifyAdminGraphql(query, { cursor, query: filter })
    const conn = data[key]
    await inBatches(conn.nodes ?? [], 5, upsert)
    count += conn.nodes?.length ?? 0
    if (!conn.pageInfo?.hasNextPage) return { count, hasMore: false }
    cursor = conn.pageInfo.endCursor
  }
  return { count, hasMore: true }
}

async function run(): Promise<RefreshResult> {
  try {
    const [ordersSince, customersSince] = await Promise.all([watermark('shopify_orders'), watermark('shopify_customers')])
    const orders = await pull<ShopifyOrderNode>(ORDERS_SINCE_QUERY, ordersSince, 12, upsertShopifyOrder, 'orders')
    const customers = await pull<ShopifyCustomerNode>(CUSTOMERS_SINCE_QUERY, customersSince, 10, upsertShopifyCustomer, 'customers')
    return {
      orders: orders.count,
      customers: customers.count,
      hasMore: orders.hasMore || customers.hasMore,
      error: null,
      at: new Date().toISOString(),
    }
  } catch (err) {
    return { orders: 0, customers: 0, hasMore: true, error: err instanceof Error ? err.message : String(err), at: new Date().toISOString() }
  } finally {
    clearAdminCache()
  }
}

/** Runs one refresh (or joins the one already running). */
export function refreshFromShopify(): Promise<RefreshResult> {
  if (!running) {
    running = run()
      .then((result) => {
        lastRun = { at: Date.now(), result }
        return result
      })
      .finally(() => {
        running = null
      })
  }
  return running
}

/** Background refresh when this instance hasn't refreshed recently. */
export async function refreshIfStale(): Promise<void> {
  if (running) return
  if (lastRun && Date.now() - lastRun.at < STALE_MS && !lastRun.result.hasMore) return
  await refreshFromShopify()
}

/** When the copy last took in a change (or this instance last checked). */
export async function lastSyncedAt(): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('shopify_orders')
    .select('synced_at')
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const fromDb = data?.synced_at ?? null
  const fromRun = lastRun?.result.error ? null : lastRun?.result.at ?? null
  if (!fromDb) return fromRun
  if (!fromRun) return fromDb
  return fromDb > fromRun ? fromDb : fromRun
}

export function lastRefreshError(): string | null {
  return lastRun?.result.error ?? null
}

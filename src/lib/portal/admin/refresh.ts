import { createAdminClient } from '@/lib/supabase/admin'
import { shopifyAdminGraphql } from '@/lib/shopify/admin'
import { CUSTOMER_NODE_FIELDS, ORDER_NODE_FIELDS } from '@/lib/shopify/commerce-queries'
import type { ConnectionPage, ShopifyCustomerNode, ShopifyOrderNode } from '@/lib/shopify/commerce-map'
import { upsertShopifyCustomer, upsertShopifyOrder } from '@/lib/shopify/sync'
import { clearAdminCache } from './cache'

/**
 * Keeps the Supabase copy of Shopify current for the admin: pulls orders and
 * customers Shopify changed since this refresh last looked, oldest first.
 * Complements the full sync in src/lib/shopify/sync.ts and the webhooks (which
 * may not be registered).
 *
 * Each kind keeps its own starting point in shopify_sync_state
 * (orders_refresh, customers_refresh). Webhooks, staff opening an order and
 * the Pro Hub's customer fetch write newer rows without reading what came
 * before them, so the newest stored row is not a safe place to start. A run
 * that reads to the end starts the next one a minute before it asked Shopify
 * (changes made while it ran come again, writes skip what is current); a run
 * that stops at its page cap continues from the last change it wrote; a run
 * that fails leaves the starting point where it was.
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

// Clock difference allowed between this server and Shopify's updated_at.
const OVERLAP_MS = 60_000

async function loadStart(resource: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('shopify_sync_state')
    .select('cursor')
    .eq('resource', resource)
    .maybeSingle()
  if (error) throw new Error(`refresh state load failed: ${error.message}`)
  return data?.cursor ? new Date(data.cursor).toISOString() : null
}

async function saveStart(resource: string, cursor: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('shopify_sync_state')
    .upsert({ resource, cursor, updated_at: new Date().toISOString() }, { onConflict: 'resource' })
  if (error) throw new Error(`refresh state save failed: ${error.message}`)
}

async function inBatches<T>(items: T[], size: number, run: (item: T) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(run))
}

async function pull<T extends { updatedAt?: string | null }>(
  key: 'orders' | 'customers',
  query: string,
  maxPages: number,
  upsert: (node: T) => Promise<unknown>,
): Promise<{ count: number; hasMore: boolean }> {
  const resource = `${key}_refresh`
  const since = await loadStart(resource)
  const askedAt = Date.now()
  const filter = since ? `updated_at:>='${since}'` : null
  let cursor: string | null = null
  let count = 0
  let reached = since
  for (let page = 0; page < maxPages; page++) {
    const data: Record<string, ConnectionPage<T>> = await shopifyAdminGraphql(query, { cursor, query: filter })
    const conn = data[key]
    const nodes = conn.nodes ?? []
    await inBatches(nodes, 5, upsert)
    count += nodes.length
    reached = nodes[nodes.length - 1]?.updatedAt ?? reached
    if (!conn.pageInfo?.hasNextPage) {
      await saveStart(resource, new Date(askedAt - OVERLAP_MS).toISOString())
      return { count, hasMore: false }
    }
    cursor = conn.pageInfo.endCursor
  }
  if (reached) await saveStart(resource, reached)
  return { count, hasMore: true }
}

async function run(): Promise<RefreshResult> {
  try {
    const orders = await pull<ShopifyOrderNode>('orders', ORDERS_SINCE_QUERY, 12, upsertShopifyOrder)
    const customers = await pull<ShopifyCustomerNode>('customers', CUSTOMERS_SINCE_QUERY, 10, upsertShopifyCustomer)
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

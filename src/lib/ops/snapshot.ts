import { shopifyAdminGraphql } from '@/lib/shopify/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { daysAgoIso, isoRange, todayIso, weekStartIso, yearStartIso } from './periods'

const CLIENT_ID = 'crazy-seal'

type OrdersPage = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    edges: { node: { createdAt: string; totalPriceSet: { shopMoney: { amount: string } } } }[]
  }
}

async function shopifyPaidTotal(fromDay: string) {
  let cursor: string | null = null
  let total = 0
  const query = `created_at:>=${fromDay} financial_status:paid`
  for (let i = 0; i < 20; i++) {
    const data: OrdersPage = await shopifyAdminGraphql<OrdersPage>(
      `query Orders($query: String!, $cursor: String) {
        orders(first: 100, query: $query, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges { node { createdAt totalPriceSet { shopMoney { amount } } } }
        }
      }`,
      { query, ...(cursor ? { cursor } : {}) }
    )
    for (const edge of data.orders.edges) {
      total += Number(edge.node.totalPriceSet.shopMoney.amount || 0)
    }
    if (!data.orders.pageInfo.hasNextPage) break
    cursor = data.orders.pageInfo.endCursor
  }
  return total
}

export async function buildCrazySealSnapshot() {
  const notes: string[] = []
  let today = 0
  let week = 0
  let d30 = 0
  let ytd = 0
  try {
    ;[today, week, d30, ytd] = await Promise.all([
      shopifyPaidTotal(todayIso()),
      shopifyPaidTotal(weekStartIso()),
      shopifyPaidTotal(daysAgoIso(29)),
      shopifyPaidTotal(yearStartIso()),
    ])
  } catch (err) {
    notes.push(`Shopify: ${err instanceof Error ? err.message : String(err)}`)
  }

  const { count, error } = await createAdminClient()
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', isoRange(daysAgoIso(29)).from)
  if (error) notes.push(`leads: ${error.message}`)

  const metric = (
    key: string,
    period: 'today' | 'week' | '30d' | 'ytd' | 'mtd' | 'current',
    value: number,
    unit: 'usd' | 'count',
    label: string,
    ownerVisible: boolean,
    source: string
  ) => ({ key, period, value, unit, label, ownerVisible, source })

  return {
    clientId: CLIENT_ID,
    capturedAt: new Date().toISOString(),
    timezone: 'America/New_York',
    metrics: [
      metric('revenue', 'today', today, 'usd', 'Product sales', true, 'Shopify Admin orders'),
      metric('revenue', 'week', week, 'usd', 'Product sales', true, 'Shopify Admin orders'),
      metric('revenue', '30d', d30, 'usd', 'Product sales', true, 'Shopify Admin orders'),
      metric('revenue', 'ytd', ytd, 'usd', 'Product sales', true, 'Shopify Admin orders'),
      metric('leads.count', '30d', count || 0, 'count', 'Leads', true, 'leads'),
    ],
    health: { ok: notes.length === 0, notes },
  }
}

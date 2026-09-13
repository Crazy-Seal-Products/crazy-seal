import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { fetchAndUpsertCustomer, fetchAndUpsertOrder, markShopifyDeleted } from '@/lib/shopify/sync'
import { gidFromRest } from '@/lib/shopify/commerce-map'

export const runtime = 'nodejs'

function webhookSecret() {
  return process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_CLIENT_SECRET || ''
}

function verifyHmac(rawBody: string, header: string | null) {
  const secret = webhookSecret()
  if (!secret || !header) return false
  const digest = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  const a = Buffer.from(digest)
  const b = Buffer.from(header)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  const raw = await request.text()
  const hmac = request.headers.get('x-shopify-hmac-sha256')
  if (!verifyHmac(raw, hmac)) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 })
  }

  const topic = (request.headers.get('x-shopify-topic') || '').toLowerCase()
  const payload = JSON.parse(raw || '{}') as { admin_graphql_api_id?: string; id?: number | string }

  try {
    if (topic.startsWith('customers/')) {
      const id = gidFromRest('Customer', payload)
      if (!id) return NextResponse.json({ ok: true, skipped: true })
      if (topic === 'customers/delete') {
        await markShopifyDeleted('shopify_customers', id)
      } else {
        await fetchAndUpsertCustomer(id)
      }
      return NextResponse.json({ ok: true })
    }

    if (topic.startsWith('orders/')) {
      const id = gidFromRest('Order', payload)
      if (!id) return NextResponse.json({ ok: true, skipped: true })
      if (topic === 'orders/delete') {
        await markShopifyDeleted('shopify_orders', id)
      } else {
        await fetchAndUpsertOrder(id)
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true, ignored: topic })
  } catch (err) {
    console.error('[shopify/webhooks]', topic, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

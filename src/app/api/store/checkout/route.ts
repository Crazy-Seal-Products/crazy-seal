import { NextResponse, type NextRequest } from 'next/server'
import { createCheckoutUrl, type CartAttribute, type CheckoutLineItem } from '@/lib/shopify/storefront'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * The site's tracking cookies (src/lib/tracking/client.ts), passed to the cart
 * so the order can be matched to the visit that brought the shopper in. The
 * Marketing page reads `_cs_visitor` back from the order.
 */
function trackingAttributes(request: NextRequest): CartAttribute[] {
  const pairs: [string, string | undefined][] = [
    ['_cs_visitor', request.cookies.get('rva_visitor_id')?.value],
    ['_cs_session', request.cookies.get('rva_session_id')?.value],
  ]
  return pairs.filter((p): p is [string, string] => !!p[1] && UUID.test(p[1])).map(([key, value]) => ({ key, value }))
}

export async function POST(request: NextRequest) {
  let items: CheckoutLineItem[]
  try {
    const body = await request.json()
    items = body.items
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    !items.every(
      (i) =>
        typeof i.variantId === 'string' &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0 &&
        i.quantity <= 999
    )
  ) {
    return NextResponse.json({ error: 'Invalid line items' }, { status: 400 })
  }

  try {
    const url = await createCheckoutUrl(items, trackingAttributes(request))
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Checkout creation failed:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}

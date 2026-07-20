import { NextResponse } from 'next/server'
import { createCheckoutUrl, type CheckoutLineItem } from '@/lib/shopify/storefront'

export async function POST(request: Request) {
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
    const url = await createCheckoutUrl(items)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Checkout creation failed:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/admin/require-staff'
import { getShopifySyncStatus, syncShopifyCommerce, type SyncTarget } from '@/lib/shopify/sync'
import { shopifyErrorMessage } from '@/lib/pro/shopify'

export const maxDuration = 60

export async function GET() {
  const staff = await requireStaff()
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const status = await getShopifySyncStatus()
    return NextResponse.json(status)
  } catch (err) {
    return NextResponse.json({ error: shopifyErrorMessage(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const staff = await requireStaff()
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({})) as {
    resource?: SyncTarget
    maxPages?: number
    reset?: boolean
  }

  try {
    const result = await syncShopifyCommerce({
      resource: body.resource ?? 'all',
      maxPages: body.maxPages,
      reset: body.reset,
    })
    const status = await getShopifySyncStatus()
    return NextResponse.json({ ...result, ...status })
  } catch (err) {
    console.error('[admin/shopify/sync]', err)
    return NextResponse.json({ error: shopifyErrorMessage(err) }, { status: 500 })
  }
}

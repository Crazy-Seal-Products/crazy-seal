import { NextResponse } from 'next/server'
import { getProUser } from '@/lib/pro/auth'
import { certificateUrl } from '@/lib/warranty/certificate'
import { loadJobsForPro, loadProContext, nextRebate, orderHasWarranty, publicUser } from '@/lib/pro/context'
import { shopifyErrorMessage } from '@/lib/pro/shopify'

export async function GET() {
  const user = await getProUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ctx = await loadProContext(user)
  const jobs = await loadJobsForPro(ctx)
  const warrantyNumbers = jobs.registrations.map((r) => r.order_number).filter(Boolean) as string[]

  const thisYear = new Date().getFullYear()
  const ordersThisYear = ctx.orders.filter((o) => new Date(o.createdAt).getFullYear() === thisYear)
  const missing = ctx.orders.filter((o) => !orderHasWarranty(o.name, warrantyNumbers))

  return NextResponse.json({
    user: publicUser(ctx),
    stats: {
      orderCount: ctx.orders.length,
      orderCountThisYear: ordersThisYear.length,
      warrantiesFiled: jobs.registrations.length,
      warrantiesMissing: missing.length,
    },
    rebate: nextRebate(ctx.customer?.numberOfOrders ?? ctx.orders.length),
    recentOrders: ctx.orders.slice(0, 5).map((o) => ({
      ...o,
      hasWarranty: orderHasWarranty(o.name, warrantyNumbers),
    })),
    missingOrders: missing.slice(0, 5),
    latestCertificateUrl: jobs.registrations[0] ? certificateUrl(jobs.registrations[0].id) : null,
    shopifyError: ctx.shopifyError ? shopifyErrorMessage(ctx.shopifyError) : null,
  })
}

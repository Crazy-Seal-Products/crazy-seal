import { NextResponse } from 'next/server'
import { getProUser } from '@/lib/pro/auth'
import { certificatePath } from '@/lib/warranty/certificate'
import { loadJobsForPro, loadProContext, orderHasWarranty } from '@/lib/pro/context'
import { shopifyErrorMessage } from '@/lib/pro/shopify'

export async function GET() {
  const user = await getProUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ctx = await loadProContext(user)
  const jobs = await loadJobsForPro(ctx)
  const warrantyNumbers = jobs.registrations.map((r) => r.order_number).filter(Boolean) as string[]
  const certByOrder = new Map<string, string>()
  for (const r of jobs.registrations) {
    if (r.order_number) certByOrder.set(r.order_number.replace(/^#/, '').toLowerCase(), certificatePath(r.id))
  }

  return NextResponse.json({
    orders: ctx.orders.map((o) => {
      const hasWarranty = orderHasWarranty(o.name, warrantyNumbers)
      const key = o.name.replace(/^#/, '').toLowerCase()
      return {
        ...o,
        hasWarranty,
        certificatePath: hasWarranty ? certByOrder.get(key) ?? null : null,
      }
    }),
    shopifyError: ctx.shopifyError ? shopifyErrorMessage(ctx.shopifyError) : null,
  })
}

import type { ProUser } from '@/lib/pro/auth'
import { loadJobsForPro, loadProContext, nextRebate, orderHasWarranty } from '@/lib/pro/context'
import type { ProStatus } from '@/lib/pro/config'
import { shopifyErrorMessage } from '@/lib/pro/shopify'
import { certificateUrl } from '@/lib/warranty/certificate'

/**
 * What Pro Hub's home showed an account, for the portal: their status pills,
 * order and warranty counts, the rebate meter, recent orders and the ones
 * still missing a warranty. Built from their Shopify orders (by email) and the
 * warranties filed for them, exactly as Pro Hub did (src/lib/pro/context.ts).
 */

export interface AccountOrder {
  name: string
  createdAt: string
  firstItem: string | null
  hasWarranty: boolean
}

export interface AccountSummary {
  statuses: ProStatus[]
  businessName: string | null
  stats: { orderCount: number; orderCountThisYear: number; warrantiesFiled: number; warrantiesMissing: number }
  rebate: { current: number; next: number; remaining: number } | null
  recentOrders: AccountOrder[]
  missingOrders: AccountOrder[]
  latestCertificateUrl: string | null
  shopifyError: string | null
  /** Only the Member pill: not a dealer yet. */
  memberOnly: boolean
}

const EMPTY: Omit<AccountSummary, 'businessName'> = {
  statuses: ['member'],
  stats: { orderCount: 0, orderCountThisYear: 0, warrantiesFiled: 0, warrantiesMissing: 0 },
  rebate: null,
  recentOrders: [],
  missingOrders: [],
  latestCertificateUrl: null,
  shopifyError: null,
  memberOnly: false,
}

export async function loadAccountSummary(user: ProUser): Promise<AccountSummary> {
  // A base view of a contractor with no email on file has no Shopify orders to look up.
  if (!user.email?.trim()) return { ...EMPTY, businessName: user.business_name }
  const ctx = await loadProContext(user)
  const jobs = await loadJobsForPro(ctx)
  const warrantyNumbers = jobs.registrations.map((r) => r.order_number).filter(Boolean) as string[]
  const thisYear = new Date().getFullYear()
  const toOrder = (o: (typeof ctx.orders)[number]): AccountOrder => ({
    name: o.name,
    createdAt: o.createdAt,
    firstItem: o.lineItems[0]?.title ?? null,
    hasWarranty: orderHasWarranty(o.name, warrantyNumbers),
  })
  const orders = ctx.orders.map(toOrder)
  const missing = orders.filter((o) => !o.hasWarranty)

  return {
    statuses: ctx.statuses,
    businessName: user.business_name,
    stats: {
      orderCount: orders.length,
      orderCountThisYear: ctx.orders.filter((o) => new Date(o.createdAt).getFullYear() === thisYear).length,
      warrantiesFiled: jobs.registrations.length,
      warrantiesMissing: missing.length,
    },
    rebate: nextRebate(ctx.customer?.numberOfOrders ?? ctx.orders.length),
    recentOrders: orders.slice(0, 5),
    missingOrders: missing.slice(0, 5),
    latestCertificateUrl: jobs.registrations[0] ? certificateUrl(jobs.registrations[0].id) : null,
    shopifyError: ctx.shopifyError ? shopifyErrorMessage(ctx.shopifyError) : null,
    memberOnly: ctx.statuses.length === 1 && ctx.statuses[0] === 'member',
  }
}

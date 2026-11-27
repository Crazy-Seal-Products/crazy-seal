import type { Metadata } from 'next'
import { loadAccountSummary } from '@/lib/contractor/account-summary'
import { getDashboard } from '@/lib/contractor/dashboard'
import { requireAccount } from '@/lib/contractor/guard'
import { loadPortalOrders } from '@/lib/contractor/orders'
import { can, ROLE_INFO } from '@/lib/contractor/roles'
import { getPendingInvitation } from '@/lib/contractor/viewer'
import { DashboardView, type MonthBar } from '@/components/contractor/dashboard/DashboardView'
import { InvitationBanner } from '@/components/contractor/dashboard/InvitationBanner'

export const metadata: Metadata = { title: 'Dashboard' }

/** The last 12 months of orders, oldest first, for the dashboard chart. */
function lastTwelveMonths(orders: { createdAt: string | null; total: number | null; cancelled: boolean }[]): MonthBar[] {
  const now = new Date()
  const months: (MonthBar & { key: string })[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }), total: 0, count: 0 })
  }
  for (const o of orders) {
    if (!o.createdAt || o.cancelled) continue
    const d = new Date(o.createdAt)
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (!m) continue
    m.total += o.total ?? 0
    m.count += 1
  }
  return months.map(({ label, total, count }) => ({ label, total: Math.round(total), count }))
}

/**
 * The portal's home, laid out like Thermo's dealer dashboard. On a
 * contractor's team: the company's numbers, projects, quotes and activity,
 * plus the person's own Pro Hub account (orders, warranties, rewards). For an
 * account on no team: everything Pro Hub's home showed, in the same design.
 */
export default async function PortalDashboardPage() {
  const { account, viewer } = await requireAccount('dashboard.view')
  const showOrders = !viewer || can(viewer.role, 'orders.view')

  const [summary, company, orders, invitation] = await Promise.all([
    loadAccountSummary(account.user),
    viewer ? getDashboard(viewer) : Promise.resolve(null),
    showOrders ? loadPortalOrders(account.user, viewer?.contractor ?? null).catch(() => null) : Promise.resolve(null),
    viewer ? Promise.resolve(null) : getPendingInvitation(),
  ])

  const place = viewer ? [viewer.contractor.city, viewer.contractor.state].filter(Boolean).join(', ') : ''
  const kicker = viewer ? `${place ? `${place} · ` : ''}Crazy Seal contractor` : 'Crazy Seal Pro'
  const tagline = viewer?.contractor.tagline?.trim() || (viewer ? 'Your Crazy Seal business, all in one place.' : 'Your Crazy Seal orders, warranties and rewards in one place.')

  return (
    <div className="space-y-6">
      {invitation && <InvitationBanner contractorName={invitation.contractorName} roleLabel={ROLE_INFO[invitation.role].label} readOnly={account.readOnly} />}
      <DashboardView
        firstName={account.firstName}
        kicker={kicker}
        tagline={tagline}
        roleLabel={viewer ? ROLE_INFO[viewer.role].label : 'Pro account'}
        roleSummary={viewer ? ROLE_INFO[viewer.role].summary : 'Your orders, warranties and rewards with Crazy Seal.'}
        company={company}
        account={summary}
        months={orders ? lastTwelveMonths(orders.orders) : null}
        can={{
          newQuote: Boolean(viewer && !viewer.readOnly && can(viewer.role, 'quotes.create')),
          newProject: Boolean(viewer && !viewer.readOnly && can(viewer.role, 'projects.edit')),
          projects: Boolean(viewer && can(viewer.role, 'projects.view')),
          activity: Boolean(viewer && can(viewer.role, 'activity.view')),
          training: !viewer || can(viewer.role, 'training.view'),
          fileWarranty: !account.readOnly && (!viewer || can(viewer.role, 'warranties.edit')),
          orders: showOrders,
        }}
      />
    </div>
  )
}

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { after } from 'next/server'
import { getAdminSections, requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getActivity, type Activity } from '@/lib/portal/admin/activity'
import { refreshIfStale } from '@/lib/portal/admin/refresh'
import type { AdminSection } from '@/lib/portal/admin/sections'
import { countNewTickets } from '@/lib/support/admin'
import { AdminShell } from '@/components/portal/admin/AdminShell'
import { NAV_COOKIE, RAIL_COOKIE, THEME_COOKIE } from '@/components/portal/admin/prefs'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Crazy Seal Admin' },
}

/** The activity rail only carries what the admin's role can open. */
function visibleActivity(activity: Activity, sections: AdminSection[]): Activity {
  const orders = sections.includes('orders')
  const applications = sections.includes('applications')
  return {
    ...activity,
    toShip: orders ? activity.toShip : { count: 0, oldest: null },
    latest: orders ? activity.latest : [],
    applications: applications ? activity.applications : { count: 0, latest: [] },
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requirePortalAdmin()
  const [sections, activity, jar] = await Promise.all([getAdminSections(), getActivity(), cookies()])
  const shown = visibleActivity(activity, sections)
  const newTickets = sections.includes('support') ? await countNewTickets() : 0

  // Top up the Shopify copy after the response is sent (skips if fresh).
  after(() => refreshIfStale().catch((err) => console.error('[portal/admin] refresh', err)))

  return (
    <AdminShell
      admin={admin}
      sections={sections}
      badges={{ openOrders: shown.toShip.count, newApplications: shown.applications.count, newTickets }}
      sync={{ lastSyncedAt: shown.sync.lastSyncedAt, error: shown.sync.error }}
      activity={shown}
      railOpen={jar.get(RAIL_COOKIE)?.value !== '0'}
      navCollapsed={jar.get(NAV_COOKIE)?.value === '1'}
      theme={jar.get(THEME_COOKIE)?.value === 'light' ? 'light' : 'dark'}
    >
      {children}
    </AdminShell>
  )
}

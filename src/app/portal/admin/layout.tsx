import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { after } from 'next/server'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getActivity } from '@/lib/portal/admin/activity'
import { refreshIfStale } from '@/lib/portal/admin/refresh'
import { AdminShell } from '@/components/portal/admin/AdminShell'
import { RAIL_COOKIE, THEME_COOKIE } from '@/components/portal/admin/prefs'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Crazy Seal Admin' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requirePortalAdmin()
  const [activity, jar] = await Promise.all([getActivity(), cookies()])

  // Top up the Shopify copy after the response is sent (skips if fresh).
  after(() => refreshIfStale().catch((err) => console.error('[portal/admin] refresh', err)))

  return (
    <AdminShell
      admin={admin}
      badges={{ openOrders: activity.toShip.count, newApplications: activity.applications.count }}
      sync={{ lastSyncedAt: activity.sync.lastSyncedAt, error: activity.sync.error }}
      activity={activity}
      railOpen={jar.get(RAIL_COOKIE)?.value !== '0'}
      theme={jar.get(THEME_COOKIE)?.value === 'light' ? 'light' : 'dark'}
    >
      {children}
    </AdminShell>
  )
}

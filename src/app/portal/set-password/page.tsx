import type { Metadata } from 'next'
import { findPasswordSetup } from '@/lib/portal/admin/password-setup'
import { SetPasswordForm } from './SetPasswordForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Set your password',
  robots: { index: false, follow: false },
  // The link's token is in this page's address; don't pass it on to anything the page loads.
  referrer: 'no-referrer',
}

/** Where a new staff member lands from their emailed link to choose their own password. */
export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ t?: string | string[] }> }) {
  const { t } = await searchParams
  const token = typeof t === 'string' ? t : ''
  const setup = await findPasswordSetup(token)
  return <SetPasswordForm token={setup ? token : null} email={setup?.email ?? null} name={setup?.name ?? null} />
}

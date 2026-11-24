import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { requireAccount } from '@/lib/contractor/guard'
import { isPortalThemeKey, PORTAL_THEME_COOKIE } from '@/lib/contractor/theme'
import { ROLE_INFO } from '@/lib/contractor/roles'
import { AccountView } from '@/components/contractor/account/AccountView'

export const metadata: Metadata = { title: 'Account' }

/** The signed-in person's account: who they are, which company and role, and their password. */
export default async function AccountPage() {
  const { account, viewer } = await requireAccount()
  const look = (await cookies()).get(PORTAL_THEME_COOKIE)?.value
  return (
    <AccountView
      name={account.name}
      email={account.email}
      phone={account.user.phone}
      businessName={account.user.business_name}
      company={viewer ? { name: viewer.contractorName, role: ROLE_INFO[viewer.role].label, summary: ROLE_INFO[viewer.role].summary } : null}
      hasPassword={Boolean(account.user.password_hash)}
      readOnly={account.readOnly}
      theme={isPortalThemeKey(look) ? look : 'crazy-seal'}
    />
  )
}

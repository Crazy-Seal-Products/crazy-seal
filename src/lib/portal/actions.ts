'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPortalAccount, PORTAL_ACCOUNTS } from './accounts'
import { isPortalDemoEnabled, PORTAL_COOKIE, PORTAL_COOKIE_MAX_AGE } from './session'

export interface SignInState {
  error?: string
}

async function setSession(accountId: string) {
  const store = await cookies()
  store.set(PORTAL_COOKIE, accountId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: PORTAL_COOKIE_MAX_AGE,
  })
}

export async function portalSignIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  if (!isPortalDemoEnabled()) {
    return { error: 'The Pro Portal preview isn’t open yet. Use the Pro Hub to sign in.' }
  }
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const selected = String(formData.get('account') ?? '')

  if (!email || !password) return { error: 'Enter your email and password.' }

  // Demo mode: match a demo email, otherwise fall back to the selected tile.
  const account =
    PORTAL_ACCOUNTS.find((a) => a.email.toLowerCase() === email) ?? getPortalAccount(selected)
  if (!account) return { error: 'Pick one of the demo accounts to continue.' }

  await setSession(account.id)
  redirect('/portal/?welcome=1')
}

export async function portalSwitchAccount(accountId: string) {
  if (!isPortalDemoEnabled() || !getPortalAccount(accountId)) return
  await setSession(accountId)
  redirect('/portal/?welcome=1')
}

export async function portalSignOut() {
  const store = await cookies()
  store.delete(PORTAL_COOKIE)
  redirect('/portal/login/')
}

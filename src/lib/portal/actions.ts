'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEMO_ACCOUNT } from './accounts'
import { isPortalDemoEnabled, PORTAL_COOKIE, PORTAL_COOKIE_MAX_AGE } from './session'
import {
  endAdminSession,
  isAdminEmail,
  isLockedOut,
  startAdminSession,
  verifyAdminCredentials,
} from './admin/auth'

export interface SignInState {
  error?: string
}

async function setDemoSession() {
  const store = await cookies()
  store.set(PORTAL_COOKIE, DEMO_ACCOUNT.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: PORTAL_COOKIE_MAX_AGE,
  })
}

export async function portalSignIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.' }

  if (isAdminEmail(email)) {
    if (isLockedOut(email)) return { error: 'Too many attempts. Try again in 15 minutes.' }
    const admin = await verifyAdminCredentials(email, password)
    if (!admin) return { error: 'That email and password don’t match.' }
    await startAdminSession(admin)
    redirect('/portal/admin/')
  }

  if (email === DEMO_ACCOUNT.email.toLowerCase() && isPortalDemoEnabled()) {
    await setDemoSession()
    redirect('/portal/?welcome=1')
  }

  return { error: 'Dealer sign-in isn’t open yet. Explore the demo below, or use the Pro Hub for orders today.' }
}

export async function portalStartDemo() {
  if (!isPortalDemoEnabled()) redirect('/portal/login/')
  await setDemoSession()
  redirect('/portal/?welcome=1')
}

export async function portalSignOut() {
  const store = await cookies()
  store.delete(PORTAL_COOKIE)
  redirect('/portal/login/')
}

export async function adminSignOut() {
  await endAdminSession()
  redirect('/portal/login/')
}

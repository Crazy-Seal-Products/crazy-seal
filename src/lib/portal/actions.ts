'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEMO_ACCOUNT } from './accounts'
import { logAccess } from './admin/access-log'
import { isPortalDemoEnabled, PORTAL_COOKIE, PORTAL_COOKIE_MAX_AGE } from './session'
import {
  endAdminSession,
  getPortalAdmin,
  isAdminEmail,
  isLockedOut,
  isStaffEmail,
  startAdminSession,
  verifyAdminCredentials,
  verifyStaffCredentials,
} from './admin/auth'

export interface SignInState {
  error?: string
  /** Which input the error is about, so the form can mark it. */
  field?: 'email' | 'password'
  /** The email that was tried, so the form keeps it after an error. */
  email?: string
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
  if (!email) return { error: 'Enter your email.', field: 'email', email }
  if (!password) return { error: 'Enter your password.', field: 'password', email }

  // Admins: a backup env login and/or a staff account (the Supabase login the
  // old site admin used). Either password works.
  const envUser = isAdminEmail(email)
  const staffUser = await isStaffEmail(email)
  if (envUser || staffUser) {
    if (isLockedOut(email)) return { error: 'Too many attempts. Try again in 15 minutes.', field: 'password', email }
    if (envUser) {
      const admin = await verifyAdminCredentials(email, password)
      if (admin) {
        await startAdminSession(admin)
        await logAccess(admin, 'sign_in', admin.email, { via: 'env' })
        redirect('/portal/admin/')
      }
    }
    const staff = staffUser ? await verifyStaffCredentials(email, password) : null
    if (staff) {
      await logAccess(staff, 'sign_in', staff.email, { via: 'staff' })
      redirect('/portal/admin/')
    }
    return { error: 'That password isn’t right. Try again, or use “Forgot your password?”.', field: 'password', email }
  }

  if (email === DEMO_ACCOUNT.email.toLowerCase() && isPortalDemoEnabled()) {
    await setDemoSession()
    redirect('/portal/?welcome=1')
  }

  return {
    error: 'There’s no admin account for this email. Dealer sign-in isn’t open yet: explore the demo below, or use the Pro Hub for orders today.',
    field: 'email',
    email,
  }
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

/** After a password reset: is the new Supabase session a Crazy Seal Admin? */
export async function checkStaffSession(): Promise<boolean> {
  return Boolean(await getPortalAdmin())
}

export async function adminSignOut() {
  await endAdminSession()
  redirect('/portal/login/')
}

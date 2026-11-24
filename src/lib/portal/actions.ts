'use server'

import { redirect } from 'next/navigation'
import { logAccess } from './admin/access-log'
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

  return {
    error: 'There’s no Crazy Seal staff account for this email. Contractors: use “Sign in to your contractor portal” below.',
    field: 'email',
    email,
  }
}

/** After a password reset: is the new Supabase session a Crazy Seal Admin? */
export async function checkStaffSession(): Promise<boolean> {
  return Boolean(await getPortalAdmin())
}

export async function adminSignOut() {
  await endAdminSession()
  redirect('/portal/login/')
}

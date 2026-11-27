'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { isPortalThemeKey, PORTAL_THEME_COOKIE } from './theme'

/**
 * Saves the portal look this person picked (Account → Look). A preference in
 * their browser only: nothing about the contractor or their account changes,
 * so it works in View as too.
 */
export async function setPortalTheme(key: string): Promise<{ ok: boolean }> {
  if (!isPortalThemeKey(key)) return { ok: false }
  ;(await cookies()).set(PORTAL_THEME_COOKIE, key, {
    path: '/portal',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
  })
  revalidatePath('/portal', 'layout')
  return { ok: true }
}

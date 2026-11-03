import { createHmac, timingSafeEqual } from 'node:crypto'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPortalAdmin, type PortalAdmin } from '@/lib/portal/admin/auth'
import type { ProUser } from './auth'

/**
 * "View as" for Crazy Seal Admins: open the Pro Hub as a dealer, read-only.
 *
 * Nothing touches the dealer's own sessions. The admin's browser gets a short
 * signed cookie naming the dealer, and it only counts while that same browser
 * is still signed in to the Crazy Seal Admin as the admin who started it. So
 * the cookie alone is useless, and dealers can never use it. Pro Hub routes
 * that change data refuse while a view is active (see isViewingAs). Every
 * start and exit goes in admin_view_as_log.
 */

export const VIEW_AS_COOKIE = 'cs_pro_view_as'
const VIEW_AS_SECONDS = 60 * 60

export const VIEW_AS_READ_ONLY =
  'You’re viewing this account as an admin, which is read-only. Nothing here can be changed in admin view.'

export interface ViewAs {
  user: ProUser
  admin: PortalAdmin
  expiresAt: number
}

interface Payload {
  u: string // pro user id
  a: string // admin email
  x: number // expiry, epoch seconds
}

// Keyed off a server-only secret that's always set in production.
function key(): Buffer {
  return createHmac('sha256', process.env.SUPABASE_SECRET_KEY ?? '').update('cs-pro-view-as:v1').digest()
}

function sign(payload: string): string {
  return createHmac('sha256', key()).update(payload).digest('base64url')
}

function readCookie(value: string | undefined): Payload | null {
  if (!value || !process.env.SUPABASE_SECRET_KEY) return null
  const [payload, sig] = value.split('.')
  if (!payload || !sig) return null
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Payload
    return p.u && p.a && p.x * 1000 > Date.now() ? p : null
  } catch {
    return null
  }
}

async function log(admin: PortalAdmin, user: Pick<ProUser, 'id' | 'email'>, action: 'start' | 'exit') {
  const { error } = await createAdminClient()
    .from('admin_view_as_log')
    .insert({ admin_email: admin.email, admin_name: admin.name, pro_user_id: user.id, pro_user_email: user.email, action })
  if (error) console.error('[view-as] log failed', error.message)
}

/** The active admin view in this request, or null. Cached per request. */
export const getViewAs = cache(async (): Promise<ViewAs | null> => {
  const p = readCookie((await cookies()).get(VIEW_AS_COOKIE)?.value)
  if (!p) return null
  const admin = await getPortalAdmin()
  if (!admin || admin.email !== p.a) return null
  const { data } = await createAdminClient().from('pro_users').select('*').eq('id', p.u).maybeSingle()
  return data ? { user: data as ProUser, admin, expiresAt: p.x * 1000 } : null
})

export async function isViewingAs(): Promise<boolean> {
  return Boolean(await getViewAs())
}

/** Starts a read-only view of a dealer's Pro Hub for the signed-in admin. */
export async function startViewAs(admin: PortalAdmin, proUserId: string): Promise<ProUser | null> {
  const { data } = await createAdminClient().from('pro_users').select('*').eq('id', proUserId).maybeSingle()
  const user = data as ProUser | null
  if (!user) return null
  const payload = Buffer.from(
    JSON.stringify({ u: user.id, a: admin.email, x: Math.floor(Date.now() / 1000) + VIEW_AS_SECONDS } satisfies Payload),
  ).toString('base64url')
  ;(await cookies()).set(VIEW_AS_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: VIEW_AS_SECONDS,
  })
  await log(admin, user, 'start')
  return user
}

export async function endViewAs(): Promise<void> {
  const viewing = await getViewAs()
  ;(await cookies()).delete(VIEW_AS_COOKIE)
  if (viewing) await log(viewing.admin, viewing.user, 'exit')
}

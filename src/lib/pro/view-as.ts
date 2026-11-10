import { createHmac, timingSafeEqual } from 'node:crypto'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { adminCan, getPortalAdmin, type PortalAdmin } from '@/lib/portal/admin/auth'
import type { ProUser } from './auth'

/**
 * "View as" for Crazy Seal Admins: open the Pro Hub as a dealer, read-only.
 *
 * Nothing touches the dealer's own sessions or account. The admin's browser
 * gets a short signed cookie naming the dealer, and it only counts while that
 * same browser is still signed in to the Crazy Seal Admin as the admin who
 * started it. So the cookie alone is useless, and dealers can never use it.
 * Pro Hub routes that change data refuse while a view is active (see
 * isViewingAs), and loadProContext skips its pro_users sync. Every start and
 * end goes in admin_view_as_log: ending a view (Exit, or pressing View as
 * again) logs it even when the view no longer counts.
 *
 * A dealer on the roster with no Pro Hub account still gets a base view: the
 * Pro Hub built from their Shopify customer record, which is what they'd see
 * after signing up with that email. Once they sign up, the view shows their
 * account instead.
 *
 * The model of all this is docs/statecharts/view-as (skill verify-view-as-model).
 */

export const VIEW_AS_COOKIE = 'cs_pro_view_as'
const VIEW_AS_SECONDS = 60 * 60

export const VIEW_AS_READ_ONLY =
  'You’re viewing this account as an admin, which is read-only. Nothing here can be changed in admin view.'

/**
 * The account id in a base view. A uuid no row has, so lookups by account
 * (warranties they filed, support chats) come back empty, as for a new account.
 */
export const NO_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000'

export interface ViewAs {
  user: ProUser
  admin: PortalAdmin
  expiresAt: number
  /** False in a base view of a dealer with no Pro Hub account. */
  hasAccount: boolean
}

export type ViewAsTarget = { proUserId: string } | { customerId: string }

interface Payload {
  u?: string // pro user id
  c?: string // Shopify customer id, for a dealer with no Pro Hub account
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
    return (p.u || p.c) && p.a && p.x * 1000 > Date.now() ? p : null
  } catch {
    return null
  }
}

async function accountUser(proUserId: string): Promise<ProUser | null> {
  const { data } = await createAdminClient().from('pro_users').select('*').eq('id', proUserId).maybeSingle()
  return (data as ProUser | null) ?? null
}

interface CustomerForView {
  shopify_id: string
  display_name: string | null
  email: string | null
  phone: string | null
  company: string | null
}

async function customerForView(customerId: string): Promise<CustomerForView | null> {
  const { data } = await createAdminClient()
    .from('shopify_customers')
    .select('shopify_id, display_name, email, phone, company:default_address->>company')
    .eq('shopify_id', customerId)
    .is('deleted_at', null)
    .maybeSingle<CustomerForView>()
  return data
}

/** The Pro Hub user a dealer with no account would be, from their Shopify record. */
function baseUser(c: CustomerForView): ProUser | null {
  const email = c.email?.trim().toLowerCase()
  if (!email) return null
  return {
    id: NO_ACCOUNT_ID,
    email,
    display_name: c.display_name,
    business_name: c.company,
    phone: c.phone,
    shopify_customer_id: c.shopify_id,
    status_override: null,
    last_login_at: null,
    invited_at: null,
    created_at: new Date().toISOString(),
    password_hash: null,
  }
}

/** Their Pro Hub account, if they've made one since the roster was loaded. */
async function accountForCustomer(c: CustomerForView): Promise<ProUser | null> {
  const db = createAdminClient()
  const { data: linked } = await db.from('pro_users').select('*').eq('shopify_customer_id', c.shopify_id).limit(1).maybeSingle()
  if (linked) return linked as ProUser
  const email = c.email?.trim().toLowerCase()
  if (!email) return null
  const { data } = await db.from('pro_users').select('*').eq('email', email).maybeSingle()
  return (data as ProUser | null) ?? null
}

/** The dealer a view shows: their account, or for a roster dealer the base view until they sign up. */
async function viewedUser(p: Payload): Promise<{ user: ProUser; hasAccount: boolean } | null> {
  if (p.u) {
    const user = await accountUser(p.u)
    return user ? { user, hasAccount: true } : null
  }
  const customer = p.c ? await customerForView(p.c) : null
  if (!customer) return null
  const account = await accountForCustomer(customer)
  if (account) return { user: account, hasAccount: true }
  const base = baseUser(customer)
  return base ? { user: base, hasAccount: false } : null
}

async function log(admin: { email: string; name: string | null }, user: Pick<ProUser, 'id' | 'email'>, action: 'start' | 'exit') {
  const { error } = await createAdminClient()
    .from('admin_view_as_log')
    .insert({
      admin_email: admin.email,
      admin_name: admin.name,
      pro_user_id: user.id === NO_ACCOUNT_ID ? null : user.id,
      pro_user_email: user.email || '(unknown)',
      action,
    })
  if (error) console.error('[view-as] log failed', error.message)
}

/** The active admin view in this request, or null. Cached per request. */
export const getViewAs = cache(async (): Promise<ViewAs | null> => {
  const p = readCookie((await cookies()).get(VIEW_AS_COOKIE)?.value)
  if (!p) return null
  const admin = await getPortalAdmin()
  if (!admin || admin.email !== p.a || !(await adminCan('view_as'))) return null
  const viewed = await viewedUser(p)
  return viewed ? { ...viewed, admin, expiresAt: p.x * 1000 } : null
})

export async function isViewingAs(): Promise<boolean> {
  return Boolean(await getViewAs())
}

/**
 * This browser holds a view cookie, whether or not the view still counts (its
 * admin may have signed out or lost View as). "Exit admin view" ends it either
 * way, so it can't come back when the admin signs in again.
 */
export async function hasViewAsCookie(): Promise<boolean> {
  return Boolean(readCookie((await cookies()).get(VIEW_AS_COOKIE)?.value))
}

/** Logs the end of the view a cookie names, for the admin it names. */
async function logEnd(p: Payload) {
  const viewed = await viewedUser(p)
  const admin = await getPortalAdmin()
  await log({ email: p.a, name: admin?.email === p.a ? admin.name : null }, viewed?.user ?? { id: NO_ACCOUNT_ID, email: '' }, 'exit')
}

/**
 * Starts a read-only view of a dealer's Pro Hub for the signed-in admin: their
 * account, or for a roster dealer with no account, the base view.
 */
export async function startViewAs(admin: PortalAdmin, target: ViewAsTarget): Promise<ProUser | null> {
  let user: ProUser | null
  let named: Pick<Payload, 'u' | 'c'>
  if ('proUserId' in target) {
    user = await accountUser(target.proUserId)
    named = { u: user?.id }
  } else {
    const customer = await customerForView(target.customerId)
    if (!customer) return null
    const account = await accountForCustomer(customer)
    user = account ?? baseUser(customer)
    named = account ? { u: account.id } : { c: customer.shopify_id }
  }
  if (!user) return null

  // Pressing View as again replaces the view in this browser: log that one's end first.
  const jar = await cookies()
  const replaced = readCookie(jar.get(VIEW_AS_COOKIE)?.value)
  if (replaced) await logEnd(replaced)

  const payload = Buffer.from(
    JSON.stringify({ ...named, a: admin.email, x: Math.floor(Date.now() / 1000) + VIEW_AS_SECONDS } satisfies Payload),
  ).toString('base64url')
  jar.set(VIEW_AS_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: VIEW_AS_SECONDS,
  })
  await log(admin, user, 'start')
  return user
}

/**
 * Ends the view in this browser: always deletes the cookie, and logs the end
 * of the view it named even when that view no longer counts.
 */
export async function endViewAs(): Promise<void> {
  const jar = await cookies()
  const p = readCookie(jar.get(VIEW_AS_COOKIE)?.value)
  jar.delete(VIEW_AS_COOKIE)
  if (p) await logEnd(p)
}

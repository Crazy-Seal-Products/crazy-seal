import { createHash, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  MAGIC_LINK_COOLDOWN_SECONDS,
  MAGIC_LINK_MINUTES,
  SESSION_COOKIE,
  SESSION_DAYS,
} from './config'

export interface ProUser {
  id: string
  email: string
  display_name: string | null
  business_name: string | null
  phone: string | null
  shopify_customer_id: string | null
  status_override: string | null
  last_login_at: string | null
  invited_at: string | null
  created_at: string
  password_hash?: string | null
}

export function hasPassword(user: ProUser | null | undefined): boolean {
  return Boolean(user?.password_hash)
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function newSecretToken(): string {
  return randomBytes(32).toString('hex')
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function upsertProUser(
  email: string,
  extras: Partial<Pick<ProUser, 'display_name' | 'business_name' | 'phone' | 'shopify_customer_id'>> = {},
): Promise<ProUser> {
  const supabase = createAdminClient()
  const normalized = normalizeEmail(email)

  const { data: existing } = await supabase
    .from('pro_users')
    .select('*')
    .eq('email', normalized)
    .maybeSingle()

  if (existing) {
    const patch: Record<string, unknown> = {}
    if (extras.display_name && !existing.display_name) patch.display_name = extras.display_name
    if (extras.business_name && !existing.business_name) patch.business_name = extras.business_name
    if (extras.phone && !existing.phone) patch.phone = extras.phone
    if (extras.shopify_customer_id) patch.shopify_customer_id = extras.shopify_customer_id
    if (Object.keys(patch).length === 0) return existing as ProUser
    const { data: updated, error } = await supabase
      .from('pro_users')
      .update(patch)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return updated as ProUser
  }

  const { data, error } = await supabase
    .from('pro_users')
    .insert({
      email: normalized,
      display_name: extras.display_name || null,
      business_name: extras.business_name || null,
      phone: extras.phone || null,
      shopify_customer_id: extras.shopify_customer_id || null,
    })
    .select()
    .single()
  if (error) throw error
  return data as ProUser
}

export async function createMagicLink(
  email: string,
  opts: { createIfMissing?: boolean } = {},
): Promise<{ token: string; cooldown: boolean }> {
  const supabase = createAdminClient()
  const normalized = normalizeEmail(email)
  const createIfMissing = opts.createIfMissing !== false

  if (!createIfMissing) {
    const { data: existing } = await supabase
      .from('pro_users')
      .select('id, last_magic_link_at')
      .eq('email', normalized)
      .maybeSingle()
    if (!existing) return { token: '', cooldown: false }
  }

  const user = await upsertProUser(normalized)

  const { data: fresh } = await supabase
    .from('pro_users')
    .select('last_magic_link_at')
    .eq('id', user.id)
    .single()

  const lastSent = fresh?.last_magic_link_at ? new Date(fresh.last_magic_link_at).getTime() : 0
  if (lastSent && Date.now() - lastSent < MAGIC_LINK_COOLDOWN_SECONDS * 1000) {
    return { token: '', cooldown: true }
  }

  const token = newSecretToken()
  const expires = new Date(Date.now() + MAGIC_LINK_MINUTES * 60 * 1000).toISOString()

  const { error } = await supabase.from('pro_magic_links').insert({
    email: normalized,
    token_hash: hashToken(token),
    expires_at: expires,
  })
  if (error) throw error

  await supabase
    .from('pro_users')
    .update({ last_magic_link_at: new Date().toISOString() })
    .eq('id', user.id)

  return { token, cooldown: false }
}

export async function getProUserByEmail(email: string): Promise<ProUser | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('pro_users')
    .select('*')
    .eq('email', normalizeEmail(email))
    .maybeSingle()
  return (data as ProUser) ?? null
}

export async function setPasswordHash(userId: string, passwordHash: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('pro_users')
    .update({ password_hash: passwordHash, last_login_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}

export async function touchLogin(userId: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('pro_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId)
}

export async function consumeMagicLink(token: string): Promise<ProUser | null> {
  if (!token) return null
  const supabase = createAdminClient()
  const { data: link } = await supabase
    .from('pro_magic_links')
    .select('*')
    .eq('token_hash', hashToken(token))
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!link) return null

  await supabase
    .from('pro_magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', link.id)

  const user = await upsertProUser(link.email)
  await supabase
    .from('pro_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id)

  return { ...user, last_login_at: new Date().toISOString() }
}

export async function createSession(proUserId: string): Promise<string> {
  const supabase = createAdminClient()
  const token = newSecretToken()
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { error } = await supabase.from('pro_sessions').insert({
    pro_user_id: proUserId,
    token_hash: hashToken(token),
    expires_at: expires,
  })
  if (error) throw error
  return token
}

export function applySessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
  return response
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function getProUser(): Promise<ProUser | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  return getProUserFromToken(token)
}

export async function getProUserFromToken(token: string): Promise<ProUser | null> {
  const supabase = createAdminClient()
  const { data: session } = await supabase
    .from('pro_sessions')
    .select('id, pro_user_id, expires_at')
    .eq('token_hash', hashToken(token))
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!session) return null

  const { data: user } = await supabase
    .from('pro_users')
    .select('*')
    .eq('id', session.pro_user_id)
    .maybeSingle()

  return (user as ProUser) ?? null
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return
  const supabase = createAdminClient()
  await supabase.from('pro_sessions').delete().eq('token_hash', hashToken(token))
}

export async function markInvited(email: string, staffId: string | null): Promise<ProUser> {
  const user = await upsertProUser(email)
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('pro_users')
    .update({
      invited_at: new Date().toISOString(),
      invited_by: staffId,
    })
    .eq('id', user.id)
    .select()
    .single()
  if (error) throw error
  return data as ProUser
}

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://crazyseal.com').replace(/\/$/, '')
}

/** Use the incoming request host so local magic links hit localhost, not production. */
export function requestOrigin(request: NextRequest): string {
  return request.nextUrl.origin.replace(/\/$/, '')
}

export function isMissingRelation(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code?: string }).code) : ''
  return code === '42P01' || code === 'PGRST205' || /could not find the table|relation .* does not exist|schema cache/i.test(message)
}

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Flags on self-service Pro Hub sign-ups, for staff to review (Admin → Dealers → Portal accounts).
 *
 * From Oct 27 to Nov 20, 2026 a bot signed up 220 Pro Hub accounts with harvested emails: Gmail
 * addresses with dots scattered through them (Gmail ignores dots, so mail still reaches the real
 * person) and staff addresses at unrelated companies, none of them a customer, installer or lead.
 * Sign-up now needs Turnstile (signup-guard.ts). A sign-up that still gets through and looks like
 * that is flagged here. A flag changes nothing for the account; it only puts it in the queue.
 */

export const SIGNUP_FLAG_LABEL = {
  dotted_gmail: 'Gmail address with dots scattered through it, a bot trick (Gmail ignores the dots)',
  same_inbox: 'Another Pro Hub account already uses this Gmail inbox, spelled with different dots or a +tag',
  same_ip: 'A third or later sign-up from the same IP within 24 hours',
  burst: 'Five or more sign-ups across the site within an hour',
  unknown_email: 'Not a customer, installer, contractor or lead we know',
  bot_wave: 'Signed up during the Oct 27–Nov 6, 2026 bot wave',
  pre_fix_signup: 'Its password was set at sign-up before the Nov 6, 2026 fix, so it never proved it owns the inbox',
} as const

export type SignupFlag = keyof typeof SIGNUP_FLAG_LABEL

export function signupFlagLabel(code: string): string {
  return (SIGNUP_FLAG_LABEL as Record<string, string>)[code] ?? code
}

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com'])
const HOUR = 60 * 60 * 1000
const SAME_IP_OTHERS = 2 // flag the third sign-up from one IP in a day
const BURST_OTHERS = 4 // flag the fifth sign-up across the site in an hour

function split(email: string): [string, string] {
  const at = email.lastIndexOf('@')
  return [email.slice(0, at).toLowerCase(), email.slice(at + 1).toLowerCase()]
}

/** The inbox Gmail delivers to (dots and any +tag dropped), or null for other providers. */
export function gmailInbox(email: string): string | null {
  const [local, domain] = split(email.trim())
  if (!local || !GMAIL_DOMAINS.has(domain)) return null
  return `${local.split('+')[0].replace(/\./g, '')}@gmail.com`
}

/** A Gmail name with three or more dots, or a doubled, leading or trailing dot. People rarely use more than two. */
export function hasScatteredDots(email: string): boolean {
  const [local, domain] = split(email.trim())
  if (!GMAIL_DOMAINS.has(domain)) return false
  const name = local.split('+')[0]
  return (name.match(/\./g)?.length ?? 0) >= 3 || name.includes('..') || name.startsWith('.') || name.endsWith('.')
}

/** For ilike: the email must match only itself, never as a pattern. */
const literal = (email: string) => email.replace(/[\\%_]/g, '\\$&')

/** Does any customer, warranty, contractor or lead carry this email (any capitalisation)? */
async function isKnownEmail(email: string): Promise<boolean> {
  const supabase = createAdminClient()
  const pattern = literal(email)
  const same = (v: unknown) => typeof v === 'string' && v.trim().toLowerCase() === email
  const lookups: [string, string][] = [
    ['shopify_customers', 'email'],
    ['warranty_registrations', 'email'],
    ['warranty_registrations', 'installer_email'],
    ['contractors', 'email'],
    ['leads', 'email'],
  ]
  const found = await Promise.all(
    lookups.map(async ([table, column]) => {
      const { data, error } = await supabase.from(table).select(column).ilike(column, pattern).limit(5)
      if (error) throw error
      return ((data ?? []) as unknown as Record<string, unknown>[]).some((row) => same(row[column]))
    }),
  )
  return found.some(Boolean)
}

/** Why a new self-service sign-up for `email` (already lowercased) from `ip` looks wrong, if it does. */
export async function signupFlagReasons(email: string, ip: string | null, now = Date.now()): Promise<SignupFlag[]> {
  const supabase = createAdminClient()
  const inbox = gmailInbox(email)

  const [recent, gmailUsers, known] = await Promise.all([
    supabase
      .from('pro_users')
      .select('email, signup_ip, created_at')
      .gte('created_at', new Date(now - 24 * HOUR).toISOString())
      .is('invited_at', null)
      .limit(1000),
    inbox
      ? supabase.from('pro_users').select('email').ilike('email', '%@g%mail.com').limit(5000)
      : Promise.resolve({ data: [] as { email: string }[], error: null }),
    isKnownEmail(email),
  ])
  if (recent.error) throw recent.error
  if (gmailUsers.error) throw gmailUsers.error

  const others = (recent.data ?? []).filter((u) => u.email !== email)
  const reasons: SignupFlag[] = []
  if (hasScatteredDots(email)) reasons.push('dotted_gmail')
  if (inbox && (gmailUsers.data ?? []).some((u) => u.email !== email && gmailInbox(u.email) === inbox)) reasons.push('same_inbox')
  if (ip && others.filter((u) => u.signup_ip === ip).length >= SAME_IP_OTHERS) reasons.push('same_ip')
  if (others.filter((u) => new Date(u.created_at).getTime() >= now - HOUR).length >= BURST_OTHERS) reasons.push('burst')
  if (!known) reasons.push('unknown_email')
  return reasons
}

/**
 * Notes where a new self-service account came from and flags it if it looks wrong. Call it once,
 * right after sign-up or a sign-in link request created the account. It never blocks the sign-up:
 * any failure (for example before migration 034) is only logged.
 */
export async function recordSignup(
  email: string,
  meta: { ip: string | null; userAgent: string | null },
): Promise<SignupFlag[]> {
  const normalized = email.trim().toLowerCase()
  try {
    const reasons = await signupFlagReasons(normalized, meta.ip)
    const patch: Record<string, unknown> = { signup_ip: meta.ip, signup_user_agent: meta.userAgent?.slice(0, 400) ?? null }
    if (reasons.length) Object.assign(patch, { flag_reasons: reasons, flagged_at: new Date().toISOString() })
    const { error } = await createAdminClient().from('pro_users').update(patch).eq('email', normalized)
    if (error) throw error
    if (reasons.length) console.warn('[pro/signup] flagged for review:', reasons.join(', '))
    return reasons
  } catch (err) {
    console.error('[pro/signup] could not record the sign-up', err)
    return []
  }
}

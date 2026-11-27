import { isAutoCompany, releaseAutoCompany } from './provision'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { createMagicLink, getProUserByEmail, siteOrigin, upsertProUser } from '@/lib/pro/auth'
import { MAGIC_LINK_MINUTES, SUPPORT_PHONE } from '@/lib/pro/config'
import { sendEmail } from '@/lib/email/gmail'
import { logContractorActivity } from './activity'
import { ROLE_INFO, isContractorRole, type ContractorRole } from './roles'

/**
 * Putting people on a contractor's portal team, shared by the portal's Team
 * page (an owner or admin inviting their people) and the Crazy Seal admin
 * (staff adding a contractor's owner).
 *
 * An invite makes (or reuses) the person's Pro Hub account, adds them to the
 * team as 'invited', and emails a set-password link: the Pro Hub reset link
 * (/pro/reset), which signs them in and lands in the portal. Signing in turns
 * 'invited' into 'active' (src/lib/contractor/viewer.ts). The link expires
 * like any Pro Hub reset link; after that, Forgot password on the Pro Hub
 * sign-in sends a new one.
 *
 * A contractor nobody has added yet can activate their portal themselves:
 * Forgot password with the email on their contractor record makes them the
 * owner (activateContractorOwner, called from /api/pro/auth/forgot).
 */

// No `*`, `,` or parentheses: PostgREST reads `*` as a wildcard in like patterns (escaping
// doesn't help) and the others break its filter syntax.
export const INVITE_EMAIL_RE = /^[^\s@",()<>*]+@[^\s@",()<>*]+\.[^\s@",()<>*]+$/

/** Where an invite's set-password link lands once the password is set. */
const AFTER_INVITE = '/portal/'

export type InviteResult =
  | { ok: true; proUserId: string; email: string; name: string; emailed: boolean; message: string }
  | { ok: false; error: string }

/** This request's address (so invites sent from a preview or localhost link back to it). */
export async function requestSiteOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) return siteOrigin()
  const proto = h.get('x-forwarded-proto') ?? (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https')
  return `${proto}://${host}`
}

/** The set-password link an invite emails. */
export function inviteUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}/pro/reset/?token=${encodeURIComponent(token)}&welcome=1&next=${AFTER_INVITE}`
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

async function emailInvite(to: string, opts: { company: string; inviter: string | null; role: ContractorRole; url: string; origin: string }) {
  const company = escapeHtml(opts.company)
  const who = opts.inviter ? `${escapeHtml(opts.inviter)} added you` : 'You’ve been added'
  const forgot = `${opts.origin.replace(/\/$/, '')}/pro/forgot/?next=${AFTER_INVITE}`
  await sendEmail({
    to,
    subject: `${opts.company}: your Crazy Seal contractor portal`,
    html: `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;max-width:600px;">
        <div style="background:#003365;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
          <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#F9EA1C;font-weight:bold;">Crazy Seal contractor portal</p>
          <h1 style="margin:8px 0 0;font-size:22px;">${company}</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
          <p>${who} to ${company}’s Crazy Seal contractor portal as <strong>${escapeHtml(ROLE_INFO[opts.role].label)}</strong>: ${escapeHtml(ROLE_INFO[opts.role].summary)}</p>
          <p>Choose a password to open it. This link works for ${MAGIC_LINK_MINUTES} minutes.</p>
          <p style="margin:28px 0;">
            <a href="${opts.url}" target="_blank"
               style="display:inline-block;background:#5BA411;color:#fff;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;">
              Set your password
            </a>
          </p>
          <p style="font-size:12px;color:#888;">Link expired? Use <a href="${forgot}" style="color:#003365;">Forgot password</a> with this email address to get a new one.</p>
          <p style="font-size:12px;color:#888;">Questions? Call ${SUPPORT_PHONE} (M–F 9AM–6PM EST).</p>
        </div>
      </div>
    `,
  })
}

/**
 * Emails a set-password link that lands in the portal. Respects the Pro Hub's
 * one-link-a-minute limit (createMagicLink), so `cooldown` means nothing was sent.
 */
export async function sendInviteLink(opts: {
  email: string
  company: string
  inviter: string | null
  role: ContractorRole
  origin: string
}): Promise<{ sent: boolean; cooldown: boolean }> {
  const { token, cooldown } = await createMagicLink(opts.email)
  if (cooldown || !token) return { sent: false, cooldown }
  await emailInvite(opts.email, { company: opts.company, inviter: opts.inviter, role: opts.role, url: inviteUrl(opts.origin, token), origin: opts.origin })
  return { sent: true, cooldown: false }
}

function personName(name: string | null | undefined, email: string): string {
  return name?.trim() || email
}

interface ContractorMatch {
  id: string
  email: string | null
  is_listed: boolean
  company: string | null
  first_name: string | null
  goes_by: string | null
  last_name: string | null
}

/**
 * Contractor records whose email is exactly this one (any case). PostgREST
 * reads `*` in a like pattern as a wildcard whatever the escaping, so an email
 * with one matches nothing, and every row found is checked for exact equality.
 */
async function contractorsByEmail(email: string): Promise<ContractorMatch[]> {
  const wanted = email.trim().toLowerCase()
  if (!wanted || wanted.includes('*')) return []
  const { data, error } = await createAdminClient()
    .from('contractors')
    .select('id, email, is_listed, company, first_name, goes_by, last_name, import_key')
    .ilike('email', wanted.replace(/[\\%_]/g, '\\$&'))
    .order('created_at')
    .limit(25)
    .returns<(ContractorMatch & { import_key: string | null })[]>()
  if (error) throw new Error(`contractors: ${error.message}`)
  // A Pro account's own automatic company (src/lib/contractor/provision.ts) isn't a contractor on the list.
  return (data ?? []).filter((c) => c.email?.trim().toLowerCase() === wanted && !isAutoCompany(c))
}

async function companyName(contractorId: string): Promise<string | null> {
  const { data } = await createAdminClient()
    .from('contractors')
    .select('company, first_name, goes_by, last_name, email')
    .eq('id', contractorId)
    .maybeSingle<{ company: string | null; first_name: string | null; goes_by: string | null; last_name: string | null; email: string | null }>()
  if (!data) return null
  return data.company || [data.goes_by || data.first_name, data.last_name].filter(Boolean).join(' ') || data.email || 'Your company'
}

/**
 * Adds someone to a contractor's team as 'invited' and emails their
 * set-password link. Refuses an account that's already on a team (this one
 * or another company's). `invitedBy` is the inviting member's Pro Hub
 * account, or null when Crazy Seal staff add them.
 */
export async function inviteMember(input: {
  contractorId: string
  email: string
  name?: string | null
  role: string
  invitedBy: string | null
  /** Shown in the email: "Jordan added you". Null for a neutral line. */
  inviterName: string | null
  origin: string
}): Promise<InviteResult> {
  const email = String(input.email ?? '').trim().toLowerCase()
  if (!INVITE_EMAIL_RE.test(email) || email.length > 160) return { ok: false, error: 'Enter a valid email address.' }
  if (!isContractorRole(input.role)) return { ok: false, error: 'Pick a role.' }
  const role = input.role
  const name = String(input.name ?? '').trim().slice(0, 120) || null

  try {
    const db = createAdminClient()
    const company = await companyName(input.contractorId)
    if (!company) return { ok: false, error: 'This contractor no longer exists.' }

    // Another contractor's own email: that person is (or will be) that company's owner, so they
    // can't be pulled onto this team from here.
    if ((await contractorsByEmail(email)).some((c) => c.id !== input.contractorId)) {
      return { ok: false, error: 'That email belongs to another contractor on Crazy Seal’s list; ask Crazy Seal to link them.' }
    }

    const existing = await getProUserByEmail(email)
    if (existing) {
      const { data: member, error } = await db
        .from('contractor_members')
        .select('contractor_id, status')
        .eq('pro_user_id', existing.id)
        .maybeSingle<{ contractor_id: string; status: string }>()
      if (error) throw new Error(error.message)
      // Someone who only owns the company their account got automatically can join a real team;
      // anyone on another real company's team can't be pulled over from here.
      if (member && member.contractor_id !== input.contractorId && !(await releaseAutoCompany(existing.id))) {
        return { ok: false, error: 'That email is already on another company’s portal team. Call Crazy Seal to move it.' }
      }
      if (member && member.contractor_id === input.contractorId) {
        return { ok: false, error: member.status === 'invited' ? 'They’re already invited. Use Resend invite.' : 'They’re already on this team.' }
      }
    }

    // An existing account is used as it is (never edited); a new one is made with their name.
    const user = existing ?? (await upsertProUser(email, { display_name: name ?? undefined }))
    const { error: insertError } = await db.from('contractor_members').insert({
      pro_user_id: user.id,
      contractor_id: input.contractorId,
      role,
      status: 'invited',
      invited_by: input.invitedBy,
    })
    if (insertError) {
      if (insertError.code === '23505') return { ok: false, error: 'That account was just added to a team. Refresh the page to see it.' }
      throw new Error(insertError.message)
    }

    const shown = personName(user.display_name ?? name, email)
    try {
      const sent = await sendInviteLink({ email, company, inviter: input.inviterName, role, origin: input.origin })
      return {
        ok: true,
        proUserId: user.id,
        email,
        name: shown,
        emailed: sent.sent,
        message: sent.sent
          ? `Invite sent to ${email}`
          : `Added ${shown}. An email went to them in the last minute, so no new one was sent.`,
      }
    } catch (err) {
      console.error('[contractor-invite] email failed', err)
      return { ok: true, proUserId: user.id, email, name: shown, emailed: false, message: `Added ${shown}, but the email didn’t send. Use Resend invite.` }
    }
  } catch (err) {
    console.error('[contractor-invite]', err)
    return { ok: false, error: 'Could not add them. Try again.' }
  }
}

/** Emails a team member a fresh set-password link (for someone who hasn't set one up yet). */
export async function resendInvite(input: {
  contractorId: string
  proUserId: string
  inviterName: string | null
  origin: string
}): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  try {
    const db = createAdminClient()
    const [{ data: member }, { data: user }, company] = await Promise.all([
      db
        .from('contractor_members')
        .select('role, status')
        .eq('pro_user_id', input.proUserId)
        .eq('contractor_id', input.contractorId)
        .maybeSingle<{ role: ContractorRole; status: string }>(),
      db.from('pro_users').select('email, password_hash').eq('id', input.proUserId).maybeSingle<{ email: string; password_hash: string | null }>(),
      companyName(input.contractorId),
    ])
    if (!member || !user || !company) return { ok: false, error: 'They’re not on this team.' }
    if (member.status === 'disabled') return { ok: false, error: 'Their access is turned off. Turn it back on first.' }
    if (member.status === 'active' && user.password_hash) {
      return { ok: false, error: 'They’ve already set a password. If they forgot it, they can use Forgot password when signing in.' }
    }
    const sent = await sendInviteLink({ email: user.email, company, inviter: input.inviterName, role: member.role, origin: input.origin })
    if (sent.cooldown) return { ok: false, error: 'An email went to them less than a minute ago. Try again shortly.' }
    return { ok: true, message: `Invite sent again to ${user.email}` }
  } catch (err) {
    console.error('[contractor-invite] resend failed', err)
    return { ok: false, error: 'Could not send the invite. Try again.' }
  }
}

/**
 * Activation with Forgot password. When nobody has a Pro Hub account with
 * this email but a contractor's record has it (any case) and that contractor
 * has no owner on their team yet, makes the account and adds it as the
 * contractor's owner, 'invited' until they sign in. Then Forgot password's
 * usual reset link lets them set a password and open their portal.
 *
 * Returns whether it made an owner. Never throws, and does nothing visible
 * to the caller either way, so Forgot password answers the same whatever
 * the email is.
 */
export async function activateContractorOwner(rawEmail: string): Promise<boolean> {
  const email = rawEmail.trim().toLowerCase()
  if (!INVITE_EMAIL_RE.test(email)) return false
  try {
    if (await getProUserByEmail(email)) return false
    const db = createAdminClient()
    const matches = await contractorsByEmail(email)
    if (!matches.length) return false

    // An owner whose access is off doesn't count (as in link.ts): the contractor can activate again.
    const { data: owners, error: ownersError } = await db
      .from('contractor_members')
      .select('contractor_id')
      .in(
        'contractor_id',
        matches.map((c) => c.id),
      )
      .eq('role', 'owner')
      .neq('status', 'disabled')
    if (ownersError) throw new Error(ownersError.message)
    const owned = new Set((owners ?? []).map((o: { contractor_id: string }) => o.contractor_id))
    const open = matches.filter((c) => !owned.has(c.id))
    if (!open.length) return false
    // The same email on several records: the listed one, else the oldest. Staff can move them later.
    if (open.length > 1) console.warn('[contractor-activate] several contractors share this email; using the first listed one', open.map((c) => c.id))
    const contractor = open.find((c) => c.is_listed) ?? open[0]

    const person = [contractor.goes_by || contractor.first_name, contractor.last_name].filter(Boolean).join(' ') || null
    const user = await upsertProUser(email, { display_name: person ?? undefined, business_name: contractor.company ?? undefined })
    const { error: insertError } = await db.from('contractor_members').insert({
      pro_user_id: user.id,
      contractor_id: contractor.id,
      role: 'owner',
      status: 'invited',
      invited_by: null,
    })
    if (insertError) {
      // Already on a team (a request at the same moment, or staff just added them): leave it be.
      if (insertError.code !== '23505') console.error('[contractor-activate] membership', insertError.message)
      return false
    }
    await logContractorActivity(contractor.id, {
      actorId: user.id,
      actorName: person || email,
      actorRole: 'owner',
      entity: 'team',
      entityId: user.id,
      action: 'create',
      summary: `${person || email} activated the portal with Forgot password`,
    })
    return true
  } catch (err) {
    console.error('[contractor-activate]', err)
    return false
  }
}

/**
 * Emails staff members a link to choose their own password.
 *
 *   node scripts/send-password-setup.mjs a@x.com b@y.com            # dry run: writes the email preview, sends nothing
 *   node scripts/send-password-setup.mjs a@x.com b@y.com --apply    # sends
 *
 * For each address (must be an active staff login): replaces the current password
 * with a random one nobody knows and signs the login out everywhere, so an old
 * shared password stops working; voids any earlier unused link; stores a new
 * link (SHA-256 of the token only) valid once for 7 days; and emails it from
 * the site's Gmail sender. The page is /portal/set-password/ (src/app/portal/set-password).
 *
 * Reads .env.local: Supabase URL, secret and publishable keys, GMAIL_CLIENT_ID,
 * GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN. Tokens are never printed.
 */
import { createRequire } from 'node:module'
import { createHash, randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const SITE = {
  brand: 'Crazy Seal',
  area: 'Crazy Seal Admin',
  fromName: 'CRAZY SEAL',
  fromEmail: 'info@crazyseal.com',
  setPasswordUrl: 'https://www.crazyseal.com/portal/set-password/',
  signInUrl: 'https://www.crazyseal.com/portal/login/',
  accountHint: 'click your name at the bottom of the admin sidebar',
  navy: '#003365',
  green: '#5BA411',
}
const ROLE_LABELS = { developer: 'Developer', super_admin: 'Developer', admin: 'Admin', staff: 'Staff', sales_rep: 'Sales rep', hiring: 'Hiring' }
const VALID_DAYS = 7
const TABLE = 'staff_password_setups'

const require = createRequire(import.meta.url)
const { createClient } = require('@supabase/supabase-js')
const nodemailer = require('nodemailer')

const apply = process.argv.includes('--apply')
const emails = process.argv.slice(2).filter((a) => !a.startsWith('--')).map((e) => e.trim().toLowerCase())
if (!emails.length) throw new Error('Give one or more staff emails.')

const env = {}
for (const raw of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
  const m = raw.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
}
const url = env.NEXT_PUBLIC_SUPABASE_URL
const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY
const publishable = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !secret || !publishable) throw new Error('.env.local needs the Supabase URL, secret key and publishable key')
const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function emailHtml({ name, roleLabel, link }) {
  const first = escapeHtml((name || '').trim().split(/\s+/)[0] || 'there')
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;max-width:600px;">
  <div style="background:${SITE.navy};color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
    <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#F9EA1C;font-weight:bold;">${escapeHtml(SITE.area)}</p>
    <h1 style="margin:8px 0 0;font-size:22px;">Set up your password</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
    <p>Hi ${first},</p>
    <p>You have access to the ${escapeHtml(SITE.area)} as <strong>${escapeHtml(roleLabel)}</strong>. Choose your own password to get started.</p>
    <p style="margin:28px 0;">
      <a href="${escapeHtml(link)}" target="_blank" style="display:inline-block;background:${SITE.green};color:#fff;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;">Set my password</a>
    </p>
    <p style="font-size:13px;color:#4b5563;">The link works once and expires in ${VALID_DAYS} days. After that, sign in at <a href="${SITE.signInUrl}">${SITE.signInUrl.replace(/^https:\/\/(www\.)?/, '')}</a>. You can change your password any time: ${escapeHtml(SITE.accountHint)}.</p>
    <p style="font-size:12px;color:#9ca3af;">If you weren't expecting this, you can ignore it.</p>
  </div>
</div>`
}

async function findAuthUser(email) {
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(`listUsers: ${error.message}`)
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === email)
    if (hit || data.users.length < 1000) return hit ?? null
  }
}

async function revokeAllSessions(email) {
  const { data: link, error: linkError } = await db.auth.admin.generateLink({ type: 'magiclink', email })
  const tokenHash = link?.properties?.hashed_token
  if (linkError || !tokenHash) throw new Error(`sign-out: ${linkError?.message || 'no token'}`)
  const anon = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const { data: verified, error: verifyError } = await anon.auth.verifyOtp({ type: 'magiclink', token_hash: tokenHash })
  if (verifyError || !verified?.session) throw new Error(`sign-out: ${verifyError?.message || 'no session'}`)
  const { error } = await db.auth.admin.signOut(verified.session.access_token, 'global')
  if (error) throw new Error(`sign-out: ${error.message}`)
}

const transport = apply
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { type: 'OAuth2', user: SITE.fromEmail, clientId: env.GMAIL_CLIENT_ID, clientSecret: env.GMAIL_CLIENT_SECRET, refreshToken: env.GMAIL_REFRESH_TOKEN },
    })
  : null

let failed = false
const previews = []
for (const email of emails) {
  try {
    const user = await findAuthUser(email)
    if (!user) throw new Error('no login')
    const { data: staff } = await db.from('staff').select('name, role, is_active').eq('auth_user_id', user.id).eq('is_active', true).maybeSingle()
    if (!staff) throw new Error('no active staff row')
    const roleLabel = ROLE_LABELS[(staff.role || 'admin').trim().toLowerCase()] ?? 'Staff'

    if (!apply) {
      previews.push(`<h3 style="font-family:Arial">To: ${escapeHtml(email)}</h3>` + emailHtml({ name: staff.name, roleLabel, link: `${SITE.setPasswordUrl}?t=EXAMPLE` }))
      console.log(`PLAN ${email} (${roleLabel}): replace password with a random one, sign out everywhere, email a ${VALID_DAYS}-day set-password link`)
      continue
    }

    const { error: pwError } = await db.auth.admin.updateUserById(user.id, { password: randomBytes(32).toString('base64url'), email_confirm: true })
    if (pwError) throw new Error(`password: ${pwError.message}`)
    await revokeAllSessions(email)

    const now = new Date()
    await db.from(TABLE).update({ used_at: now.toISOString() }).eq('auth_user_id', user.id).is('used_at', null)
    const token = randomBytes(32).toString('base64url')
    const { error: insertError } = await db.from(TABLE).insert({
      auth_user_id: user.id,
      email,
      token_hash: createHash('sha256').update(token).digest('hex'),
      expires_at: new Date(now.getTime() + VALID_DAYS * 86_400_000).toISOString(),
      created_by: 'scripts/send-password-setup.mjs',
    })
    if (insertError) throw new Error(`link: ${insertError.message}`)

    await transport.sendMail({
      from: `${SITE.fromName} <${SITE.fromEmail}>`,
      to: email,
      subject: `Set up your ${SITE.area} password`,
      html: emailHtml({ name: staff.name, roleLabel, link: `${SITE.setPasswordUrl}?t=${token}` }),
    })
    await db.from('admin_access_log').insert({
      actor_email: 'send-password-setup script',
      target_email: email,
      action: 'password_setup_sent',
      detail: { validDays: VALID_DAYS },
    })
    console.log(`SENT ${email} (${roleLabel})`)
  } catch (err) {
    failed = true
    console.log(`FAIL ${email}: ${err.message}`)
  }
}

if (!apply && previews.length) {
  const out = process.env.PREVIEW_OUT || 'password-setup-preview.html'
  writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>Email preview</title><body style="background:#f3f4f6;padding:24px">${previews.join('<hr style="margin:32px 0">')}</body>`)
  console.log(`Preview written to ${out}. Add --apply to send.`)
}
process.exit(failed ? 1 : 0)

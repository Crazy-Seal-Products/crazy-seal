/**
 * Creates or updates admin staff logins from a local, git-ignored list.
 *
 *   node scripts/provision-staff.mjs            # dry run: shows what would change
 *   node scripts/provision-staff.mjs --apply    # makes the changes
 *
 * Reads Supabase keys from .env.local and the people from .env.team-accounts
 * (ignored by git through the .env* rule), one per line:
 *
 *   email|Name|role|password
 *
 * role is a staff.role value (developer, admin, staff, sales_rep). Leave the
 * name empty to keep an existing staff member's name, and the password empty
 * to keep an existing login's password. For each person:
 * - no login yet: one is created with that password (email already confirmed);
 * - a login already: the password is replaced when one is given, and every
 *   device it was signed in on is signed out. A login that can also sign in
 *   another way (phone, Google, two-factor) is skipped, since a new password
 *   wouldn't close those doors;
 * - their staff row is added or updated with the name, role and access on.
 *
 * Passwords are never printed.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const { createClient } = require('@supabase/supabase-js')

const ROLES = ['developer', 'admin', 'staff', 'sales_rep']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const apply = process.argv.includes('--apply')

function readEnv(file) {
  const env = {}
  for (const raw of readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').split(/\r?\n/)) {
    const m = raw.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return env
}

function readPeople() {
  const people = []
  const text = readFileSync(new URL('../.env.team-accounts', import.meta.url), 'utf8')
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim()
    if (!line || line.startsWith('#')) return
    const [email = '', name = '', role = '', ...rest] = line.split('|')
    const person = { email: email.trim().toLowerCase(), name: name.trim(), role: role.trim(), password: rest.join('|') }
    if (!EMAIL_RE.test(person.email)) throw new Error(`Line ${i + 1}: bad email`)
    if (!ROLES.includes(person.role)) throw new Error(`Line ${i + 1}: role must be one of ${ROLES.join(', ')}`)
    if (person.password && person.password.length < 8) throw new Error(`Line ${i + 1}: password must be 8+ characters`)
    people.push(person)
  })
  return people
}

const env = readEnv('.env.local')
const url = env.NEXT_PUBLIC_SUPABASE_URL
const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY
const publishable = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !secret || !publishable) throw new Error('.env.local needs the Supabase URL, secret key and publishable key')

const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })

async function findAuthUser(email) {
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(`listUsers: ${error.message}`)
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === email)
    if (hit || data.users.length < 1000) return hit ?? null
  }
}

function otherSignInMethods(user) {
  if (user.phone) return 'a phone number'
  if (user.new_email || user.new_phone) return 'a pending email or phone change'
  if ((user.identities ?? []).some((identity) => identity.provider !== 'email')) return 'a linked sign-in provider'
  if ((user.factors ?? []).length > 0) return 'two-factor authentication'
  return null
}

/** Signs a login out everywhere (same approach as the admin's password reset). */
async function revokeAllSessions(email) {
  const { data: link, error: linkError } = await db.auth.admin.generateLink({ type: 'magiclink', email })
  const tokenHash = link?.properties?.hashed_token
  if (linkError || !tokenHash) throw new Error(`sign-out: ${linkError?.message || 'no token'}`)
  const anon = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const { data: verified, error: verifyError } = await anon.auth.verifyOtp({ type: 'magiclink', token_hash: tokenHash })
  const accessToken = verified?.session?.access_token
  if (verifyError || !accessToken) throw new Error(`sign-out: ${verifyError?.message || 'no session'}`)
  const { error } = await db.auth.admin.signOut(accessToken, 'global')
  if (error) throw new Error(`sign-out: ${error.message}`)
}

/** Higher means more access. An old super_admin counts as Developer. */
const RANK = { hiring: 0, sales_rep: 1, staff: 2, admin: 3, developer: 4, super_admin: 4 }
const rankOf = (role) => RANK[(role ?? '').trim().toLowerCase() || 'admin'] ?? RANK.staff

async function provision(person) {
  const notes = []
  let user = await findAuthUser(person.email)

  const { data: rows, error: readError } = await db.from('staff').select('id, name, email, role, is_active, auth_user_id').ilike('email', person.email)
  if (readError) return `FAIL ${person.email}: could not read staff (${readError.message})`
  const row = (rows ?? []).find((r) => (r.email ?? '').toLowerCase() === person.email)

  if (!user) {
    if (!person.password) return `SKIP ${person.email}: no login yet and no password given`
    if (!person.name) return `SKIP ${person.email}: no login yet and no name given`
    notes.push('new login')
    if (apply) {
      const { data, error } = await db.auth.admin.createUser({
        email: person.email,
        password: person.password,
        email_confirm: true,
        user_metadata: { name: person.name, full_name: person.name },
      })
      if (error || !data.user) return `FAIL ${person.email}: could not create login (${error?.message})`
      user = data.user
    }
  } else {
    const other = otherSignInMethods(user)
    if (other) return `SKIP ${person.email}: login also signs in with ${other}; set it up by hand`
    // Someone else may know an existing login's password (a self sign-up, say), so it only
    // gets new or more access together with a new password.
    const grants = !row || !row.is_active || rankOf(person.role) > rankOf(row.role)
    if (!person.password && grants) {
      return `SKIP ${person.email}: has a login already; give a new password to grant or raise its access`
    }
    if (person.password) {
      notes.push('password replaced, signed out everywhere')
      if (apply) {
        const { error } = await db.auth.admin.updateUserById(user.id, { password: person.password, email_confirm: true })
        if (error) return `FAIL ${person.email}: could not set password (${error.message})`
        await revokeAllSessions(person.email)
      }
    } else {
      notes.push('login kept as is')
    }
  }

  const authUserId = user?.id ?? null

  if (row) {
    const changes = []
    if (row.role !== person.role) changes.push(`role ${row.role} → ${person.role}`)
    if (!row.is_active) changes.push('access on')
    if (person.name && (row.name ?? '') !== person.name) changes.push(`name → ${person.name}`)
    if (authUserId && row.auth_user_id !== authUserId) changes.push('linked to login')
    notes.push(changes.length ? `staff: ${changes.join(', ')}` : 'staff: unchanged')
    if (apply && changes.length) {
      const update = { role: person.role, is_active: true }
      if (person.name) update.name = person.name
      if (authUserId) update.auth_user_id = authUserId
      const { error } = await db.from('staff').update(update).eq('id', row.id)
      if (error) return `FAIL ${person.email}: could not update staff (${error.message})`
    }
  } else {
    if (!person.name) return `SKIP ${person.email}: not on staff yet and no name given`
    notes.push(`staff: added as ${person.role}`)
    if (apply) {
      const { error } = await db
        .from('staff')
        .insert({ email: person.email, name: person.name, role: person.role, is_active: true, auth_user_id: authUserId })
      if (error) return `FAIL ${person.email}: could not add staff (${error.message})`
    }
  }

  if (apply) {
    await db.from('admin_access_log').insert({
      actor_email: 'provision-staff script',
      target_email: person.email,
      action: 'staff_added',
      detail: { role: person.role, via: 'scripts/provision-staff.mjs', notes },
    })
  }
  return `${apply ? 'DONE' : 'PLAN'} ${person.email} (${person.role}): ${notes.join('; ')}`
}

const people = readPeople()
console.log(`${apply ? 'Applying' : 'Dry run (add --apply to make changes)'}: ${people.length} account(s) on ${new URL(url).host}`)
let failed = false
for (const person of people) {
  const line = await provision(person).catch((err) => `FAIL ${person.email}: ${err.message}`)
  if (line.startsWith('FAIL') || line.startsWith('SKIP')) failed = true
  console.log(line)
}
process.exit(failed ? 1 : 0)

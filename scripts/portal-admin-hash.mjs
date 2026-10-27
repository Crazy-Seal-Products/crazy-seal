#!/usr/bin/env node
/**
 * Prints a password hash for PORTAL_ADMIN_USERS (same scrypt format as
 * src/lib/pro/password.ts).
 *
 *   node scripts/portal-admin-hash.mjs "<password>"
 *
 * Then add `email|Display Name|<hash>` to PORTAL_ADMIN_USERS (comma-separate
 * multiple admins).
 */
import { randomBytes, scryptSync } from 'node:crypto'

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/portal-admin-hash.mjs "<password>"')
  process.exit(1)
}
const salt = randomBytes(16).toString('hex')
console.log(`${salt}:${scryptSync(password, salt, 64).toString('hex')}`)

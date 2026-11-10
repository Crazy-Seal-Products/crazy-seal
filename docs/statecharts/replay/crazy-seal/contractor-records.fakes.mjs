// Fakes swapped in while the contractor-records replay runs Crazy Seal's real code: the database (the
// app's admin client and the import script's own supabase-js client), the admin sign-in check, Next's
// cache, and the import script's throwaway install of its Excel reader. The "sheet" the reader
// returns is globalThis.__cs.sheet: one object per row, keyed by the dealer list's column names.

// src/lib/supabase/admin.ts and @supabase/supabase-js
export const createAdminClient = () => globalThis.__cs.db
export const createClient = () => globalThis.__cs.db

// src/lib/portal/admin/auth.ts
export async function requirePortalAdmin() {
  return { email: 'admin@example.com', name: 'Admin', role: 'super_admin', via: 'env' }
}

// next/cache
export function revalidatePath() {}

// node:child_process, node:fs and node:module, for scripts/import-contractors.mjs only: the npm
// install "succeeds", and the Excel reader it then looks up is this module.
export function spawnSync() {
  return { status: 0 }
}
export function mkdtempSync() {
  return 'replay-no-temp-dir'
}
export function createRequire() {
  return { resolve: () => import.meta.filename }
}

// read-excel-file/node: one tab laid out like "CS - Dealer List.xlsx" (title row, blank row, header).
const HEADER = ['Type', 'First Name', 'Goes By', 'Last Name', 'Company', 'Phone #1', 'Phone #2', 'Email', 'Street', 'City', 'ST #1', 'Zip Code', 'Notes']
export async function readSheetNames() {
  return ['RV - Dealer']
}
export default async function readXlsxFile() {
  return [['Active Crazy Seal Dealers'], [], HEADER, ...globalThis.__cs.sheet.map((row) => HEADER.map((h) => row[h] ?? null))]
}

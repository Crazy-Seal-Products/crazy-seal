/**
 * Apply a SQL migration file using DATABASE_URL from .env.local.
 *
 *   node scripts/apply-migration.mjs supabase/migrations/013_pro_hub.sql
 *
 * Uses a throwaway install of `pg` so we don't add it to package.json.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/apply-migration.mjs <sql-file>')
  process.exit(1)
}

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const line = envText.split('\n').find((l) => l.startsWith('DATABASE_URL='))
if (!line) {
  console.error('DATABASE_URL missing from .env.local')
  process.exit(1)
}
let url = line.slice('DATABASE_URL='.length).trim()
if (
  (url.startsWith('"') && url.endsWith('"')) ||
  (url.startsWith("'") && url.endsWith("'"))
) {
  url = url.slice(1, -1)
}

const sql = readFileSync(file, 'utf8')
const dir = mkdtempSync(join(tmpdir(), 'cs-pg-'))
const runner = join(dir, 'run.cjs')
writeFileSync(
  runner,
  `
const { Client } = require('pg');
const sql = ${JSON.stringify(sql)};
const url = process.env.DATABASE_URL;
(async () => {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Applied ${file.replace(/'/g, '')}');
})().catch((err) => { console.error(err.message); process.exit(1); });
`,
)

const install = spawnSync('npm', ['install', '--prefix', dir, 'pg@8', '--silent'], {
  stdio: 'inherit',
})
if (install.status !== 0) process.exit(install.status ?? 1)

const run = spawnSync(process.execPath, [runner], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: url },
})
process.exit(run.status ?? 1)

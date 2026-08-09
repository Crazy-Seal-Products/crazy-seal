/**
 * Pull ALL Gravity Forms entries straight from the live WordPress site and
 * import them into Supabase (legacy_gf_entries) — no manual CSV exports.
 *
 * How it works:
 *   1. Uploads a temporary, secret-protected PHP endpoint to the WP webroot
 *      over SFTP.
 *   2. Fetches every form's schema + entries as JSON over HTTPS (paged).
 *   3. DELETES the PHP endpoint (also on failure).
 *   4. Converts entries from field-id keys ("1.3") to label keys
 *      ("Name (First)") matching the GF CSV export convention, rewrites
 *      file URLs to media.crazyseal.com, and upserts into legacy_gf_entries.
 *
 * Raw JSON is also saved to scripts/gf-dump/ (gitignored — contains PII).
 *
 * Usage:
 *   source .env.local
 *   export WP_SFTP_USER=... WP_SFTP_PASS=...
 *   node scripts/pull-legacy-gf.mjs [--form-id 4] [--dry-run]
 *
 * Safe to re-run: upserts on (gf_form_id, gf_entry_id).
 */
import { randomBytes } from 'crypto'
import { mkdirSync, writeFileSync } from 'fs'
import SftpClient from 'ssh2-sftp-client'
import { createClient } from '@supabase/supabase-js'

const SITE = process.env.WP_SITE_URL || 'https://crazyseal.com'
const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const arg = (name) => {
  const idx = args.indexOf(`--${name}`)
  return idx >= 0 ? args[idx + 1] : null
}
const DRY_RUN = flag('dry-run')
const ONLY_FORM = arg('form-id') ? Number(arg('form-id')) : null

const SFTP_CONFIG = {
  host: process.env.WP_SFTP_HOST || 'fs-bonde.easywp.com',
  port: Number(process.env.WP_SFTP_PORT || 22),
  username: process.env.WP_SFTP_USER,
  password: process.env.WP_SFTP_PASS,
}
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY

if (!SFTP_CONFIG.username || !SFTP_CONFIG.password) {
  console.error('Set WP_SFTP_USER and WP_SFTP_PASS')
  process.exit(1)
}
if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_KEY)) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (e.g. source .env.local)')
  process.exit(1)
}

const SECRET = randomBytes(24).toString('hex')
const REMOTE_NAME = `gf-dump-${randomBytes(6).toString('hex')}.php`
const REMOTE_PATH = `/wptbox/${REMOTE_NAME}`

const PHP_SOURCE = `<?php
// Temporary Gravity Forms JSON dump endpoint — uploaded by
// scripts/pull-legacy-gf.mjs and deleted when the pull finishes.
require __DIR__ . '/wp-load.php';
if (!isset($_GET['secret']) || !hash_equals('${SECRET}', $_GET['secret'])) {
  http_response_code(403);
  exit('forbidden');
}
if (!class_exists('GFAPI')) { http_response_code(500); exit('GFAPI unavailable'); }
header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : 'forms';

if ($action === 'forms') {
  $out = array();
  foreach (GFAPI::get_forms(true, false) as $form) {
    $fields = array();
    foreach ($form['fields'] as $f) {
      $inputs = null;
      if (is_array($f->inputs)) {
        $inputs = array();
        foreach ($f->inputs as $i) {
          $inputs[] = array('id' => (string) $i['id'], 'label' => isset($i['label']) ? $i['label'] : '');
        }
      }
      $fields[] = array(
        'id' => (string) $f->id,
        'label' => $f->label,
        'type' => $f->type,
        'inputs' => $inputs,
      );
    }
    $out[] = array(
      'id' => (int) $form['id'],
      'title' => $form['title'],
      'entry_count' => (int) GFAPI::count_entries($form['id'], array('status' => 'active')),
      'fields' => $fields,
    );
  }
  echo json_encode($out);
  exit;
}

if ($action === 'entries') {
  $form_id = intval($_GET['form_id']);
  $page = intval(isset($_GET['page']) ? $_GET['page'] : 0);
  $size = 200;
  $entries = GFAPI::get_entries(
    $form_id,
    array('status' => 'active'),
    array('key' => 'id', 'direction' => 'ASC'),
    array('offset' => $page * $size, 'page_size' => $size)
  );
  echo json_encode($entries);
  exit;
}

http_response_code(400);
echo json_encode(array('error' => 'unknown action'));
`

// --- URL rewriting (same S3 layout as scripts/import-legacy-gf.mjs) ---
// Host-agnostic: old entries reference crazyseal.com AND the EasyWP internal
// domain (crazy-seal-*.ingress-bonde.easywp.com).
function rewriteUrl(value) {
  return value
    .replace(/https?:\/\/[^/\s"'\\]+\/wp-content\/uploads\/gravity_forms\//gi,
      'https://media.crazyseal.com/gravity-forms/')
    .replace(/https?:\/\/[^/\s"'\\]+\/wp-content\/uploads\//gi,
      'https://media.crazyseal.com/site-assets/wp-media/')
}

/** Rewrite a raw GF field value; multifile fields hold a JSON array string. */
function rewriteValue(value) {
  const str = String(value)
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) {
        return JSON.stringify(parsed.map((v) => (typeof v === 'string' ? rewriteUrl(v) : v)))
      }
    } catch { /* not JSON — fall through */ }
  }
  return rewriteUrl(str)
}

function extractFileUrls(entryData) {
  const urls = []
  for (const value of Object.values(entryData)) {
    if (typeof value !== 'string') continue
    const candidates = value.startsWith('[')
      ? (() => { try { return JSON.parse(value) } catch { return [] } })()
      : value.split(/[\n,]+/)
    for (const c of candidates) {
      if (typeof c === 'string' && /media\.crazyseal\.com\/(gravity-forms|site-assets)/i.test(c)) {
        urls.push(c.trim())
      }
    }
  }
  return urls
}

/**
 * Convert a GFAPI entry (field-id keys like "1.3") into the label-keyed
 * shape the CSV importer produced, e.g. "Name (First)". Checkbox-style
 * multi-input fields are joined into one value under the field label.
 */
function labelize(entry, form) {
  const out = {}
  const used = new Set()
  const header = (base) => {
    let h = base || 'Untitled'
    let n = 2
    while (used.has(h)) h = `${base} (${n++})`
    used.add(h)
    return h
  }

  for (const field of form.fields) {
    if (field.inputs && ['name', 'address'].includes(field.type)) {
      for (const input of field.inputs) {
        const v = entry[input.id]
        if (v !== undefined && v !== null && String(v) !== '') {
          out[header(`${field.label} (${input.label})`)] = rewriteValue(v)
        }
      }
    } else if (field.inputs) {
      // checkbox / consent style: gather chosen values
      const values = field.inputs
        .map((i) => entry[i.id])
        .filter((v) => v !== undefined && v !== null && String(v) !== '')
        .map(String)
      if (values.length) out[header(field.label)] = rewriteValue(values.join(", "))
    } else {
      const v = entry[field.id]
      if (v !== undefined && v !== null && String(v) !== '') {
        out[header(field.label)] = rewriteValue(v)
      }
    }
  }

  out['Entry ID'] = String(entry.id)
  out['Entry Date'] = entry.date_created || ''
  if (entry.source_url) out['Source URL'] = rewriteUrl(String(entry.source_url))
  if (entry.ip) out['User IP'] = String(entry.ip)
  return out
}

async function fetchJson(params) {
  const url = `${SITE}/${REMOTE_NAME}?secret=${SECRET}&${params}`
  const res = await fetch(url, { cache: 'no-store' })
  const text = await res.text()
  if (!res.ok) throw new Error(`WP endpoint ${res.status}: ${text.slice(0, 300)}`)
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`WP endpoint returned non-JSON: ${text.slice(0, 300)}`)
  }
}

async function main() {
  mkdirSync('scripts/gf-dump', { recursive: true })
  const sftp = new SftpClient()
  await sftp.connect(SFTP_CONFIG)

  console.log(`Uploading temp endpoint ${REMOTE_NAME}...`)
  await sftp.put(Buffer.from(PHP_SOURCE), REMOTE_PATH)

  try {
    const forms = await fetchJson('action=forms')
    console.log(`\n${forms.length} active forms on the site:`)
    forms.forEach((f) => console.log(`  #${String(f.id).padStart(2)} ${f.title} — ${f.entry_count} entries`))
    writeFileSync('scripts/gf-dump/forms.json', JSON.stringify(forms, null, 2))

    const supabase = DRY_RUN ? null : createClient(SUPABASE_URL, SUPABASE_KEY)
    const targets = ONLY_FORM ? forms.filter((f) => f.id === ONLY_FORM) : forms

    for (const form of targets) {
      if (!form.entry_count) continue
      console.log(`\nForm #${form.id} "${form.title}" (${form.entry_count} entries)`)
      const all = []
      for (let page = 0; page * 200 < form.entry_count; page++) {
        const entries = await fetchJson(`action=entries&form_id=${form.id}&page=${page}`)
        all.push(...entries)
        process.stdout.write(`\r  Fetched ${all.length} / ${form.entry_count}`)
      }
      writeFileSync(`scripts/gf-dump/form-${form.id}-entries.json`, JSON.stringify(all, null, 2))

      const rows = all.map((entry) => {
        const entryData = labelize(entry, form)
        return {
          gf_entry_id: parseInt(entry.id, 10),
          gf_form_id: form.id,
          form_title: form.title,
          entry_data: entryData,
          file_urls: extractFileUrls(entryData),
          submitted_at: entry.date_created || null,
        }
      })

      if (DRY_RUN) {
        console.log(`\n  DRY RUN — would upsert ${rows.length} rows. Sample:`)
        console.log(JSON.stringify(rows[0], null, 2).slice(0, 1500))
        continue
      }

      let upserted = 0
      for (let i = 0; i < rows.length; i += 200) {
        const batch = rows.slice(i, i + 200)
        const { error } = await supabase
          .from('legacy_gf_entries')
          .upsert(batch, { onConflict: 'gf_form_id,gf_entry_id' })
        if (error) throw new Error(`upsert form ${form.id}: ${error.message}`)
        upserted += batch.length
        process.stdout.write(`\r  Upserted ${upserted} / ${rows.length}   `)
      }
      console.log()
    }
  } finally {
    console.log(`\nDeleting temp endpoint ${REMOTE_NAME}...`)
    await sftp.delete(REMOTE_PATH).catch((e) => {
      console.error(`  COULD NOT DELETE ${REMOTE_PATH}: ${e.message} — delete it manually!`)
    })
    await sftp.end()
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

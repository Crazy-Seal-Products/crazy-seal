/**
 * Delta-sync Gravity Forms uploads from the live WordPress server to S3.
 *
 * The bulk migration copied wp-content/uploads/gravity_forms/ to
 * s3://crazy-seal-media/gravity-forms/ months ago, but the WP site is still
 * live and collecting entries. Run this before launch (and again at cutover)
 * to copy any files that landed on the server since — only missing or
 * size-changed files are uploaded, so it is safe to re-run.
 *
 * Usage (local):
 *   source .env.local   (needs AWS_* and S3_BUCKET_NAME)
 *   export WP_SFTP_USER=crazy-seal-984152 WP_SFTP_PASS=...
 *   node scripts/sync-gf-media.mjs [--dry-run] [--since 2026-07-01]
 *
 * Slow home internet? Run it from AWS CloudShell instead — the transfer goes
 * WP server -> AWS -> S3 without touching your connection, and no AWS keys
 * are needed (CloudShell is already authenticated):
 *   mkdir sync && cd sync && npm init -y && npm i ssh2-sftp-client @aws-sdk/client-s3
 *   (upload this file via CloudShell's Actions > Upload file)
 *   export WP_SFTP_USER=... WP_SFTP_PASS=...
 *   node sync-gf-media.mjs
 *
 * Options:
 *   --dry-run          List what would be uploaded without uploading.
 *   --since <date>     Only consider server files modified on/after this date
 *                      (much faster than a full listing comparison).
 *   --remote-dir       Override the WP directory (default: gravity_forms).
 *   --s3-prefix        Override the S3 prefix (default: gravity-forms).
 */
import { PassThrough } from 'stream'
import SftpClient from 'ssh2-sftp-client'
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const arg = (name) => {
  const idx = args.indexOf(`--${name}`)
  return idx >= 0 ? args[idx + 1] : null
}

const DRY_RUN = flag('dry-run')
const SINCE = arg('since') ? new Date(arg('since')).getTime() : null
const REMOTE_BASE = `/wptbox/wp-content/uploads/${arg('remote-dir') || 'gravity_forms'}`
const S3_PREFIX = `${arg('s3-prefix') || 'gravity-forms'}/`

const SFTP_CONFIG = {
  host: process.env.WP_SFTP_HOST || 'fs-bonde.easywp.com',
  port: Number(process.env.WP_SFTP_PORT || 22),
  username: process.env.WP_SFTP_USER,
  password: process.env.WP_SFTP_PASS,
}
const BUCKET = process.env.S3_BUCKET_NAME || 'crazy-seal-media'

if (!SFTP_CONFIG.username || !SFTP_CONFIG.password) {
  console.error('Set WP_SFTP_USER and WP_SFTP_PASS (EasyWP dashboard > SFTP Access)')
  process.exit(1)
}
// AWS credentials come from the SDK default chain: env vars locally
// (source .env.local), or the ambient role when run in CloudShell/EC2.
if (!process.env.AWS_ACCESS_KEY_ID) {
  console.log('No AWS_ACCESS_KEY_ID env var — relying on the AWS SDK default credential chain (fine in CloudShell/EC2).')
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // SFTP streams emit variable-size chunks; S3 requires >=8 KB chunks when
  // streaming, so let the SDK buffer the input (error suggests this exact fix)
  requestStreamBufferSize: 65_536,
})

const CONTENT_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', heic: 'image/heic', bmp: 'image/bmp', svg: 'image/svg+xml',
  pdf: 'application/pdf', mp4: 'video/mp4', mov: 'video/quicktime',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}
const contentType = (name) =>
  CONTENT_TYPES[name.split('.').pop()?.toLowerCase()] || 'application/octet-stream'

// Skip WP-internal noise
const SKIP_FILES = /^(index\.(html|php)|\.htaccess)$/i
// Never publish GF entry exports (PII) or temp dirs to the public CDN
const SKIP_DIRS = /^(export|tmp)$/i

async function listS3Keys() {
  const keys = new Map() // key -> size
  let token
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: S3_PREFIX,
      ContinuationToken: token,
    }))
    for (const obj of res.Contents || []) keys.set(obj.Key, obj.Size)
    token = res.NextContinuationToken
  } while (token)
  return keys
}

async function walkSftp(sftp, dir, out) {
  let entries
  try {
    entries = await sftp.list(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    const path = `${dir}/${entry.name}`
    if (entry.type === 'd') {
      if (SKIP_DIRS.test(entry.name)) continue
      await walkSftp(sftp, path, out)
    } else if (entry.type === '-' && !SKIP_FILES.test(entry.name)) {
      if (SINCE && entry.modifyTime < SINCE) continue
      out.push({ path, size: entry.size, modifyTime: entry.modifyTime })
    }
  }
}

async function main() {
  console.log(`Bucket: s3://${BUCKET}/${S3_PREFIX}`)
  console.log(`Server: ${SFTP_CONFIG.host}:${REMOTE_BASE}`)
  if (SINCE) console.log(`Only files modified since ${new Date(SINCE).toISOString().slice(0, 10)}`)
  if (DRY_RUN) console.log('DRY RUN — nothing will be uploaded')

  console.log('\nListing existing S3 objects...')
  const s3Keys = await listS3Keys()
  console.log(`  ${s3Keys.size.toLocaleString()} objects already in S3`)

  console.log('Walking server directory (this can take a few minutes)...')
  const sftp = new SftpClient()
  await sftp.connect(SFTP_CONFIG)
  const serverFiles = []
  await walkSftp(sftp, REMOTE_BASE, serverFiles)
  console.log(`  ${serverFiles.length.toLocaleString()} files on server${SINCE ? ' (after --since filter)' : ''}`)

  const missing = serverFiles.filter((f) => {
    const key = S3_PREFIX + f.path.slice(REMOTE_BASE.length + 1)
    const existing = s3Keys.get(key)
    return existing === undefined || existing !== f.size
  })

  console.log(`\n${missing.length.toLocaleString()} files need uploading`)
  if (!missing.length) {
    await sftp.end()
    console.log('Nothing to do — S3 is up to date.')
    return
  }

  let uploaded = 0
  let failed = 0
  const totalBytes = missing.reduce((sum, f) => sum + f.size, 0)
  console.log(`Total size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB\n`)

  for (const file of missing) {
    const key = S3_PREFIX + file.path.slice(REMOTE_BASE.length + 1)
    if (DRY_RUN) {
      console.log(`  would upload ${key} (${(file.size / 1024).toFixed(0)} KB)`)
      uploaded++
      continue
    }
    // Stream SFTP -> S3 so large files never sit fully in memory
    // (matters in AWS CloudShell, which has ~2 GB RAM). Long runs hit
    // transient resets AND dropped SFTP sessions, so retry each file and
    // re-establish the connection between attempts if it died.
    let lastError = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const pass = new PassThrough()
        const download = sftp.get(file.path, pass)
        const upload = s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: pass,
          ContentLength: file.size,
          ContentType: contentType(file.path),
        }))
        await Promise.all([download, upload])
        lastError = null
        break
      } catch (err) {
        lastError = err
        await new Promise((r) => setTimeout(r, 2000))
        try {
          await sftp.stat(REMOTE_BASE) // probe the session
        } catch {
          console.error(`\n  SFTP session lost — reconnecting...`)
          await sftp.end().catch(() => {})
          await sftp.connect(SFTP_CONFIG).catch((e) => console.error(`  reconnect failed: ${e.message}`))
        }
      }
    }
    if (lastError) {
      failed++
      console.error(`\n  FAILED ${key}: ${lastError.message}`)
    } else {
      uploaded++
      process.stdout.write(`\r  Uploaded ${uploaded} / ${missing.length}`)
    }
  }

  await sftp.end()
  console.log(`\n\nDone: ${uploaded} ${DRY_RUN ? 'would be ' : ''}uploaded, ${failed} failed`)
  if (!DRY_RUN && uploaded > 0) {
    console.log(`Files are served at https://media.crazyseal.com/${S3_PREFIX}...`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

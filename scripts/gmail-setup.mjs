#!/usr/bin/env node
/**
 * Gmail OAuth setup helper for info@crazyseal.com sending.
 *
 * Usage:
 *   node scripts/gmail-setup.mjs auth              Run the OAuth flow, print GMAIL_REFRESH_TOKEN
 *   node scripts/gmail-setup.mjs test <email>      Send a test email using creds in .env.local
 *
 * Prereqs in .env.local: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET
 * (Desktop-app OAuth client from console.cloud.google.com with the Gmail API enabled.)
 */

import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { resolve } from 'node:path'

const PORT = 53682
const REDIRECT = `http://localhost:${PORT}/callback`
const SCOPE = 'https://mail.google.com/'

const envPath = resolve(import.meta.dirname, '..', '.env.local')
const env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

function requireEnv(...names) {
  const missing = names.filter((n) => !env[n])
  if (missing.length) {
    console.error(`Missing in .env.local: ${missing.join(', ')}`)
    process.exit(1)
  }
}

async function auth() {
  requireEnv('GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET')

  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: env.GMAIL_CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    login_hint: 'info@crazyseal.com',
  })

  console.log('Open this URL in your browser and sign in as info@crazyseal.com:\n')
  console.log(url)
  console.log('\nWaiting for the callback on ' + REDIRECT + ' ...')

  const code = await new Promise((resolvePromise, reject) => {
    const server = createServer((req, res) => {
      const u = new URL(req.url, `http://localhost:${PORT}`)
      if (u.pathname !== '/callback') { res.writeHead(404).end(); return }
      const c = u.searchParams.get('code')
      const err = u.searchParams.get('error')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(c
        ? '<h2>Done! You can close this tab and return to the terminal.</h2>'
        : `<h2>Error: ${err}</h2>`)
      server.close()
      c ? resolvePromise(c) : reject(new Error('OAuth error: ' + err))
    })
    server.listen(PORT)
    setTimeout(() => { server.close(); reject(new Error('Timed out after 10 minutes')) }, 600_000)
  })

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      redirect_uri: REDIRECT,
    }),
  })
  const data = await tokenRes.json()
  if (!data.refresh_token) {
    console.error('Token exchange failed:', JSON.stringify(data))
    process.exit(1)
  }
  console.log('\nSuccess! Add this to .env.local (and Vercel):\n')
  console.log(`GMAIL_REFRESH_TOKEN=${data.refresh_token}`)
}

async function test(to) {
  requireEnv('GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN')
  if (!to) { console.error('Usage: node scripts/gmail-setup.mjs test <email>'); process.exit(1) }

  const { default: nodemailer } = await import('nodemailer')
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'info@crazyseal.com',
      clientId: env.GMAIL_CLIENT_ID,
      clientSecret: env.GMAIL_CLIENT_SECRET,
      refreshToken: env.GMAIL_REFRESH_TOKEN,
    },
  })
  const result = await transport.sendMail({
    from: 'CRAZY SEAL <info@crazyseal.com>',
    to,
    subject: 'Crazy Seal Gmail integration test',
    html: '<p>This is a test email from the crazy-seal website Gmail integration. Safe to delete.</p>',
  })
  console.log('Test email sent:', result.messageId)
}

const [cmd, arg] = process.argv.slice(2)
if (cmd === 'auth') await auth()
else if (cmd === 'test') await test(arg)
else {
  console.log('Usage:\n  node scripts/gmail-setup.mjs auth\n  node scripts/gmail-setup.mjs test <email>')
  process.exit(1)
}

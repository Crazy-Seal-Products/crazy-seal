#!/usr/bin/env node
// System Map: a local-only page for developers. Never deployed.
//
//   npm run map              open it (http://127.0.0.1:<port>)
//   npm run map -- --no-open start the server without opening a browser
//
// It listens on 127.0.0.1 only, serves the viewer/ folder plus two read-only JSON
// endpoints built from the map data and docs/statecharts, and reloads the page when
// those files change. No dependencies beyond Node 20+.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { HERE, loadConfig, loadAll, watchedPaths } from './lib/load.mjs'

const config = loadConfig()
const HOST = '127.0.0.1'
const VIEWER = path.join(HERE, 'viewer')
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
}
const clients = new Set()
let port = Number(process.env.SYSTEM_MAP_PORT || config.port || 4400)

function send(res, status, type, body) {
  res.writeHead(status, {
    'content-type': type,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
  })
  res.end(body)
}

const server = http.createServer((req, res) => {
  const host = (req.headers.host || '').replace(/:\d+$/, '')
  if (host !== '127.0.0.1' && host !== 'localhost') return send(res, 403, 'text/plain', 'Local only')
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'text/plain', 'Read only')
  const url = new URL(req.url, 'http://127.0.0.1')

  if (url.pathname === '/api/all') return send(res, 200, TYPES['.json'], JSON.stringify(loadAll(config)))

  if (url.pathname === '/api/events') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' })
    res.write('retry: 1500\n\n')
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }

  let file
  try {
    file = path.resolve(VIEWER, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1)))
  } catch {
    return send(res, 400, 'text/plain', 'Bad path')
  }
  if (!file.startsWith(VIEWER + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile())
    return send(res, 404, 'text/plain', 'Not found')
  send(res, 200, TYPES[path.extname(file)] || 'application/octet-stream', fs.readFileSync(file))
})

let pending = null
let kinds = new Set()
function changed(kind) {
  kinds.add(kind)
  clearTimeout(pending)
  pending = setTimeout(() => {
    const msg = kinds.has('reload') ? 'reload' : 'data'
    kinds = new Set()
    for (const c of clients) c.write(`data: ${msg}\n\n`)
  }, 150)
}
for (const w of watchedPaths(config)) {
  try {
    fs.watch(w.path, { recursive: fs.statSync(w.path).isDirectory() }, () => changed(w.kind))
  } catch {}
}
setInterval(() => {
  for (const c of clients) c.write(': ping\n\n')
}, 25000).unref()

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && port < (config.port || 4400) + 10) {
    port++
    server.listen(port, HOST)
  } else {
    console.error(err.message)
    process.exit(1)
  }
})

server.listen(port, HOST, () => {
  const url = `http://${HOST}:${port}`
  console.log(`\n  ${config.name} System Map: ${url}\n  Local only. Ctrl+C to stop.\n`)
  if (process.argv.includes('--no-open')) return
  const [cmd, args] =
    process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]]
  spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref()
})

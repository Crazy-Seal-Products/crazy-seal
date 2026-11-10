// Shared helpers for the bake-off scripts.

import { existsSync, readFileSync } from 'node:fs'

export const HERE = new URL('./', import.meta.url)
const REPO_ROOT = new URL('../../', import.meta.url)

export function argValue(flag) {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : undefined
}

export const hasFlag = (flag) => process.argv.includes(flag)

export function readJson(name) {
  return JSON.parse(readFileSync(new URL(name, HERE), 'utf8'))
}

export function readJsonl(url) {
  return readFileSync(url, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line))
}

// API keys live in the repo root .env.local, never in this folder or in chat.
export function loadEnv() {
  const file = new URL('.env.local', REPO_ROOT)
  if (existsSync(file)) process.loadEnvFile(file)
}

export function requireKeys(names) {
  const missing = names.filter((name) => !process.env[name])
  if (missing.length) {
    console.error(`Missing ${missing.join(', ')}. Add them to the repo root .env.local, then rerun.`)
    process.exit(1)
  }
}

// The whole knowledge base as one reference block, page by page.
export function fullReference(kb) {
  return kb.pages.map((p) => `## ${p.title} (${p.url})\n${p.text}`).join('\n\n')
}

// ---------- retrieval: BM25 over the KB chunks ----------

const STOP = new Set('a an and are as at be by can do does for from has have how i if in is it its my of on or our so that the this to was we what when where which who why will with you your'.split(' '))

const tokenize = (text) => text.toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => !STOP.has(t)) ?? []

export function buildIndex(chunks) {
  const docs = chunks.map((c) => tokenize(`${c.title} ${c.text}`))
  const df = new Map()
  for (const terms of docs) for (const t of new Set(terms)) df.set(t, (df.get(t) ?? 0) + 1)
  const avgLen = docs.reduce((sum, d) => sum + d.length, 0) / docs.length
  return { chunks, docs, df, avgLen }
}

export function retrieve(index, query, k) {
  const { chunks, docs, df, avgLen } = index
  const n = docs.length
  const terms = [...new Set(tokenize(query))]
  const scored = docs.map((doc, i) => {
    const tf = new Map()
    for (const t of doc) tf.set(t, (tf.get(t) ?? 0) + 1)
    let score = 0
    for (const t of terms) {
      const f = tf.get(t)
      if (!f) continue
      const idf = Math.log(1 + (n - df.get(t) + 0.5) / (df.get(t) + 0.5))
      score += (idf * f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (doc.length / avgLen)))
    }
    return { i, score }
  })
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => chunks[s.i])
}

// ---------- cost ----------

export function costUsd(price, usage) {
  if (!price || !usage) return null
  const uncached = Math.max(0, (usage.inputTokens ?? 0) - (usage.cachedTokens ?? 0))
  return (
    (uncached * price.input + (usage.cachedTokens ?? 0) * price.cached + (usage.outputTokens ?? 0) * price.output) /
    1_000_000
  )
}

export const percentile = (values, p) => {
  const v = values.filter((x) => typeof x === 'number').sort((a, b) => a - b)
  if (!v.length) return null
  return v[Math.min(v.length - 1, Math.floor((p / 100) * v.length))]
}

// Resolve hook for the quote-requests replay, registered after ../loader.mjs so it runs first: gives
// the quote route a next/server whose after() queues its work on globalThis.__cs.after (Next.js's
// own after() only works inside a real request). The fake re-exports the rest of next/server.
import { pathToFileURL } from 'node:url'

let fake = ''
export function initialize(data) {
  fake = pathToFileURL(data.fake).href
}

export async function resolve(specifier, context, next) {
  const fromRoute = Boolean(context.parentURL) && new URL(context.parentURL).pathname.endsWith('/api/contractors/quote/route.ts')
  if (specifier === 'next/server' && fromRoute) return { url: fake, shortCircuit: true }
  return next(specifier, context)
}

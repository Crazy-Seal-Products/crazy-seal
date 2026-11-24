// Where Pro Hub sign-in, Forgot password and the set-password page may send
// someone afterwards (`?next=`). Only contractor portal pages on this site:
// a path that starts with /portal/, never the admin, never another host.
// Plain module: used by the Pro Hub pages (client) and API routes (server).

const SAFE = /^\/portal\/[A-Za-z0-9\-._~/?=&%]*$/

/** The contractor portal's sign-in (the Pro Hub's, then the portal). Same as PORTAL_SIGN_IN in ./guard, for client code. */
export const CONTRACTOR_SIGN_IN = '/pro/login/?next=/portal/'

/** The `next` path if it's a safe contractor portal page, else null. */
export function safePortalNext(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const path = value.trim()
  if (!SAFE.test(path)) return null
  if (path.includes('//') || path.includes('..') || path.includes('\\')) return null
  if (path.startsWith('/portal/admin')) return null
  return path
}

/** Where to go once signed in: the safe `next` page if one was given, else the portal (the Pro Hub now lives there). */
export function pageAfterSignIn(next: unknown): string {
  return safePortalNext(next) ?? '/portal/'
}

/** `?next=…` for a link that carries the next page along, or ''. */
export function nextQuery(next: string | null): string {
  return next ? `?next=${encodeURIComponent(next)}` : ''
}

import { register } from 'node:module'
import path from 'node:path'

// Runs the repo's own src with its installed packages, for the View as replays. The real
// src/lib/pro/view-as.ts runs here; the database, live Shopify, the admin sign-in and the
// browser's cookies are fakes.

const src = path.resolve(import.meta.dirname, '../../../../src')
const fakes = path.join(import.meta.dirname, 'fakes.mjs')
const viewAsFakes = path.join(import.meta.dirname, 'fakes-view-as.mjs')
register('./loader-view-as.mjs', import.meta.url, {
  data: {
    src,
    swaps: {
      [path.join(src, 'lib/supabase/admin.ts')]: fakes,
      [path.join(src, 'lib/shopify/admin.ts')]: fakes,
      [path.join(src, 'lib/portal/admin/auth.ts')]: viewAsFakes,
    },
    bare: { 'next/headers': viewAsFakes },
  },
})

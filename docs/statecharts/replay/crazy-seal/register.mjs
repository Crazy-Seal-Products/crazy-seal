import { register } from 'node:module'
import path from 'node:path'

// Runs the repo's own src with its installed packages.

const src = path.resolve(import.meta.dirname, '../../../../src')
const fakes = path.join(import.meta.dirname, 'fakes.mjs')
register('../loader.mjs', import.meta.url, {
  data: {
    src,
    swaps: {
      [path.join(src, 'lib/supabase/admin.ts')]: fakes,
      [path.join(src, 'lib/shopify/admin.ts')]: fakes,
      [path.join(src, 'lib/email/gmail.ts')]: fakes,
      [path.join(src, 'lib/pro/view-as.ts')]: fakes,
    },
  },
})

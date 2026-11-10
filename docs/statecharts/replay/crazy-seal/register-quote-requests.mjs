import { register } from 'node:module'
import path from 'node:path'

// Runs the repo's own src with its installed packages, with the database and Gmail faked, and the
// quote route's after() queued for the test (quote-requests.hooks.mjs).

const src = path.resolve(import.meta.dirname, '../../../../src')
register('../loader.mjs', import.meta.url, {
  data: {
    src,
    swaps: {
      [path.join(src, 'lib/supabase/admin.ts')]: path.join(import.meta.dirname, 'fakes.mjs'),
      [path.join(src, 'lib/email/gmail.ts')]: path.join(import.meta.dirname, 'fakes-quote-requests.mjs'),
    },
  },
})
register('./quote-requests.hooks.mjs', import.meta.url, { data: { fake: path.join(import.meta.dirname, 'fakes-quote-next.mjs') } })

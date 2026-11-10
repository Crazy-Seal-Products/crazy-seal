import { register } from 'node:module'
import path from 'node:path'

// Like register.mjs, for the contractor-records replay: runs the repo's own src with its installed
// packages, with the database client and the admin check swapped for contractor-records.fakes.mjs,
// and contractor-records.hooks.mjs swapping the bare modules the import script and admin actions load.

const src = path.resolve(import.meta.dirname, '../../../../src')
const fakes = path.join(import.meta.dirname, 'contractor-records.fakes.mjs')
register('../loader.mjs', import.meta.url, {
  data: {
    src,
    swaps: {
      [path.join(src, 'lib/supabase/admin.ts')]: fakes,
      [path.join(src, 'lib/portal/admin/auth.ts')]: fakes,
    },
  },
})
register('./contractor-records.hooks.mjs', import.meta.url, { data: { fakes } })

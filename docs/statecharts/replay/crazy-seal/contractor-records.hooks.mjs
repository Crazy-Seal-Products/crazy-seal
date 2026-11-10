// Resolve hook for the contractor-records replay, registered after ../loader.mjs so it runs first:
// swaps the bare modules the real code loads for contractor-records.fakes.mjs. The node: built-ins
// are swapped only for scripts/import-contractors.mjs, which uses them to install its Excel reader.
import { pathToFileURL } from 'node:url'

let fakes = ''
export function initialize(data) {
  fakes = pathToFileURL(data.fakes).href
}

const EVERYWHERE = new Set(['@supabase/supabase-js', 'next/cache'])
const IN_THE_IMPORT = new Set(['node:child_process', 'node:fs', 'node:module'])

export async function resolve(specifier, context, next) {
  const fromImport = Boolean(context.parentURL) && new URL(context.parentURL).pathname.endsWith('/scripts/import-contractors.mjs')
  if (EVERYWHERE.has(specifier) || (fromImport && IN_THE_IMPORT.has(specifier))) return { url: fakes, shortCircuit: true }
  return next(specifier, context)
}

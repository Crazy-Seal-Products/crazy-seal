// The shared replay loader (../loader.mjs), plus one swap it can't make: the bare specifier
// "next/headers", whose cookies() only works inside a Next.js request. Data as for ../loader.mjs,
// plus { bare: { specifier: fakeAbsolutePath } }.
import { pathToFileURL } from 'node:url'
import { initialize as initializeShared, resolve as resolveShared } from '../loader.mjs'

let bare = {}
export function initialize(data) {
  bare = data.bare || {}
  initializeShared(data)
}

export async function resolve(specifier, context, next) {
  if (bare[specifier]) return { url: pathToFileURL(bare[specifier]).href, shortCircuit: true }
  return resolveShared(specifier, context, next)
}

// Fakes for the View as replays. State lives on globalThis.__vs:
//   jar       Map of cookie name -> value: the one browser in the model
//   admin     who is signed in to the Crazy Seal Admin there ({ email, name, role, via }) or null
//   sections  the admin sections their role can open

// next/headers
export async function cookies() {
  const jar = globalThis.__vs.jar
  return {
    get: (name) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name, value, options) => (options?.maxAge === 0 ? jar.delete(name) : jar.set(name, value)),
    delete: (name) => jar.delete(name),
  }
}

export async function headers() {
  return new Headers()
}

// src/lib/portal/admin/auth.ts
export async function getPortalAdmin() {
  return globalThis.__vs.admin
}

export async function adminCan(section) {
  return Boolean(globalThis.__vs.admin) && globalThis.__vs.sections.includes(section)
}

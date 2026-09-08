'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  hasAuthHash,
  hasAuthSearch,
  isPublicAdminAuthPath,
  resetPasswordPath,
} from '@/lib/auth/recovery'

/**
 * Supabase recovery/invite emails default to the Site URL (the public
 * homepage). Tokens arrive in the hash or ?code= and would otherwise
 * sit unused on the marketing site. Forward them to the admin reset page.
 */
export function AuthRedirectCatcher() {
  const pathname = usePathname()

  useEffect(() => {
    const redirectIfNeeded = () => {
      if (!pathname || isPublicAdminAuthPath(pathname)) return

      const { hash, search } = window.location
      if (!hasAuthHash(hash) && !hasAuthSearch(search, pathname)) return

      window.location.replace(resetPasswordPath(search, hash))
    }

    redirectIfNeeded()
    window.addEventListener('hashchange', redirectIfNeeded)
    return () => window.removeEventListener('hashchange', redirectIfNeeded)
  }, [pathname])

  return null
}

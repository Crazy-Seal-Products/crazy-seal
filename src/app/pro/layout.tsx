import type { Metadata } from 'next'
import { PRO_HUB_NAME } from '@/lib/pro/config'

/**
 * /pro is only sign-in now (login, sign-up, forgot and reset password); the
 * rest of Pro Hub became the contractor portal at /portal, and its old pages
 * redirect there.
 */
export const metadata: Metadata = {
  title: {
    default: PRO_HUB_NAME,
    template: `%s | ${PRO_HUB_NAME}`,
  },
  robots: { index: false, follow: false },
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return children
}

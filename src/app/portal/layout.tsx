import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Pro Portal', template: '%s | Crazy Seal Pro Portal' },
  robots: { index: false, follow: false },
}

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return children
}

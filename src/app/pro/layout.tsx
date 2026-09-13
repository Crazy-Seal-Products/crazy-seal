import type { Metadata } from 'next'
import { PRO_HUB_NAME } from '@/lib/pro/config'
import { ProHubShell } from '@/components/pro-hub/ProHubShell'

export const metadata: Metadata = {
  title: {
    default: PRO_HUB_NAME,
    template: `%s | ${PRO_HUB_NAME}`,
  },
  robots: { index: false, follow: false },
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <ProHubShell>{children}</ProHubShell>
}

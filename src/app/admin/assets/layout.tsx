import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Site Assets',
  description: 'Manage site media assets (images, videos, audio, etc.)',
}

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

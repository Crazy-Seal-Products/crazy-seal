import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RV Roofing',
  description: 'Seal your own RV roof with the Crazy Seal DIY Roofing System.',
}

export default function RvRoofsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

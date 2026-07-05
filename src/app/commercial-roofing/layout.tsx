import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commercial Roofing',
  description: 'Commercial roofing systems for facilities.',
}

export default function CommercialRoofingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Residential',
  description:
    'Permanently seal flat residential roofs, sunrooms, porches, and storage buildings with the DIY Crazy Seal Roofing System — backed by a 50 year warranty.',
}

export default function ResidentialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

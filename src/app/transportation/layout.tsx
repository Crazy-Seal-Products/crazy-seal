import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transportation',
  description:
    'Permanently seal tractor trailers, box trucks, delivery vehicles, and fleets with the Crazy Seal Roofing System — backed by a 50 year warranty.',
}

export default function TransportationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Facilities',
  description:
    'Facilities resources for the Crazy Seal Roofing System — digital presentation, brochure, magazine feature, and full video explainer for facility owners and operators.',
}

export default function FacilitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

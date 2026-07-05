import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crazy Seal System',
  description:
    "Crazy Seal is a revolutionary new DIY roofing system designed to permanently seal flat roofing applications like RV's, Travel Trailers, Mobile Homes, and more.",
}

export default function CrazySealSystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

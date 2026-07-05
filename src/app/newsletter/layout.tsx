import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter Signup - RV Armor',
  description: 'Subscribe to the RV Armor newsletter for tips, installation stories, and exclusive offers.',
}

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

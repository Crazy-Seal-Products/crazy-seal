import type { Metadata } from 'next'
import { EnhancifyWidget } from '@/components/EnhancifyWidget'

export const metadata: Metadata = {
  title: 'Financing Options - RV Armor',
  description: 'Explore financing options for your RV Armor installation. Make permanent roof protection affordable.',
}

export default function FinancingPage() {
  return <EnhancifyWidget />
}

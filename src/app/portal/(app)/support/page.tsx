import type { Metadata } from 'next'
import { requireAccount } from '@/lib/contractor/guard'
import { SupportView } from '@/components/contractor/support/SupportView'

export const metadata: Metadata = { title: 'Support' }

/** Requests to the Crazy Seal team and the support agent (what Pro Hub's Support tab had). */
export default async function SupportPage() {
  await requireAccount()
  return <SupportView />
}

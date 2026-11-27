import { permanentRedirect } from 'next/navigation'

/**
 * Pro Hub support moved into the contractor portal (/portal/support/), which replaced Pro Hub.
 * Old links and emails land on the same place there, keeping ?ticket=.
 */
export default async function OldProHubPage({ searchParams }: { searchParams: Promise<{ ticket?: string }> }) {
  const { ticket } = await searchParams
  permanentRedirect(ticket ? `/portal/support/?ticket=${encodeURIComponent(ticket)}` : '/portal/support/')
}

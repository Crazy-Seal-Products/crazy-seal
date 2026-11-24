import { permanentRedirect } from 'next/navigation'

/**
 * Pro Hub warranty filing moved into the contractor portal (/portal/warranties/new/), which replaced Pro Hub.
 * Old links and emails land on the same place there, keeping ?order=.
 */
export default async function OldProHubPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams
  permanentRedirect(order ? `/portal/warranties/new/?order=${encodeURIComponent(order)}` : '/portal/warranties/new/')
}

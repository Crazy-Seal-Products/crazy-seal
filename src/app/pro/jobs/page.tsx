import { permanentRedirect } from 'next/navigation'

/** Pro Hub jobs (warranty registrations, claims and transfers) moved into the contractor portal (/portal/warranties/), which replaced Pro Hub. Old links and emails land there. */
export default function OldProHubPage() {
  permanentRedirect('/portal/warranties/')
}

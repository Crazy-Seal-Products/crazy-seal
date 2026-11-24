import { permanentRedirect } from 'next/navigation'

/** Pro Hub perks moved into the contractor portal (/portal/rewards/), which replaced Pro Hub. Old links and emails land there. */
export default function OldProHubPage() {
  permanentRedirect('/portal/rewards/')
}

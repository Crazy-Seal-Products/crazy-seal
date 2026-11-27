import { permanentRedirect } from 'next/navigation'

/** Pro Hub home moved into the contractor portal (/portal/), which replaced Pro Hub. Old links and emails land there. */
export default function OldProHubPage() {
  permanentRedirect('/portal/')
}

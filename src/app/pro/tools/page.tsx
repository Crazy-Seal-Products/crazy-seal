import { permanentRedirect } from 'next/navigation'

/** Pro Hub tools moved into the contractor portal (/portal/resources/), which replaced Pro Hub. Old links and emails land there. */
export default function OldProHubPage() {
  permanentRedirect('/portal/resources/')
}

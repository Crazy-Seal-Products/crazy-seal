import { permanentRedirect } from 'next/navigation'

/** Pro Hub orders moved into the contractor portal (/portal/orders/), which replaced Pro Hub. Old links and emails land there. */
export default function OldProHubPage() {
  permanentRedirect('/portal/orders/')
}

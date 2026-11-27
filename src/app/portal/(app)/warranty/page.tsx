import { permanentRedirect } from 'next/navigation'

/** Old demo portal address; the contractor portal moved this to /portal/warranties/ */
export default function OldAddress() {
  permanentRedirect('/portal/warranties/')
}

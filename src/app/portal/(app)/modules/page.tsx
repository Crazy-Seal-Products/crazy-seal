import { permanentRedirect } from 'next/navigation'

/** Old demo portal address; the contractor portal moved this to /portal/training/ */
export default function OldAddress() {
  permanentRedirect('/portal/training/')
}

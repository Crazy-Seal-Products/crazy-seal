import { permanentRedirect } from 'next/navigation'

/** Old demo portal address; the contractor portal moved this to /portal/brand/ */
export default function OldAddress() {
  permanentRedirect('/portal/brand/')
}

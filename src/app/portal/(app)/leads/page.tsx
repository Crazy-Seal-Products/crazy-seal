import { permanentRedirect } from 'next/navigation'

/** Old demo portal address; the contractor portal moved this to /portal/projects/ */
export default function OldAddress() {
  permanentRedirect('/portal/projects/')
}

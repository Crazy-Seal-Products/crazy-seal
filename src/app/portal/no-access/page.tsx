import { permanentRedirect } from 'next/navigation'

/**
 * Every Pro Hub account has a portal now (a personal one until it joins a
 * contractor's team), so there's no "no access" page; old links go home.
 */
export default function NoAccessPage() {
  permanentRedirect('/portal/')
}

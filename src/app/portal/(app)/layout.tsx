import { redirect } from 'next/navigation'
import { portalSignIn } from '@/lib/contractor/guard'
import { importWebsiteLeads } from '@/lib/contractor/leads'
import { navFor, navForPersonal } from '@/lib/contractor/nav'
import { can, ROLE_INFO } from '@/lib/contractor/roles'
import { getViewerState } from '@/lib/contractor/viewer'
import { cookies } from 'next/headers'
import { PORTAL_INTRO_COOKIE, PORTAL_THEME_COOKIE, portalThemeFor } from '@/lib/contractor/theme'
import { PortalFrame } from '@/components/contractor/PortalFrame'

export const dynamic = 'force-dynamic'

/**
 * The contractor portal, which replaced Pro Hub: every Pro Hub account signs
 * in here. On a contractor's team it shows that company with the navigation
 * the member's role allows (src/lib/contractor/roles.ts); an account on no
 * team gets the personal portal (orders, warranties, rewards, support,
 * training). Signed-out visitors go to sign in.
 */
export default async function ContractorPortalLayout({ children }: { children: React.ReactNode }) {
  const state = await getViewerState()
  if (state.status === 'signed_out') redirect(await portalSignIn())
  const jar = await cookies()
  // The look each person picked on Account (Crazy Seal by default, or charcoal).
  const theme = portalThemeFor(jar.get(PORTAL_THEME_COOKIE)?.value)
  // The branded intro plays once per browser session for each portal opened (a sign-in, or a View as).
  const playedFor = jar.get(PORTAL_INTRO_COOKIE)?.value
  const introFor = (key: string) => ({ introKey: key, playIntro: playedFor !== key })

  if (state.status === 'personal') {
    const { account } = state
    const intro = introFor(`${account.proUserId}${account.viewAs ? ':view' : ''}`)
    return (
      <PortalFrame
        nav={navForPersonal()}
        playIntro={intro.playIntro}
        viewer={{
          name: account.name,
          firstName: account.firstName,
          roleLabel: 'Pro account',
          contractorName: account.user.business_name?.trim() || account.name,
          contractorId: null,
          slug: null,
          since: account.user.created_at ? `Pro account since ${new Date(account.user.created_at).getFullYear()}` : 'Pro account',
          theme,
          readOnly: account.readOnly,
          viewAs: account.viewAs ? { adminName: account.viewAs.adminName } : null,
          introKey: intro.introKey,
        }}
      >
        {children}
      </PortalFrame>
    )
  }

  const { viewer } = state
  // Quote requests from the contractor's Crazy Seal page become customers and projects.
  if (!viewer.readOnly && can(viewer.role, 'projects.view')) await importWebsiteLeads(viewer.contractor.id)

  const intro = introFor(`${viewer.contractor.id}:${viewer.proUserId}${viewer.viewAs ? ':view' : ''}`)
  return (
    <PortalFrame
      nav={navFor(viewer.role)}
      playIntro={intro.playIntro}
      viewer={{
        name: viewer.name,
        firstName: viewer.firstName,
        roleLabel: ROLE_INFO[viewer.role].label,
        contractorName: viewer.contractorName,
        contractorId: viewer.contractor.id,
        slug: viewer.contractor.is_listed ? viewer.contractor.slug : null,
        since: `Crazy Seal contractor since ${new Date(viewer.contractor.created_at).getFullYear()}`,
        theme,
        readOnly: viewer.readOnly,
        viewAs: viewer.viewAs ? { adminName: viewer.viewAs.adminName } : null,
        introKey: intro.introKey,
      }}
    >
      {children}
    </PortalFrame>
  )
}

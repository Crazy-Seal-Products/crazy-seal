import { CONTRACTOR_ROLES, ROLE_INFO } from '@/lib/contractor/roles'

/** What each role can do in the portal (src/lib/contractor/roles.ts). */
export function RoleLegend() {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      {CONTRACTOR_ROLES.map((role) => (
        <div key={role} className="rounded-2xl bg-white/[0.04] p-3.5 ring-1 ring-white/[0.07]">
          <dt className="text-sm font-bold text-white">{ROLE_INFO[role].label}</dt>
          <dd className="mt-1 text-xs leading-relaxed text-blue-100/60">{ROLE_INFO[role].summary}</dd>
        </div>
      ))}
    </dl>
  )
}

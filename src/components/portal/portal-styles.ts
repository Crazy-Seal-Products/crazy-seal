// Portal class strings (Thermo's partner-portal buttons and fields, colored by
// the portal theme's --p-* variables) and formatters, in a plain module so server components
// can import them too (an export from the 'use client' ui.tsx reaches a server
// component as a client reference, not the string). ui.tsx re-exports them.

export const portalInput =
  'w-full rounded-xl border border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/20 px-3.5 py-2.5 text-sm text-[var(--p-ink,#F5F1EC)] placeholder:text-white/30 outline-none transition focus:border-[var(--p-primary)] focus:ring-4 focus:ring-[color-mix(in_oklab,var(--p-primary)_20%,transparent)]'

export const portalButton =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] px-4 py-2.5 text-sm font-semibold text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0'

export const portalGhostButton =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--p-line,rgba(255,255,255,0.12))] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-[var(--p-ink,#F5F1EC)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] disabled:opacity-50'

export function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

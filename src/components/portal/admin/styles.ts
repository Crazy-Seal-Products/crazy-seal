import { twMerge } from 'tailwind-merge'

/**
 * Class strings for admin form controls and buttons. Plain module (not a
 * client component) so server pages can use these values too.
 */

export const inputCls =
  'h-8 w-full rounded-md border border-adm-line bg-adm-input px-2.5 text-[12.5px] text-adm-ink placeholder:text-adm-faint focus:border-adm-blue-bright focus:outline-none focus:ring-2 focus:ring-adm-blue-bright/25'

export const textareaCls = twMerge(inputCls, 'h-auto min-h-[4.5rem] py-1.5 leading-snug')

export const labelCls = 'block space-y-1 text-[11px] font-medium text-adm-muted'

export const BUTTON = {
  default:
    'inline-flex h-8 items-center gap-1.5 rounded-md border border-adm-line bg-adm-input px-2.5 text-[12px] font-medium text-adm-text transition hover:border-adm-blue-bright/60 hover:text-adm-ink disabled:opacity-60',
  gold: 'inline-flex h-8 items-center gap-1.5 rounded-md bg-gradient-to-b from-adm-gold-bright to-adm-gold px-3 text-[12px] font-semibold text-adm-gold-ink shadow-[0_4px_14px_-6px_rgb(245_197_66/0.8)] transition hover:brightness-105 disabled:opacity-60',
  danger:
    'inline-flex h-8 items-center gap-1.5 rounded-md border border-red-400/40 px-2.5 text-[12px] font-medium text-adm-red transition hover:bg-red-500/10 disabled:opacity-60',
} as const

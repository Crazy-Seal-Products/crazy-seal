import { twMerge } from 'tailwind-merge'
import { initialsOf } from '@/lib/contractors/theme'

/**
 * A contractor's logo on a white tile (so any logo reads on any brand color),
 * or their initials in the accent color when they have no logo yet. Reads the
 * --cb-* variables, so it must sit inside an element with brandStyle().
 */
export function BrandMark({ name, logoUrl, size = 'md' }: { name: string; logoUrl: string | null; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-9 min-w-9 rounded-lg' : 'h-11 min-w-11 rounded-xl sm:h-12 sm:min-w-12'
  if (logoUrl) {
    return (
      <span className={twMerge('grid max-w-[9rem] shrink-0 place-items-center bg-white px-1.5 shadow-md', box)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={`${name} logo`} className="max-h-[80%] w-auto max-w-full object-contain" />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        'grid shrink-0 place-items-center bg-(--cb-accent) font-[family-name:var(--font-display)] font-black text-(--cb-on-accent) shadow-md',
        box,
        size === 'sm' ? 'text-xs' : 'text-sm',
      )}
    >
      {initialsOf(name) || 'CS'}
    </span>
  )
}

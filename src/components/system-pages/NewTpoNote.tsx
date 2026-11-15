import { Info } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { NEW_TPO_NOTE, NEW_TPO_WHY } from '@/lib/warranty/new-tpo'

/**
 * One quiet line about new TPO, with the reason tucked behind "Why?".
 * Meant to sit under a section's content without competing with it.
 */
export function NewTpoNote({ id, className }: { id?: string; className?: string }) {
  return (
    <details id={id} className={twMerge('group mx-auto max-w-2xl scroll-mt-24 text-center text-sm text-gray-500', className)}>
      <summary className="cursor-pointer list-none text-balance [&::-webkit-details-marker]:hidden">
        <Info className="mr-1.5 inline h-4 w-4 -translate-y-px align-middle text-gray-400" />
        {NEW_TPO_NOTE}{' '}
        <span className="whitespace-nowrap font-semibold text-accent-dark underline decoration-accent/40 underline-offset-2 group-open:hidden">
          Why?
        </span>
      </summary>
      <p className="mt-2 leading-relaxed">{NEW_TPO_WHY}</p>
    </details>
  )
}

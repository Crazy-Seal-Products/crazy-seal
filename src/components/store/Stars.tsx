import { Star } from 'lucide-react'

/** Five filled stars in the brand highlight yellow. */
export function Stars({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} fill-[#F9EA1C] text-[#F9EA1C]`} />
      ))}
    </span>
  )
}

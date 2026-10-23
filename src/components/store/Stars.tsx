import { Star } from 'lucide-react'

/** Five filled stars in the brand highlight yellow. */
export function Stars({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${className} fill-highlight text-highlight drop-shadow-[0_1px_1px_rgb(199_186_22/0.45)]`}
        />
      ))}
    </span>
  )
}

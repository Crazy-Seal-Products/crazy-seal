import { Eye } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { BUTTON } from './styles'

/**
 * Opens the Pro Hub as this dealer in a new tab, read-only (see
 * lib/pro/view-as). A plain form post, so it needs no client JavaScript.
 */
export function ViewAsButton({ proUserId, name, className }: { proUserId: string; name: string; className?: string }) {
  return (
    <form action="/api/admin/view-as/" method="post" target="_blank" className="inline-flex">
      <input type="hidden" name="pro_user_id" value={proUserId} />
      <button
        type="submit"
        title={`Open the Pro Hub as ${name} (read-only)`}
        className={twMerge(BUTTON.default, 'h-7 whitespace-nowrap px-2 text-[11.5px]', className)}
      >
        <Eye className="h-3.5 w-3.5" />
        View as
      </button>
    </form>
  )
}

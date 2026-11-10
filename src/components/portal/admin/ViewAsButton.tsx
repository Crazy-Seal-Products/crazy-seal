import { Eye } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { BUTTON } from './styles'

/**
 * Opens the Pro Hub as this dealer in a new tab, read-only (see
 * lib/pro/view-as). Give a Pro Hub account, or a roster dealer's Shopify
 * customer, which opens the base view when they have no account. A plain
 * form post, so it needs no client JavaScript.
 */
export function ViewAsButton({
  proUserId,
  customerId,
  name,
  className,
}: {
  proUserId?: string | null
  customerId?: string | null
  name: string
  className?: string
}) {
  const title = proUserId ? `Open the Pro Hub as ${name} (read-only)` : `Open the base Pro Hub ${name} would see after signing up (read-only)`
  return (
    <form action="/api/admin/view-as/" method="post" target="_blank" className="inline-flex">
      {proUserId ? (
        <input type="hidden" name="pro_user_id" value={proUserId} />
      ) : (
        <input type="hidden" name="customer_id" value={customerId ?? ''} />
      )}
      <button type="submit" title={title} className={twMerge(BUTTON.default, 'h-7 whitespace-nowrap px-2 text-[11.5px]', className)}>
        <Eye className="h-3.5 w-3.5" />
        View as
      </button>
    </form>
  )
}

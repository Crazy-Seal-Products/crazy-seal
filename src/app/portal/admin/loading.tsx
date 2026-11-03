/**
 * Shown inside the admin shell the moment a link is clicked, while the next
 * page's data loads, so navigation never looks stuck.
 */

const bar = 'rounded bg-adm-ink/[0.07]'

export default function AdminLoading() {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse">
      <div className="mb-3 space-y-2">
        <div className={`h-6 w-44 ${bar}`} />
        <div className={`h-3.5 w-full max-w-md ${bar}`} />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="adm-glass space-y-2 rounded-[10px] px-3 py-2.5">
            <div className={`h-2.5 w-20 ${bar}`} />
            <div className={`h-5 w-16 ${bar}`} />
          </div>
        ))}
      </div>
      <div className="adm-glass mt-2 overflow-hidden rounded-[10px]">
        <div className="h-9 border-b border-adm-line" />
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-adm-line-soft px-3 py-2.5 last:border-0">
            <div className={`h-3 w-24 ${bar}`} />
            <div className={`h-3 flex-1 ${bar}`} />
            <div className={`hidden h-3 w-20 sm:block ${bar}`} />
            <div className={`h-3 w-14 ${bar}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

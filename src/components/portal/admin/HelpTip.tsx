import { CircleHelp } from 'lucide-react'

/**
 * A page title with a green "?" after it: hovering or focusing the "?" shows
 * what the page is for, so the description doesn't take up room on the page.
 * On phones the note lines up under the whole title so it stays on screen.
 * CSS only, so server pages can use it.
 */
export function HelpTip({ id, title, children }: { id: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex items-center gap-1.5">
      {title}
      <span className="group inline-flex sm:relative">
        <button
          type="button"
          aria-label="What this page is for"
          aria-describedby={id}
          className="grid h-6 w-6 place-items-center rounded-full text-adm-green transition hover:bg-adm-green/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-adm-green/50"
        >
          <CircleHelp className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
        <span
          role="tooltip"
          id={id}
          className="invisible absolute left-0 top-full z-30 mt-1.5 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-adm-line bg-adm-bg p-3 text-[12px] font-normal leading-relaxed tracking-normal text-adm-text opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
        >
          {children}
        </span>
      </span>
    </span>
  )
}

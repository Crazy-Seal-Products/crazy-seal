'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ArrowUpRight, Download, FileText, FolderOpen, Image as ImageIcon, Search, Video, type LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { PORTAL_MODULES, type LessonResource } from '@/lib/portal/modules'
import { Panel, ViewHeader, portalInput } from '../ui'

const TYPE_META: Record<LessonResource['type'], { label: string; icon: LucideIcon }> = {
  pdf: { label: 'PDFs', icon: FileText },
  page: { label: 'Pages', icon: ArrowUpRight },
  video: { label: 'Video', icon: Video },
  images: { label: 'Images', icon: ImageIcon },
  folder: { label: 'Folders', icon: FolderOpen },
}

interface LibraryItem extends LessonResource {
  module: string
  moduleNumber: number
}

// Every resource referenced across the program, de-duplicated by URL.
const LIBRARY: LibraryItem[] = (() => {
  const seen = new Set<string>()
  const out: LibraryItem[] = []
  for (const m of PORTAL_MODULES) {
    for (const l of m.lessons) {
      for (const r of l.resources ?? []) {
        if (seen.has(r.href)) continue
        seen.add(r.href)
        out.push({ ...r, module: m.eyebrow, moduleNumber: m.number })
      }
    }
  }
  return out
})()

export function ResourcesView() {
  const [type, setType] = useState<LessonResource['type'] | 'all'>('all')
  const [query, setQuery] = useState('')
  const types = useMemo(() => Array.from(new Set(LIBRARY.map((r) => r.type))), [])
  const items = LIBRARY.filter(
    (r) => (type === 'all' || r.type === type) && (query === '' || `${r.label} ${r.module}`.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <>
      <ViewHeader
        kicker="Resource Library"
        title="Every asset, one place"
        description="Brochures, presentation pages, video packages and install guides from across the program."
      />
      <Panel>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <LayoutGroup id="resource-filter">
            <div className="flex flex-wrap gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
              {(['all', ...types] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={twMerge('relative rounded-full px-3 py-1.5 text-xs font-semibold transition-colors', type === t ? 'text-primary' : 'text-blue-100/70 hover:text-white')}
                >
                  {type === t && <motion.span layoutId="res-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span className="relative">{t === 'all' ? 'All' : TYPE_META[t].label}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
          <label className="relative block md:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assets" className={twMerge(portalInput, 'rounded-full pl-10')} />
          </label>
        </div>

        <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {items.map((r) => {
              const Icon = TYPE_META[r.type].icon
              const external = r.href.startsWith('http')
              return (
                <motion.a
                  layout
                  key={r.href}
                  href={r.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="group flex items-center gap-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.07] hover:ring-accent/30"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-secondary-light/40 to-white/[0.04] ring-1 ring-white/10">
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{r.label}</span>
                    <span className="block text-[11px] text-blue-100/50">
                      Module {r.moduleNumber} · {r.module}
                    </span>
                  </span>
                  {r.type === 'pdf' ? (
                    <Download className="h-4 w-4 shrink-0 text-blue-100/40 transition group-hover:text-accent-light" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-blue-100/40 transition group-hover:rotate-45 group-hover:text-accent-light" />
                  )}
                </motion.a>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </Panel>
    </>
  )
}

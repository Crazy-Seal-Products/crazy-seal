'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Phone, Search, Sparkles } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { LEAD_STAGES, demoLeads, type LeadStage } from '@/lib/portal/demo-data'
import { usePortal } from '../PortalContext'
import { Panel, StatusPill, ViewHeader, money, portalInput } from '../ui'

export function LeadsView() {
  const { account } = usePortal()
  const leads = demoLeads(account.id)
  const [stage, setStage] = useState<LeadStage | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (stage === 'all' || l.stage === stage) &&
          (query === '' || `${l.name} ${l.city} ${l.application}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [leads, stage, query]
  )
  const pipelineValue = leads.filter((l) => l.stage !== 'won').reduce((n, l) => n + l.value, 0)
  const referrals = leads.filter((l) => l.source === 'Crazy Seal referral').length

  return (
    <>
      <ViewHeader
        kicker="Leads"
        title="Your pipeline"
        description="Referrals from Crazy Seal land here automatically, alongside leads from your own marketing."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Panel className="!p-4" as="div">
          <p className="text-xs text-blue-100/55">Open pipeline</p>
          <p className="mt-1 text-2xl font-extrabold">{money(pipelineValue)}</p>
        </Panel>
        <Panel className="!p-4" as="div" delay={0.05}>
          <p className="text-xs text-blue-100/55">Crazy Seal referrals</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold">
            {referrals}
            <Sparkles className="h-4 w-4 text-highlight" />
          </p>
        </Panel>
        <Panel className="!p-4" as="div" delay={0.1}>
          <p className="text-xs text-blue-100/55">Won this month</p>
          <p className="mt-1 text-2xl font-extrabold">{leads.filter((l) => l.stage === 'won').length}</p>
        </Panel>
      </div>

      <Panel delay={0.15}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <LayoutGroup id="lead-filter">
            <div className="flex flex-wrap gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
              {[{ id: 'all' as const, label: 'All' }, ...LEAD_STAGES].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  className={twMerge(
                    'relative rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    stage === s.id ? 'text-primary' : 'text-blue-100/70 hover:text-white'
                  )}
                >
                  {stage === s.id && (
                    <motion.span layoutId="lead-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                  )}
                  <span className="relative">
                    {s.label}
                    <span className="ml-1 opacity-60">
                      {s.id === 'all' ? leads.length : leads.filter((l) => l.stage === s.id).length}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </LayoutGroup>
          <label className="relative block md:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads"
              className={twMerge(portalInput, 'rounded-full pl-10')}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs text-blue-100/50">
                <th className="pb-3 font-medium">Lead</th>
                <th className="pb-3 font-medium">Application</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 text-right font-medium">Sq ft</th>
                <th className="pb-3 text-right font-medium">Est. value</th>
                <th className="pb-3 pl-4 font-medium">Stage</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((l, i) => (
                  <motion.tr
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                    exit={{ opacity: 0 }}
                    className="border-t border-white/[0.06] transition hover:bg-white/[0.03]"
                  >
                    <td className="py-3 pr-3">
                      <p className="font-semibold">{l.name}</p>
                      <p className="text-[11px] text-blue-100/50">
                        <span className="font-mono">{l.id}</span> · {l.city} · {l.received}
                      </p>
                    </td>
                    <td className="py-3 pr-3 text-blue-100/80">{l.application}</td>
                    <td className="py-3 pr-3">
                      <span className={twMerge('text-xs', l.source === 'Crazy Seal referral' ? 'font-semibold text-highlight' : 'text-blue-100/70')}>
                        {l.source}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums">{l.sqft.toLocaleString()}</td>
                    <td className="py-3 pr-3 text-right font-semibold tabular-nums">{money(l.value)}</td>
                    <td className="py-3 pl-4 pr-3">
                      <StatusPill status={l.stage} />
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-blue-100/70" title="Call (demo)">
                        <Phone className="h-3.5 w-3.5" />
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-blue-100/50">No leads match that filter.</p>}
        </div>
      </Panel>
    </>
  )
}

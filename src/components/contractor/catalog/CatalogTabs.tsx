'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, Table2 } from 'lucide-react'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Segmented } from '../Segmented'

export type CatalogTab = 'catalog' | 'prices'

/**
 * Catalog / Price list on one page. Both panels are rendered on the server;
 * switching is instant here, and the address keeps the tab (?tab=prices) for
 * a reload or a shared link.
 */
export function CatalogTabs({ initial, catalog, prices }: { initial: CatalogTab; catalog: React.ReactNode; prices: React.ReactNode }) {
  const [tab, setTab] = useState<CatalogTab>(initial)

  const pick = (next: CatalogTab) => {
    setTab(next)
    const url = new URL(window.location.href)
    if (next === 'prices') url.searchParams.set('tab', 'prices')
    else url.searchParams.delete('tab')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.04 }} className="mb-6">
        <Segmented
          id="catalog-tab"
          label="Catalog or price list"
          role="tablist"
          value={tab}
          onChange={pick}
          options={[
            { key: 'catalog', label: 'Catalog', icon: LayoutGrid },
            { key: 'prices', label: 'Price list', icon: Table2 },
          ]}
        />
      </motion.div>
      {/* Both stay mounted, so the catalog keeps its filters while the price list is open. */}
      {PANELS.map(({ key, label }) => (
        <motion.div
          key={key}
          role="tabpanel"
          aria-label={label}
          hidden={tab !== key}
          initial={false}
          animate={tab === key ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
        >
          {key === 'catalog' ? catalog : prices}
        </motion.div>
      ))}
    </>
  )
}

const PANELS: { key: CatalogTab; label: string }[] = [
  { key: 'catalog', label: 'Catalog' },
  { key: 'prices', label: 'Price list' },
]

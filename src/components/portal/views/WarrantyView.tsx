'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Camera, FileCheck, GraduationCap, Plus, ShieldCheck } from 'lucide-react'
import { demoWarranties } from '@/lib/portal/demo-data'
import { EASE_OUT_EXPO } from '@/components/motion'
import { usePortal } from '../PortalContext'
import { Panel, PanelTitle, StatusPill, ViewHeader, portalButton, portalGhostButton } from '../ui'

export function WarrantyView() {
  const { account } = usePortal()
  const items = demoWarranties(account.id)
  const pending = items.filter((w) => w.status === 'pending_photos').length

  return (
    <>
      <ViewHeader
        kicker="Warranties"
        title="50 year warranty registrations"
        description="Register every job the day it’s finished — your customer gets their certificate, you get the credit."
      >
        <Link href="/portal/modules/warranty/" className={portalGhostButton}>
          <GraduationCap className="h-4 w-4" />
          Module 6
        </Link>
        <Link href="/warranty/" className={portalButton}>
          <Plus className="h-4 w-4" />
          Register a warranty
        </Link>
      </ViewHeader>

      {pending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 rounded-2xl bg-highlight/10 px-4 py-3 text-sm ring-1 ring-highlight/30"
        >
          <Camera className="h-4 w-4 shrink-0 text-highlight" />
          {pending} registration{pending > 1 ? 's are' : ' is'} waiting on install photos.
        </motion.div>
      )}

      <Panel>
        <PanelTitle>Registered jobs</PanelTitle>
        {items.length === 0 ? (
          <div className="grid place-items-center py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06]">
              <ShieldCheck className="h-7 w-7 text-accent-light" />
            </span>
            <p className="mt-4 font-semibold">No registrations yet</p>
            <p className="mt-1 max-w-sm text-sm text-blue-100/55">Finish your first job, then register it here so your customer’s 50 year warranty is on file.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, ease: EASE_OUT_EXPO }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:border-white/20"
              >
                <div aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition group-hover:bg-accent/20" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark">
                    <FileCheck className="h-5 w-5" />
                  </span>
                  <StatusPill status={w.status} />
                </div>
                <p className="relative mt-3 font-semibold">{w.customer}</p>
                <p className="relative text-sm text-blue-100/60">{w.application}</p>
                <p className="relative mt-3 text-[11px] text-blue-100/45">
                  <span className="font-mono">{w.id}</span> · Installed {w.installed} · {w.sqft.toLocaleString()} sq ft
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </Panel>
    </>
  )
}

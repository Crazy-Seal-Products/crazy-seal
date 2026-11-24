'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, ChevronRight, Info, ShieldCheck } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { WarrantyPrefill } from '@/lib/contractor/warranties'
import { Panel, ViewHeader } from '@/components/portal/ui'
import { portalGhostButton } from '@/components/portal/portal-styles'
import { ClaimForm, RegisterWarrantyForm, type OrderChoice, type ProjectChoice } from './WarrantyForms'

/** Register a warranty or file a claim, with a switch between the two. */
export function NewWarrantyView({
  type,
  projectParam,
  orderParam,
  projectAlreadyRegistered,
  projects,
  orders,
  prefill,
  installer,
  readOnly,
}: {
  type: 'registration' | 'claim'
  projectParam: string | null
  /** The order it was opened for (from Orders), kept when switching forms. */
  orderParam: string | null
  projectAlreadyRegistered: boolean
  projects: ProjectChoice[]
  orders: OrderChoice[]
  prefill: WarrantyPrefill | null
  installer: { name: string; phone: string; email: string }
  readOnly: boolean
}) {
  const query = (t: 'registration' | 'claim') => {
    const params = new URLSearchParams()
    if (t === 'claim') params.set('type', 'claim')
    if (projectParam) params.set('project', projectParam)
    else if (orderParam) params.set('order', orderParam)
    const s = params.toString()
    return `/portal/warranties/new/${s ? `?${s}` : ''}`
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-[var(--p-muted)]">
        <Link href="/portal/warranties/" className="transition hover:text-[var(--p-ink)]">
          Warranties
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--p-ink)]">{type === 'claim' ? 'File a claim' : 'Register a warranty'}</span>
      </nav>
      <ViewHeader
        kicker={type === 'claim' ? 'Warranty claim' : '50 year warranty'}
        title={type === 'claim' ? 'File a warranty claim' : 'Register a 50 year warranty'}
        description={
          type === 'claim'
            ? 'Tell Crazy Seal what’s wrong with a roof you installed. Photos help the warranty team answer faster.'
            : 'Register every finished roof: the owner gets their 50 year certificate by email.'
        }
      >
        <div className="relative flex rounded-full border border-[var(--p-line)] bg-black/20 p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)]">
          {(['registration', 'claim'] as const).map((t) => {
            const Icon = t === 'claim' ? AlertTriangle : ShieldCheck
            return (
              <Link
                key={t}
                href={query(t)}
                aria-current={type === t ? 'page' : undefined}
                className={twMerge(
                  'relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors',
                  type === t ? 'text-[var(--p-primary-ink,#fff)]' : 'text-[var(--p-muted)] hover:text-[var(--p-ink)]',
                )}
              >
                {type === t && (
                  <motion.span
                    layoutId="warranty-type-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-[var(--p-primary)] bg-[image:var(--p-primary-grad)] shadow-[var(--p-glow)]"
                  />
                )}
                <Icon className="relative h-3.5 w-3.5" />
                <span className="relative">{t === 'claim' ? 'Claim' : 'Registration'}</span>
              </Link>
            )
          })}
        </div>
      </ViewHeader>

      {projectAlreadyRegistered ? (
        <Panel>
          <p className="flex items-start gap-2.5 text-sm text-[var(--p-muted)]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent)]" />
            This project already has its warranty registration (each project has one).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={query('claim')} className={portalGhostButton}>
              File a claim for it instead
            </Link>
            <Link href="/portal/warranties/" className={portalGhostButton}>
              See all warranties
            </Link>
          </div>
        </Panel>
      ) : type === 'claim' ? (
        <ClaimForm key={projectParam ?? orderParam ?? 'none'} projects={projects} orders={orders} prefill={prefill} readOnly={readOnly} />
      ) : (
        <RegisterWarrantyForm key={projectParam ?? orderParam ?? 'none'} projects={projects} orders={orders} prefill={prefill} installer={installer} readOnly={readOnly} />
      )}
    </>
  )
}

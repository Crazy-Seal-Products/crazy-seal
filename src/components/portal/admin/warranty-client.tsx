'use client'

import React, { useActionState, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Images, Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { WarrantyReviewLightbox, type ReviewRegistration } from '@/components/admin/WarrantyReviewLightbox'
import { IMAGE_TYPES, REVIEWS_FOR_MARKETING } from '@/lib/warranty/classification'
import { classifyRegistration, updateRegistrationPhotos } from '@/lib/portal/admin/warranty-actions'
import { SaveState, type ActionResult } from './controls'
import { BUTTON, inputCls, labelCls, textareaCls } from './styles'

/**
 * Opens the site admin's full-screen photo review (keyboard shortcuts 1–6
 * classify, favorites, before/after) on the registrations listed on the
 * page, saving through the new admin's server actions.
 */
export function ReviewLauncher({
  registrations,
  startId,
  children,
  className,
}: {
  registrations: ReviewRegistration[]
  startId?: string
  children: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  if (!registrations.length) return null
  const raise = (r: ActionResult) => {
    if (!r.ok) {
      window.alert(r.error)
      throw new Error(r.error)
    }
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={twMerge(BUTTON.gold, className)}>
        <Images className="h-3.5 w-3.5" />
        {children}
      </button>
      {/* Portal to <body>: glass panels use backdrop-filter, which would trap a fixed overlay inside them. */}
      {open &&
        createPortal(
        <WarrantyReviewLightbox
          registrations={registrations}
          startId={startId ?? registrations[0].id}
          onClose={() => {
            setOpen(false)
            router.refresh()
          }}
          onSave={async (id, patch) => raise(await classifyRegistration(id, patch))}
          onUpdatePhotos={async (id, patch) => raise(await updateRegistrationPhotos(id, patch))}
        />,
          document.body,
        )}
    </>
  )
}

/** Classification controls on a registration's own page. */
export function ClassifyForm({
  id,
  initial,
  statuses,
}: {
  id: string
  initial: { image_type: string | null; reviews_for_marketing: string | null; status: string; lucid_link: string | null }
  statuses: readonly { key: string; label: string }[]
}) {
  const [v, setV] = useState(initial)
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (patch: Partial<typeof v>) => {
    setV((x) => ({ ...x, ...patch }))
    setSaved(false)
  }
  return (
    <form
      className="grid gap-2 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        start(async () => {
          const r = await classifyRegistration(id, v)
          if (r.ok) setSaved(true)
          else setError(r.error)
        })
      }}
    >
      <label className={labelCls}>
        <span>Image type</span>
        <select className={inputCls} value={v.image_type ?? ''} onChange={(e) => set({ image_type: e.target.value || null })}>
          <option value="">Not set</option>
          {IMAGE_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className={labelCls}>
        <span>Reviews for marketing</span>
        <select className={inputCls} value={v.reviews_for_marketing ?? ''} onChange={(e) => set({ reviews_for_marketing: e.target.value || null })}>
          <option value="">Not reviewed</option>
          {REVIEWS_FOR_MARKETING.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className={labelCls}>
        <span>Status</span>
        <select className={inputCls} value={v.status} onChange={(e) => set({ status: e.target.value })}>
          {statuses.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelCls}>
        <span>Lucid link (edited photos folder)</span>
        <input className={inputCls} type="url" placeholder="https://…" value={v.lucid_link ?? ''} onChange={(e) => set({ lucid_link: e.target.value || null })} />
      </label>
      <div className="flex items-center gap-2 pt-1">
        <button type="submit" disabled={pending} className={BUTTON.gold}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save review
        </button>
        <SaveState pending={false} saved={saved} error={error} />
      </div>
    </form>
  )
}

type FormAction = (prev: ActionResult | null, form: FormData) => Promise<ActionResult>

function Result({ state }: { state: ActionResult | null }) {
  if (!state) return null
  return <span className={twMerge('text-[11.5px]', state.ok ? 'text-adm-green' : 'text-adm-red')}>{state.ok ? state.message ?? 'Saved' : state.error}</span>
}

/** Install type and installer contact on a registration. */
export function InstallerForm({
  action,
  initial,
}: {
  action: FormAction
  initial: { install_type: string | null; installer_name: string | null; installer_phone: string | null; installer_email: string | null }
}) {
  const [state, formAction, pending] = useActionState(action, null)
  return (
    <form action={formAction} className="grid gap-2 p-3 sm:grid-cols-2">
      <label className={labelCls}>
        <span>Installed by</span>
        <select name="install_type" defaultValue={initial.install_type ?? ''} className={inputCls}>
          <option value="">Not given</option>
          <option value="diy">Customer (DIY)</option>
          <option value="contractor">Dealer / contractor</option>
        </select>
      </label>
      <label className={labelCls}>
        <span>Installer name</span>
        <input name="installer_name" defaultValue={initial.installer_name ?? ''} className={inputCls} />
      </label>
      <label className={labelCls}>
        <span>Installer phone</span>
        <input name="installer_phone" type="tel" defaultValue={initial.installer_phone ?? ''} className={inputCls} />
      </label>
      <label className={labelCls}>
        <span>Installer email</span>
        <input name="installer_email" type="email" defaultValue={initial.installer_email ?? ''} className={inputCls} />
      </label>
      <div className="flex items-center gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className={BUTTON.default}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save installer
        </button>
        <Result state={state} />
      </div>
    </form>
  )
}

/** Status plus a notes field, for claims and transfers. */
export function StatusNotesForm({
  action,
  status,
  statuses,
  notes,
  notesName,
  notesLabel,
}: {
  action: FormAction
  status: string
  statuses: readonly { key: string; label: string }[]
  notes: string | null
  notesName: string
  notesLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, null)
  return (
    <form action={formAction} className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-end">
      <label className={labelCls}>
        <span>Status</span>
        <select name="status" defaultValue={status} className={inputCls}>
          {statuses.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelCls}>
        <span>{notesLabel}</span>
        <textarea name={notesName} defaultValue={notes ?? ''} rows={2} className={twMerge(textareaCls, 'min-h-8')} />
      </label>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className={BUTTON.default}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save
        </button>
        <Result state={state} />
      </div>
    </form>
  )
}

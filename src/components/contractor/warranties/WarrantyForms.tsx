'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ClipboardCheck, HardHat, House, Images, Info, Loader2, MessageSquareWarning, Send, ShieldCheck, Star, UserRound, type LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { PhotoUploadField, uploadPhotos } from '@/components/forms/PhotoUploadField'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, ProgressBar } from '@/components/portal/ui'
import { portalButton, portalGhostButton, portalInput } from '@/components/portal/portal-styles'
import type { WarrantyPrefill } from '@/lib/contractor/warranties'
import { ProjectPhotoPicker } from './ProjectPhotoPicker'

/**
 * The portal's warranty forms, as numbered glass panels with a live progress
 * rail: register the 50 year warranty for a job, or file a claim. Photos
 * upload straight to the media bucket as they're picked
 * (/api/upload/presign); the form posts to /api/portal/warranty/register or
 * /claim. Opened for a project, its gallery's before and after photos (claim
 * photos for a claim) come pre-picked (ProjectPhotoPicker), so nothing is
 * uploaded twice.
 */

export interface ProjectChoice {
  id: string
  name: string
  registered: boolean
}

export interface OrderChoice {
  name: string
  hasWarranty: boolean
}

const RV_LENGTHS = Array.from({ length: 38 }, (_, i) => `${i + 8}`)
const select = twMerge(portalInput, '[&>option]:text-gray-900')

/** The shared light photo picker, recolored for the portal's glass panels. */
const PHOTO_DARK = [
  '[&_label]:text-[var(--p-muted)]',
  '[&_.group]:rounded-xl [&_.group]:border-[var(--p-line)] [&_.group]:bg-none [&_.group]:bg-white/[0.03] [&_.group:hover]:border-[var(--p-primary)] [&_.group:hover]:bg-white/[0.05]',
  '[&_.group>div>span]:bg-white/[0.06] [&_.group>div>span]:text-[var(--p-accent)] [&_.group>div>span]:ring-white/10',
  '[&_.group_p]:text-[var(--p-muted)] [&_.group_p_span]:text-[var(--p-primary)]',
].join(' ')

interface StepDef {
  id: string
  title: string
  hint: string
  icon: LucideIcon
  /** Nothing in it is required: the rail shows it as optional. */
  optional?: boolean
}

const REGISTER_STEPS: StepDef[] = [
  { id: 'job', title: 'The job', hint: 'The project and the Crazy Seal order', icon: ClipboardCheck },
  { id: 'owner', title: 'The owner', hint: 'The certificate goes to them', icon: UserRound },
  { id: 'roof', title: 'The roof', hint: 'What was coated', icon: House },
  { id: 'installer', title: 'Installer', hint: 'Who did the work', icon: HardHat, optional: true },
  { id: 'photos', title: 'Photos', hint: 'Before and after', icon: Images },
  { id: 'review', title: 'Rating and notes', hint: 'How the job went', icon: Star },
  { id: 'confirm', title: 'Confirm', hint: 'Terms and photo use', icon: ShieldCheck },
]

const CLAIM_STEPS: StepDef[] = [
  { id: 'job', title: 'The job', hint: 'The project and order, if you know them', icon: ClipboardCheck, optional: true },
  { id: 'owner', title: 'The owner', hint: 'Crazy Seal emails them a confirmation', icon: UserRound },
  { id: 'problem', title: 'The problem', hint: 'What’s wrong, with photos', icon: MessageSquareWarning },
]

/** Which numbered fieldsets have every field valid, read from the form after each change. */
function useStepValidity() {
  const formRef = useRef<HTMLFormElement>(null)
  const [valid, setValid] = useState<Record<string, boolean>>({})
  const check = useCallback(() => {
    const form = formRef.current
    if (!form) return
    const next: Record<string, boolean> = {}
    form.querySelectorAll<HTMLFieldSetElement>('fieldset[data-step]').forEach((fs) => {
      const fields = Array.from(fs.elements) as Array<Partial<HTMLInputElement>>
      next[fs.dataset.step as string] = fields.every((el) => typeof el.checkValidity !== 'function' || el.checkValidity())
    })
    setValid((prev) => (Object.keys(next).every((k) => prev[k] === next[k]) && Object.keys(prev).length === Object.keys(next).length ? prev : next))
  }, [])
  // After React commits (fields can appear or go with a choice), read the form again.
  const schedule = useCallback(() => {
    requestAnimationFrame(check)
  }, [check])
  useEffect(() => {
    const id = requestAnimationFrame(check)
    return () => cancelAnimationFrame(id)
  }, [check])
  return { formRef, valid, schedule }
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={twMerge('block', className)}>
      <span className="mb-1.5 block text-xs font-medium text-[var(--p-muted)]">
        {label} {required && <span className="text-[var(--p-accent)]">*</span>}
      </span>
      {children}
    </label>
  )
}

const photoLabel = (text: string, required?: boolean) => (
  <span className="text-xs font-medium text-[var(--p-muted)]">
    {text} {required && <span className="text-[var(--p-accent)]">*</span>}
  </span>
)

function StepBubble({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={twMerge(
        'relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ring-1 transition-colors duration-300',
        done ? 'bg-[var(--p-primary)] bg-[image:var(--p-primary-grad)] text-white shadow-[var(--p-glow)] ring-white/20' : 'bg-white/[0.05] text-[var(--p-ink)] ring-white/15',
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span key="done" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }}>
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            {n}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

function StepPanel({ n, step, done, delay, children }: { n: number; step: StepDef; done: boolean; delay: number; children: React.ReactNode }) {
  const Icon = step.icon
  return (
    <div id={`step-${step.id}`} className="scroll-mt-24">
      <Panel delay={delay}>
        <fieldset data-step={step.id} className="min-w-0">
          <legend className="sr-only">{step.title}</legend>
          <div className="mb-5 flex items-center gap-3">
            <StepBubble n={n} done={done} />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-[var(--p-ink)] md:text-lg">{step.title}</h2>
              <p className="text-xs text-[var(--p-muted)]">{step.hint}</p>
            </div>
            {step.optional && <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--p-muted)] ring-1 ring-white/10">Optional</span>}
            <Icon className="hidden h-5 w-5 text-[var(--p-accent)] opacity-70 sm:block" />
          </div>
          {children}
        </fieldset>
      </Panel>
    </div>
  )
}

/** The progress rail beside the steps (xl), or a strip above them. */
function Rail({ steps, isDone, children }: { steps: StepDef[]; isDone: (id: string) => boolean; children?: React.ReactNode }) {
  const counted = steps.filter((s) => !s.optional)
  const doneCount = counted.filter((s) => isDone(s.id)).length
  const pct = counted.length ? Math.round((doneCount / counted.length) * 100) : 100
  return (
    <Panel delay={0.05} className="overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[var(--p-primary)] opacity-20 blur-3xl" />
      <div className="relative flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--p-muted)]">Progress</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-[var(--p-ink)]">{pct}%</p>
        </div>
        <p className="pb-1 text-xs text-[var(--p-muted)]">
          {doneCount} of {counted.length} steps
        </p>
      </div>
      <ProgressBar pct={pct} className="relative mt-3" delay={0} />
      <ol className="relative mt-5 hidden space-y-0.5 xl:block">
        {steps.map((s, i) => {
          const done = isDone(s.id)
          return (
            <li key={s.id}>
              <a href={`#step-${s.id}`} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.04]">
                <span
                  className={twMerge(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ring-1 transition-colors duration-300',
                    done ? 'bg-[var(--p-primary)] text-white shadow-[0_0_12px_-2px_var(--p-primary)] ring-white/20' : 'bg-white/[0.04] text-[var(--p-muted)] ring-white/10',
                  )}
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className={twMerge('min-w-0 flex-1 truncate text-sm', done ? 'text-[var(--p-ink)]' : 'text-[var(--p-muted)] group-hover:text-[var(--p-ink)]')}>{s.title}</span>
                {s.optional && <span className="text-[10px] uppercase tracking-wider text-[var(--p-muted)] opacity-70">optional</span>}
              </a>
            </li>
          )
        })}
      </ol>
      {children && <div className="relative mt-5 hidden xl:block">{children}</div>}
    </Panel>
  )
}

function Done({ title, body, certificateUrl, projectId }: { title: string; body: string; certificateUrl?: string | null; projectId?: string }) {
  return (
    <Panel className="overflow-hidden py-12 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-4 h-56 w-56 -translate-x-1/2 rounded-full bg-[var(--p-primary)] opacity-25 blur-3xl" />
      <motion.span
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
        className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--p-primary)] bg-[image:var(--p-primary-grad)] text-white shadow-[var(--p-glow)] ring-8 ring-[color-mix(in_oklab,var(--p-primary)_18%,transparent)]"
      >
        <Check className="h-10 w-10" strokeWidth={3} />
      </motion.span>
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: EASE_OUT_EXPO, duration: 0.6 }} className="relative mt-6 text-2xl font-extrabold text-[var(--p-ink)] md:text-3xl">
        {title}
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="relative mx-auto mt-2 max-w-md text-sm text-[var(--p-muted)]">
        {body}
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ease: EASE_OUT_EXPO, duration: 0.6 }} className="relative mt-7 flex flex-wrap justify-center gap-2">
        {certificateUrl && (
          <a href={certificateUrl} target="_blank" rel="noopener noreferrer" className={portalButton}>
            <ShieldCheck className="h-4 w-4" /> View certificate
          </a>
        )}
        {projectId && (
          <Link href={`/portal/projects/${projectId}/`} className={portalGhostButton}>
            Back to the project
          </Link>
        )}
        <Link href="/portal/warranties/" className={portalGhostButton}>
          All warranties
        </Link>
      </motion.div>
    </Panel>
  )
}

function OrderField({ orders, value, onChange, required }: { orders: OrderChoice[]; value: string; onChange: (v: string) => void; required?: boolean }) {
  const shown = orders.filter((o) => !o.hasWarranty || o.name === value)
  if (!orders.length) {
    return <input className={portalInput} value={value} onChange={(e) => onChange(e.target.value)} placeholder="#1234" required={required} maxLength={40} />
  }
  return (
    <select className={select} value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      <option value="">{required ? 'Choose an order' : 'No order / not sure'}</option>
      {value && !shown.some((o) => o.name === value) && <option value={value}>{value}</option>}
      {shown.map((o) => (
        <option key={o.name} value={o.name}>
          {o.name}
          {o.hasWarranty ? ' (has a warranty)' : ''}
        </option>
      ))}
    </select>
  )
}

function FormError({ error, readOnly }: { error: string | null; readOnly: boolean }) {
  return (
    <>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/30"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {readOnly && <p className="text-sm font-medium text-[var(--p-accent)]">You’re viewing as Crazy Seal staff: this form can’t be sent.</p>}
    </>
  )
}

export function RegisterWarrantyForm({
  projects,
  orders,
  prefill,
  installer,
  readOnly,
}: {
  projects: ProjectChoice[]
  orders: OrderChoice[]
  prefill: WarrantyPrefill | null
  installer: { name: string; phone: string; email: string }
  readOnly: boolean
}) {
  const router = useRouter()
  const [projectId, setProjectId] = useState(prefill?.projectId ?? '')
  const [orderNumber, setOrderNumber] = useState(prefill?.orderNumber ?? '')
  const [projectType, setProjectType] = useState<string>(prefill?.projectType ?? '')
  const [beforeFiles, setBeforeFiles] = useState<File[]>([])
  const [afterFiles, setAfterFiles] = useState<File[]>([])
  const [beforePicked, setBeforePicked] = useState<string[]>(() => prefill?.photos?.before.map((p) => p.url) ?? [])
  const [afterPicked, setAfterPicked] = useState<string[]>(() => prefill?.photos?.after.map((p) => p.url) ?? [])
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ certificateUrl: string | null } | null>(null)
  const { formRef, valid, schedule } = useStepValidity()

  if (done) {
    return (
      <Done
        title="Warranty registered"
        body="The owner gets a confirmation email with their 50 year warranty certificate."
        certificateUrl={done.certificateUrl}
        projectId={projectId || undefined}
      />
    )
  }

  // The project's gallery photos count while the form is still for that project.
  const fromProject = prefill?.projectId && projectId === prefill.projectId ? prefill.photos : undefined
  const beforeChosen = fromProject ? beforePicked : []
  const afterChosen = fromProject ? afterPicked : []
  const hasBefore = beforeFiles.length + beforeChosen.length > 0
  const hasAfter = afterFiles.length + afterChosen.length > 0
  const extra: Record<string, boolean> = { photos: hasBefore && hasAfter, review: rating > 0 }
  const isDone = (id: string) => Boolean(valid[id]) && (extra[id] ?? true)
  const disabled = readOnly || submitting || !orderNumber

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)
    if (!hasBefore || !hasAfter) return setError('Add at least one before photo and one after photo.')
    if (!rating) return setError('Rate this Crazy Seal job.')
    setSubmitting(true)
    try {
      const [beforeUploaded, afterUploaded] = await Promise.all([uploadPhotos(beforeFiles, 'warranty'), uploadPhotos(afterFiles, 'warranty')])
      if ((beforeFiles.length && !beforeUploaded.length) || (afterFiles.length && !afterUploaded.length)) {
        setError('Some photos didn’t upload. Check your connection and submit again; photos that already uploaded won’t upload twice.')
        return
      }
      const before = [...beforeChosen, ...beforeUploaded]
      const after = [...afterChosen, ...afterUploaded]
      const res = await fetch('/api/portal/warranty/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId || null,
          order_number: orderNumber,
          name: `${String(form.get('first_name') ?? '').trim()} ${String(form.get('last_name') ?? '').trim()}`.trim(),
          email: form.get('email'),
          phone: form.get('phone'),
          customer_details: form.get('customer_details'),
          project_type: projectType,
          rv_length: form.get('rv_length'),
          square_footage: form.get('square_footage'),
          installer_name: form.get('installer_name'),
          installer_phone: form.get('installer_phone'),
          installer_email: form.get('installer_email'),
          before_photo_urls: before,
          after_photo_urls: after,
          rating,
          experience_notes: form.get('experience_notes'),
          contractor_notes: form.get('contractor_notes'),
          warranty_consent: form.get('warranty_consent') === 'on',
          photo_display_consent: form.get('photo_display_consent') === 'on',
        }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string; certificate_url?: string } | null
      if (!res.ok) {
        setError(data?.error || 'Could not register the warranty. Try again.')
        return
      }
      setDone({ certificateUrl: data?.certificate_url ?? null })
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitButton = (
    <button type="submit" disabled={disabled} className={twMerge(portalButton, 'w-full py-3 text-[15px]')}>
      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {submitting ? 'Registering…' : 'Register this warranty'}
    </button>
  )
  const s = (id: string) => REGISTER_STEPS.find((x) => x.id === id) as StepDef
  const n = (id: string) => REGISTER_STEPS.findIndex((x) => x.id === id) + 1

  return (
    <form ref={formRef} onSubmit={submit} onChange={schedule} className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="grid min-w-0 gap-5">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="flex items-start gap-2.5 rounded-2xl bg-[color-mix(in_oklab,var(--p-accent)_8%,transparent)] px-4 py-3 text-sm text-[var(--p-muted)] ring-1 ring-[color-mix(in_oklab,var(--p-accent)_25%,transparent)]"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent)]" />
          <span>
            You’re filing for the <strong className="text-[var(--p-ink)]">RV or roof owner</strong>. The 50 year certificate goes to them.
          </span>
        </motion.p>

        <div className="xl:hidden">
          <Rail steps={REGISTER_STEPS} isDone={isDone} />
        </div>

        <StepPanel n={n('job')} step={s('job')} done={isDone('job')} delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project">
              <select className={select} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Not tied to a project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.registered}>
                    {p.name}
                    {p.registered ? ' (already registered)' : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Order number" required>
              <OrderField orders={orders} value={orderNumber} onChange={setOrderNumber} required />
            </Field>
          </div>
        </StepPanel>

        <StepPanel n={n('owner')} step={s('owner')} done={isDone('owner')} delay={0.08}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Owner’s first name" required>
              <input name="first_name" className={portalInput} required maxLength={60} defaultValue={prefill?.firstName} />
            </Field>
            <Field label="Owner’s last name" required>
              <input name="last_name" className={portalInput} required maxLength={60} defaultValue={prefill?.lastName} />
            </Field>
            <Field label="Owner’s email" required>
              <input name="email" type="email" className={portalInput} required maxLength={160} defaultValue={prefill?.email} />
            </Field>
            <Field label="Owner’s phone" required>
              <input name="phone" type="tel" className={portalInput} required maxLength={40} defaultValue={prefill?.phone} />
            </Field>
            <Field label="Customer details (business name, job notes)" className="sm:col-span-2">
              <input name="customer_details" className={portalInput} maxLength={500} />
            </Field>
          </div>
        </StepPanel>

        <StepPanel n={n('roof')} step={s('roof')} done={isDone('roof')} delay={0.11}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project type" required>
              <select className={select} value={projectType} onChange={(e) => setProjectType(e.target.value)} required>
                <option value="">Choose one</option>
                <option value="RV Roof">RV roof</option>
                <option value="Other">Other roof</option>
              </select>
            </Field>
            {projectType === 'RV Roof' && (
              <Field label="RV length (ft)" required>
                <select name="rv_length" className={select} required defaultValue="">
                  <option value="">Choose one</option>
                  {RV_LENGTHS.map((l) => (
                    <option key={l} value={l}>
                      {l} ft
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {projectType === 'Other' && (
              <Field label="Approximate square footage" required>
                <input name="square_footage" type="number" min={0} className={portalInput} required defaultValue={prefill?.squareFootage} />
              </Field>
            )}
          </div>
        </StepPanel>

        <StepPanel n={n('installer')} step={s('installer')} done={isDone('installer')} delay={0.14}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Installer name">
              <input name="installer_name" className={portalInput} maxLength={120} defaultValue={installer.name} />
            </Field>
            <Field label="Installer phone">
              <input name="installer_phone" type="tel" className={portalInput} maxLength={40} defaultValue={installer.phone} />
            </Field>
            <Field label="Installer email">
              <input name="installer_email" type="email" className={portalInput} maxLength={160} defaultValue={installer.email} />
            </Field>
          </div>
        </StepPanel>

        <StepPanel n={n('photos')} step={s('photos')} done={isDone('photos')} delay={0.17}>
          <div className={twMerge('grid gap-4 md:grid-cols-2', PHOTO_DARK)}>
            <div className="min-w-0 space-y-3">
              {fromProject && fromProject.before.length > 0 && (
                <ProjectPhotoPicker label={photoLabel('Before photos from the project', true)} photos={fromProject.before} selected={beforePicked} onChange={setBeforePicked} />
              )}
              <PhotoUploadField
                label={fromProject?.before.length ? photoLabel('Add more before photos') : photoLabel('Before photos', true)}
                hint="The roof before Crazy Seal"
                inputLabel="Upload before photos"
                folder="warranty"
                files={beforeFiles}
                onChange={setBeforeFiles}
              />
            </div>
            <div className="min-w-0 space-y-3">
              {fromProject && fromProject.after.length > 0 && (
                <ProjectPhotoPicker label={photoLabel('After photos from the project', true)} photos={fromProject.after} selected={afterPicked} onChange={setAfterPicked} />
              )}
              <PhotoUploadField
                label={fromProject?.after.length ? photoLabel('Add more after photos') : photoLabel('After photos', true)}
                hint="The finished roof"
                inputLabel="Upload after photos"
                folder="warranty"
                files={afterFiles}
                onChange={setAfterFiles}
              />
            </div>
          </div>
        </StepPanel>

        <StepPanel n={n('review')} step={s('review')} done={isDone('review')} delay={0.2}>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-[var(--p-muted)]">
              Rate this Crazy Seal job <span className="text-[var(--p-accent)]">*</span>
            </span>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((star) => {
                const lit = star <= (hover || rating)
                return (
                  <motion.button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} stars`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    whileHover={{ scale: 1.15, rotate: -6 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1"
                  >
                    <Star className={twMerge('h-8 w-8 transition-colors duration-200', lit ? 'fill-[var(--p-accent)] text-[var(--p-accent)] drop-shadow-[0_0_10px_rgba(249,234,28,0.45)]' : 'text-white/20')} />
                  </motion.button>
                )
              })}
              {rating > 0 && <span className="ml-2 text-sm font-semibold tabular-nums text-[var(--p-ink)]">{rating} / 5</span>}
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Notes about this job" required>
              <textarea name="experience_notes" rows={3} required maxLength={4000} className={portalInput} />
            </Field>
            <Field label="Contractor notes (for Crazy Seal)">
              <textarea name="contractor_notes" rows={3} maxLength={4000} className={portalInput} />
            </Field>
          </div>
        </StepPanel>

        <StepPanel n={n('confirm')} step={s('confirm')} done={isDone('confirm')} delay={0.23}>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white/[0.03] p-3.5 text-sm text-[var(--p-muted)] ring-1 ring-white/[0.06] transition hover:bg-white/[0.05]">
              <input type="checkbox" name="warranty_consent" required className="mt-0.5 h-5 w-5 shrink-0 rounded accent-[var(--p-primary)]" />
              <span>
                Installed per Crazy Seal guidelines, and the owner agrees to the warranty terms. <span className="text-[var(--p-accent)]">*</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white/[0.03] p-3.5 text-sm text-[var(--p-muted)] ring-1 ring-white/[0.06] transition hover:bg-white/[0.05]">
              <input type="checkbox" name="photo_display_consent" defaultChecked className="mt-0.5 h-5 w-5 shrink-0 rounded accent-[var(--p-primary)]" />
              <span>Crazy Seal may show these photos on its website and social media.</span>
            </label>
            <FormError error={error} readOnly={readOnly} />
            <div className="pt-1 sm:max-w-xs">{submitButton}</div>
          </div>
        </StepPanel>
      </div>

      <aside className="hidden xl:sticky xl:top-6 xl:block">
        <Rail steps={REGISTER_STEPS} isDone={isDone}>
          {submitButton}
          {!orderNumber && <p className="mt-2 text-center text-[11px] text-[var(--p-muted)]">Choose the order first.</p>}
        </Rail>
      </aside>
    </form>
  )
}

export function ClaimForm({
  projects,
  orders,
  prefill,
  readOnly,
}: {
  projects: ProjectChoice[]
  orders: OrderChoice[]
  prefill: WarrantyPrefill | null
  readOnly: boolean
}) {
  const router = useRouter()
  const [projectId, setProjectId] = useState(prefill?.projectId ?? '')
  const [orderNumber, setOrderNumber] = useState(prefill?.orderNumber ?? '')
  const [files, setFiles] = useState<File[]>([])
  const [claimPicked, setClaimPicked] = useState<string[]>(() => prefill?.photos?.claim.map((p) => p.url) ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const { formRef, valid, schedule } = useStepValidity()

  if (done) {
    return (
      <Done
        title="Claim filed"
        body="Crazy Seal’s warranty team will review it and get in touch. The owner gets a confirmation email."
        projectId={projectId || undefined}
      />
    )
  }

  // The job step has nothing required: it counts once a project or order is picked.
  const isDone = (id: string) => (id === 'job' ? Boolean(projectId || orderNumber) : Boolean(valid[id]))
  // Claim photos already in the project's gallery, while the form is still for that project.
  const fromProject = prefill?.projectId && projectId === prefill.projectId ? prefill.photos : undefined
  const claimChosen = fromProject ? claimPicked : []

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)
    setSubmitting(true)
    try {
      const uploaded = files.length ? await uploadPhotos(files, 'warranty') : []
      if (files.length && !uploaded.length) {
        setError('Some photos didn’t upload. Check your connection and submit again.')
        return
      }
      const photos = [...claimChosen, ...uploaded]
      const res = await fetch('/api/portal/warranty/claim/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId || null,
          order_number: orderNumber,
          name: `${String(form.get('first_name') ?? '').trim()} ${String(form.get('last_name') ?? '').trim()}`.trim(),
          email: form.get('email'),
          phone: form.get('phone'),
          failure_description: form.get('failure_description'),
          photo_urls: photos,
        }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        setError(data?.error || 'Could not file the claim. Try again.')
        return
      }
      setDone(true)
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitButton = (
    <button type="submit" disabled={readOnly || submitting} className={twMerge(portalButton, 'w-full py-3 text-[15px]')}>
      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {submitting ? 'Filing…' : 'File the claim'}
    </button>
  )

  return (
    <form ref={formRef} onSubmit={submit} onChange={schedule} className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="grid min-w-0 gap-5">
        <div className="xl:hidden">
          <Rail steps={CLAIM_STEPS} isDone={isDone} />
        </div>

        <StepPanel n={1} step={CLAIM_STEPS[0]} done={isDone('job')} delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project">
              <select className={select} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Not tied to a project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Order number">
              <OrderField orders={orders.map((o) => ({ ...o, hasWarranty: false }))} value={orderNumber} onChange={setOrderNumber} />
            </Field>
          </div>
        </StepPanel>

        <StepPanel n={2} step={CLAIM_STEPS[1]} done={isDone('owner')} delay={0.08}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Owner’s first name" required>
              <input name="first_name" className={portalInput} required maxLength={60} defaultValue={prefill?.firstName} />
            </Field>
            <Field label="Owner’s last name" required>
              <input name="last_name" className={portalInput} required maxLength={60} defaultValue={prefill?.lastName} />
            </Field>
            <Field label="Owner’s email" required>
              <input name="email" type="email" className={portalInput} required maxLength={160} defaultValue={prefill?.email} />
            </Field>
            <Field label="Owner’s phone">
              <input name="phone" type="tel" className={portalInput} maxLength={40} defaultValue={prefill?.phone} />
            </Field>
          </div>
        </StepPanel>

        <StepPanel n={3} step={CLAIM_STEPS[2]} done={isDone('problem')} delay={0.11}>
          <Field label="What’s wrong?" required>
            <textarea name="failure_description" rows={5} required maxLength={4000} className={portalInput} placeholder="Where on the roof, what you see, and when it started." />
          </Field>
          <div className={twMerge('mt-4 space-y-3', PHOTO_DARK)}>
            {fromProject && fromProject.claim.length > 0 && (
              <ProjectPhotoPicker label={photoLabel('Claim photos from the project')} photos={fromProject.claim} selected={claimPicked} onChange={setClaimPicked} />
            )}
            <PhotoUploadField
              label={photoLabel(fromProject?.claim.length ? 'Add more photos of the problem' : 'Photos of the problem')}
              hint="Close-ups and the whole roof"
              inputLabel="Upload claim photos"
              folder="warranty"
              files={files}
              onChange={setFiles}
            />
          </div>
        </StepPanel>

        <Panel delay={0.14}>
          <div className="space-y-3">
            <FormError error={error} readOnly={readOnly} />
            <div className="sm:max-w-xs">{submitButton}</div>
          </div>
        </Panel>
      </div>

      <aside className="hidden xl:sticky xl:top-6 xl:block">
        <Rail steps={CLAIM_STEPS} isDone={isDone}>
          {submitButton}
        </Rail>
      </aside>
    </form>
  )
}

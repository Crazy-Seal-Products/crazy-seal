'use client'

import { useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ChevronDown,
  Hammer,
  Headset,
  ImagePlus,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react'
import { type TurnstileInstance } from '@marsidev/react-turnstile'
import { Button, Input, LinkButton, Select, Textarea } from '@/lib/design-system'
import { FormTurnstile } from '@/components/forms/FormTurnstile'
import { FormError, SubmitButton, SuccessCheck, fieldClass } from '@/components/forms/form-ui'
import { FormModal } from '@/components/forms/FormModal'
import { GlowOrb, EASE_OUT_EXPO } from '@/components/motion'
import { uploadPhotos } from '@/components/forms/PhotoUploadField'
import { Stars } from '@/components/store/Stars'
import { CallRepLink, SpeakToRepButton } from '@/components/store/SpeakToRep'
import { useCart } from '@/contexts/CartContext'
import { useTracking } from '@/components/tracking'
import { trackMetaEvent, generateEventId } from '@/lib/tracking/meta-pixel'
import { reportLeadToGoogleAds } from '@/lib/tracking/google-ads'
import {
  KIT_COLORS,
  RV_LENGTH_BUCKETS,
  buildCustomKit,
  findCommercialKit,
  maxCoveredMeasure,
  recommendFlatRoofKit,
  recommendRvKit,
  sizeValues,
  type KitApplication,
  type KitBuilderCatalog,
  type KitColor,
  type KitInstallMethod,
  type KitRecommendation,
} from '@/lib/store/kit-builder'

const APPLICATION_LABELS: Record<KitApplication, string> = {
  rv: 'RV',
  commercial: 'Commercial Flat Roof',
  residential: 'Residential Flat Roof',
  transportation: 'Transportation',
}

const LEAD_SUBMITTED_KEY = 'cs_kit_lead_submitted'

function usd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const KIT_ASSURANCES = [
  { icon: PackageCheck, label: 'In-stock & ready to ship' },
  { icon: Truck, label: 'Free shipping over $500' },
  { icon: ShieldCheck, label: '50 year warranty' },
] as const

function KitAssurances() {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {KIT_ASSURANCES.map((a) => (
        <p key={a.label} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-white/75">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
            <a.icon className="h-3 w-3 text-accent-light" />
          </span>
          {a.label}
        </p>
      ))}
    </div>
  )
}

export function KitBuilder({ catalog }: { catalog: KitBuilderCatalog }) {
  const [applicationType, setApplicationType] = useState<KitApplication | ''>('')
  const [installMethod, setInstallMethod] = useState<KitInstallMethod | ''>('')
  const [rvLength, setRvLength] = useState('')
  const [sqft, setSqft] = useState('')
  const [seams, setSeams] = useState('')
  const [color, setColor] = useState<KitColor>('White')

  const { addItem } = useCart()
  const { trackEvent } = useTracking()
  const reduce = useReducedMotion()
  const resultMotion = {
    initial: reduce ? false : { opacity: 0, y: 24, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  } as const

  const isRv = applicationType === 'rv' || applicationType === 'transportation'
  const isDeck = installMethod === 'direct-to-deck'
  const sqftNum = parseInt(sqft, 10) || 0
  const seamsNum = parseInt(seams, 10) || 0

  // Direct-to-deck RV kits carry FT ranges as their own live size option
  const rvLengthOptions = useMemo(() => {
    if (isDeck) {
      const product = catalog['direct-to-deck-rv-roofing-kit']
      return product
        ? sizeValues(product).map((s) => ({ value: s, label: s }))
        : []
    }
    return RV_LENGTH_BUCKETS.map((b) => ({ value: b.value, label: b.label }))
  }, [catalog, isDeck])

  const flatKitProduct = isDeck
    ? catalog['direct-to-deck-kit']
    : catalog['double-layer-kit']
  const maxStandardSqft = flatKitProduct ? maxCoveredMeasure(flatKitProduct) : 0
  const needsCustomKit = !isRv && !!installMethod && sqftNum > maxStandardSqft

  const kit = useMemo((): KitRecommendation | null => {
    if (!applicationType || !installMethod) return null
    if (isRv) {
      if (!rvLength) return null
      return recommendRvKit(catalog, { installMethod, lengthValue: rvLength, color })
    }
    if (!sqftNum || needsCustomKit) return null
    return recommendFlatRoofKit(catalog, { sqft: sqftNum, installMethod, color })
  }, [applicationType, catalog, color, installMethod, isRv, needsCustomKit, rvLength, sqftNum])

  const custom = useMemo(() => {
    if (!needsCustomKit || !sqftNum) return null
    return buildCustomKit(catalog, { sqft: sqftNum, seams: seamsNum, color })
  }, [catalog, color, needsCustomKit, seamsNum, sqftNum])

  const commercialKit = useMemo(
    () => (needsCustomKit && !isDeck ? findCommercialKit(catalog, sqftNum) : null),
    [catalog, isDeck, needsCustomKit, sqftNum]
  )

  function kitSummary(): string {
    const lines = [
      'Kit Builder details:',
      applicationType ? `- Application: ${APPLICATION_LABELS[applicationType]}` : null,
      installMethod
        ? `- Install: ${isDeck ? 'Direct to wood decking' : 'Over existing substrate'}`
        : null,
      isRv && rvLength ? `- Roof length: ${rvLength}` : null,
      !isRv && sqftNum ? `- Square footage: ${sqftNum}` : null,
      seamsNum ? `- Seams: ${seamsNum} linear FT` : null,
      `- Color: ${color}`,
      kit
        ? `- Recommended kit: ${kit.product.title} (${kit.sizeLabel}) — ${usd(kit.variant.price)}`
        : null,
      custom
        ? `- Custom build (${usd(custom.total)}): ${custom.lines
            .map((l) => `${l.quantity}x ${l.product.title} ${l.variant.title}`)
            .join(', ')}`
        : null,
      commercialKit
        ? `- Pre-built option: ${commercialKit.product.title} — ${usd(commercialKit.variant.price)}`
        : null,
    ]
    return lines.filter(Boolean).join('\n')
  }

  function addKitToCart() {
    if (!kit) return
    addItem({
      variantId: kit.variant.id,
      productHandle: kit.product.handle,
      productTitle: kit.product.title,
      variantTitle: kit.variant.title,
      price: kit.variant.price,
      image: kit.variant.image ?? kit.product.featuredImage,
    })
    void trackEvent('kit_built', {
      kit: kit.product.handle,
      variant: kit.variant.title,
      source_page: 'kit-builder',
    })
  }

  function addCustomKitToCart() {
    if (!custom) return
    for (const line of custom.lines) {
      addItem(
        {
          variantId: line.variant.id,
          productHandle: line.product.handle,
          productTitle: line.product.title,
          variantTitle: line.variant.title,
          price: line.variant.price,
          image: line.variant.image ?? line.product.featuredImage,
        },
        line.quantity
      )
    }
    void trackEvent('kit_built', {
      kit: 'custom',
      total: custom.total,
      source_page: 'kit-builder',
    })
  }

  function addCommercialKitToCart() {
    if (!commercialKit) return
    addItem({
      variantId: commercialKit.variant.id,
      productHandle: commercialKit.product.handle,
      productTitle: commercialKit.product.title,
      variantTitle: commercialKit.variant.title,
      price: commercialKit.variant.price,
      image: commercialKit.variant.image ?? commercialKit.product.featuredImage,
    })
    void trackEvent('kit_built', {
      kit: commercialKit.product.handle,
      source_page: 'kit-builder',
    })
  }

  return (
    <div className="rounded-3xl bg-white ring-1 ring-white/20 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.55)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
          <Hammer className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-extrabold leading-tight text-primary">Build your kit</h2>
          <p className="hidden text-[13px] text-gray-500 sm:block">A few quick questions, then your kit with live pricing.</p>
        </div>
        <SpeakToRepButton sourcePage="kit-builder:header" message={kitSummary} size="sm" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2.5 gap-y-3 sm:gap-3 mt-4 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white p-3 ring-1 ring-primary/[0.06] sm:p-4 [&_label]:text-[13px] [&_label]:font-semibold [&_label]:text-gray-800">
        {/* Long answers get the full row on phones; the short fields below pair up */}
        <div className="col-span-2 sm:col-span-1">
          <Select
            label="What are you sealing?"
            placeholder="Please Select"
            className={fieldClass}
            value={applicationType}
            onChange={(e) => {
              setApplicationType(e.target.value as KitApplication)
              setRvLength('')
            }}
            options={[
              { value: 'rv', label: 'RV' },
              { value: 'commercial', label: 'Commercial Flat Roof' },
              { value: 'residential', label: 'Residential Flat Roof' },
              { value: 'transportation', label: 'Transportation' },
            ]}
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <Select
            label="Applied over"
            placeholder="Please Select"
            className={fieldClass}
            value={installMethod}
            onChange={(e) => {
              setInstallMethod(e.target.value as KitInstallMethod)
              setRvLength('')
            }}
            options={[
              { value: 'over-existing', label: 'An existing roof' },
              { value: 'direct-to-deck', label: 'Bare wood decking' },
            ]}
          />
        </div>

        {isRv && installMethod && (
          <div className="animate-fade-up">
            <Select
              label={applicationType === 'rv' ? 'RV length' : 'Roof length'}
              placeholder="Please Select"
              className={fieldClass}
              value={rvLength}
              onChange={(e) => setRvLength(e.target.value)}
              options={rvLengthOptions}
            />
          </div>
        )}

        {!isRv && applicationType && (
          <div className="animate-fade-up">
            <Input
              label="Roof size (sq ft)"
              type="number"
              min={0}
              placeholder="e.g. 250"
              className={fieldClass}
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
            />
          </div>
        )}

        {applicationType && installMethod && (
          <div className="animate-fade-up">
            <Select
              label="Color"
              className={fieldClass}
              value={color}
              onChange={(e) => setColor(e.target.value as KitColor)}
              options={KIT_COLORS.map((c) => ({ value: c, label: c }))}
            />
          </div>
        )}

        {!isRv && applicationType && (
          <div className="animate-fade-up">
            <Input
              label="Seams, linear ft (optional)"
              type="number"
              min={0}
              placeholder="e.g. 250"
              className={fieldClass}
              value={seams}
              onChange={(e) => setSeams(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Result: standard sized kit */}
      {kit && (
        <motion.div
          {...resultMotion}
          className="relative mt-4 rounded-3xl bg-primary text-white overflow-hidden shadow-[0_30px_60px_-30px_rgb(0_32_67/0.6)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(18,95,151,0.6),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(91,164,17,0.18),transparent_45%)]" />
          <GlowOrb className="-right-20 -top-20 h-64 w-64" color="rgb(26 123 196 / 0.35)" />
          <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative z-10 p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-[4fr_8fr] gap-4 lg:gap-6 items-center">
              {/* Kit image */}
              {(kit.variant.image ?? kit.product.featuredImage) && (
                <div className="relative">
                  <div aria-hidden="true" className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl" />
                  <div className="relative rounded-2xl bg-gradient-to-br from-white via-white to-accent/10 p-2.5 shadow-2xl ring-1 ring-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={kit.variant.image ?? kit.product.featuredImage ?? undefined}
                    alt={kit.product.title}
                    className="mx-auto max-h-44 w-full object-contain"
                  />
                  </div>
                </div>
              )}

              {/* Kit details */}
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold leading-tight">{kit.product.title}</h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-white/70">
                  {kit.sizeLabel} &middot; {color}
                  <Stars className="w-3 h-3" />
                </p>
                <p className="mt-2 text-3xl font-extrabold font-[family-name:var(--font-display)]">
                  {usd(kit.variant.price)}
                  {kit.variant.price >= 100 && kit.variant.price <= 1000 && (
                    <span className="ml-2 align-middle text-xs font-medium text-white/55">or 4 payments with Affirm</span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  <Button variant="accent" size="md" className="btn-sheen gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent shadow-[0_8px_22px_-8px_rgb(91_164_17/0.65)] hover:shadow-[0_16px_32px_-10px_rgb(91_164_17/0.7)] active:translate-y-0 active:scale-[0.98]" onClick={addKitToCart}>
                    <ShoppingCart className="w-4 h-4" />
                    Add Kit to Cart
                  </Button>
                  {kit.product.listed !== false && (
                    <a href={`/store/${kit.product.handle}`} className="inline-flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white">
                      Kit details <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <KitAssurances />
              </div>
            </div>

            {/* What's included — per-variant contents from Shopify */}
            {kit.variant.descriptionHtml && (
              <details className="group mt-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-highlight [&::-webkit-details-marker]:hidden">
                  What&apos;s included
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4">
                <div
                  className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-white/80 [&_strong]:text-white [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:marker:text-accent-light"
                  dangerouslySetInnerHTML={{ __html: kit.variant.descriptionHtml }}
                />
                </div>
              </details>
            )}

            <KitLeadPrompt summary={kitSummary} />
          </div>
        </motion.div>
      )}

      {/* Result: custom itemized build for large flat roofs */}
      {custom && (
        <motion.div
          {...resultMotion}
          className="relative mt-4 rounded-3xl bg-primary text-white overflow-hidden shadow-[0_30px_60px_-30px_rgb(0_32_67/0.6)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(18,95,151,0.6),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(91,164,17,0.18),transparent_45%)]" />
          <GlowOrb className="-right-20 -top-20 h-64 w-64" color="rgb(26 123 196 / 0.35)" />
          <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative z-10 p-4 sm:p-5">
          <h3 className="text-xl sm:text-2xl font-extrabold leading-tight">
            Custom {isDeck ? 'Direct-to-Deck' : 'Seamless Roofing'} Build
          </h3>
          <p className="mt-0.5 mb-3 flex flex-wrap items-center gap-x-2 text-sm text-white/70">
            {sqftNum.toLocaleString('en-US')} sq ft &middot; {color}
            <Stars className="w-3 h-3" />
          </p>
          <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm px-4 py-3 mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-highlight mb-2">
              What&apos;s in your build
            </p>
            <ul className="text-white/85 text-sm space-y-1.5">
              {custom.lines.map((line) => (
                <li key={line.variant.id} className="flex items-baseline justify-between gap-3">
                  <span>
                    {line.quantity} x {line.product.title}{' '}
                    <span className="text-white/55">({line.variant.title})</span>
                  </span>
                  <span className="font-semibold whitespace-nowrap">
                    {usd(line.variant.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {custom.missing.length > 0 && (
            <p className="text-sm text-white/60 mb-3">
              A specialist will confirm: {custom.missing.join(', ')}
            </p>
          )}
          <p className="text-3xl font-extrabold mb-3 font-[family-name:var(--font-display)]">{usd(custom.total)}</p>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="accent" size="md" className="btn-sheen gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent shadow-[0_8px_22px_-8px_rgb(91_164_17/0.65)] hover:shadow-[0_16px_32px_-10px_rgb(91_164_17/0.7)] active:translate-y-0 active:scale-[0.98]" onClick={addCustomKitToCart}>
              <ShoppingCart className="w-4 h-4" />
              Add Kit to Cart
            </Button>
            <CallRepLink light />
          </div>
          <KitAssurances />

          {commercialKit && (
            <div className="mt-3 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm px-4 py-3 transition-colors duration-300 hover:bg-white/[0.09] hover:ring-white/25">
              <p className="text-sm font-semibold text-white mb-1">
                Prefer a pre-built kit?
              </p>
              <p className="text-white/70 text-sm mb-3">
                Our {commercialKit.product.title} covers projects like yours with everything
                boxed and ready — {usd(commercialKit.variant.price)}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="sm" className="btn-sheen gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent shadow-[0_8px_22px_-8px_rgb(91_164_17/0.65)] hover:shadow-[0_16px_32px_-10px_rgb(91_164_17/0.7)] active:translate-y-0 active:scale-[0.98]" onClick={addCommercialKitToCart}>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </Button>
                {commercialKit.product.listed !== false && (
                  <LinkButton href={`/store/${commercialKit.product.handle}`} variant="outline-white" size="sm">
                    View Kit
                    <ArrowRight className="w-4 h-4" />
                  </LinkButton>
                )}
              </div>
            </div>
          )}

          <KitLeadPrompt summary={kitSummary} />
          </div>
        </motion.div>
      )}

      {!kit && !custom && (
        <p className="mt-3 text-center text-[13px] text-gray-400">
          Your kit appears here with live pricing as soon as you answer.
        </p>
      )}
    </div>
  )
}

/**
 * Ungated quick lead prompt shown alongside every kit result. The form opens
 * in a pop-up; submitting never blocks the kit or cart — it just gets a
 * specialist reviewing the build.
 */
function KitLeadPrompt({ summary }: { summary: () => string }) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(LEAD_SUBMITTED_KEY) === '1'
  )

  if (submitted) {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="mt-4 rounded-2xl bg-accent/[0.12] ring-1 ring-accent/40 p-4 flex items-center gap-4"
      >
        <SuccessCheck size="sm" />
        <div>
          <p className="text-sm font-semibold text-white">
            Got it — a roofing specialist will reach out shortly.
          </p>
          <p className="text-white/70 text-sm">
            Your kit is ready in the meantime — order whenever you&apos;re ready.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <div className="mt-3 flex flex-col gap-2.5 rounded-2xl bg-[#f5c542]/[0.1] px-4 py-3 ring-1 ring-[#f5c542]/45 sm:flex-row sm:items-center">
        <p className="flex flex-1 items-center gap-2 text-sm text-white/80">
          <Headset className="h-4 w-4 shrink-0 text-[#ffd95a]" />
          <span>
            <span className="font-semibold text-white">Want a rep to double-check this kit?</span>{' '}
            Free, no obligation.
          </span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#ffe27a] to-[#f5c542] px-5 text-sm font-bold text-primary-dark ring-1 ring-inset ring-[#e3b42a] shadow-[0_8px_22px_-10px_rgb(227_180_42/0.9)] transition-all hover:-translate-y-0.5"
        >
          <Headset className="h-4 w-4" />
          Speak to a rep
        </button>
      </div>
      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Kit review"
        title="Speak to a Rep About Your Kit"
        subtitle="We'll double-check the fit and answer any questions."
        icon={Headset}
        width="sm"
      >
        <KitLeadForm
          summary={summary}
          onSubmitted={() => {
            setSubmitted(true)
            setOpen(false)
          }}
        />
      </FormModal>
    </>
  )
}

function KitLeadForm({ summary, onSubmitted }: { summary: () => string; onSubmitted: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const { visitorId, sessionId, trackEvent } = useTracking()

  function addPhotos(incoming: FileList) {
    const images = Array.from(incoming).filter((f) => f.type.startsWith('image/'))
    if (images.length) setPhotoFiles((prev) => [...prev, ...images])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!turnstileToken) {
      setError('Please complete the verification check.')
      setSubmitting(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const eventId = generateEventId()

    const note = (formData.get('comments') as string || '').trim()
    const photo_urls = await uploadPhotos(photoFiles, 'lead-photos')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          lead_type: 'quote',
          message: note ? `${summary()}\n\nCustomer note: ${note}` : summary(),
          photo_url: photo_urls[0] || undefined,
          photo_urls: photo_urls.length > 0 ? photo_urls : undefined,
          source_page: 'kit-builder',
          visitor_id: visitorId,
          session_id: sessionId,
          turnstile_token: turnstileToken,
          event_id: eventId,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit. Please try again.')

      await trackEvent('form_submitted', { source_page: 'kit-builder' })
      trackMetaEvent('Lead', { content_name: 'kit-builder' }, eventId)
      await reportLeadToGoogleAds(res, {
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        eventId,
      })

      sessionStorage.setItem(LEAD_SUBMITTED_KEY, '1')
      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input name="name" size="md" placeholder="Name" autoComplete="name" required className={`${fieldClass} sm:col-span-2`} />
        <Input name="email" size="md" type="email" placeholder="Email" autoComplete="email" required className={fieldClass} />
        <Input name="phone" size="md" type="tel" placeholder="Phone" autoComplete="tel" required className={fieldClass} />
      </div>
      <Textarea
        name="comments"
        rows={2}
        placeholder="Anything we should know about your roof? (optional)"
        className={`${fieldClass} min-h-0 py-2.5`}
      />
      <div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addPhotos(e.target.files)
            if (photoInputRef.current) photoInputRef.current.value = ''
          }}
        />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (e.dataTransfer.files) addPhotos(e.dataTransfer.files)
          }}
          onClick={() => photoInputRef.current?.click()}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs transition-all duration-300 sm:text-sm ${
            dragging
              ? 'border-accent bg-accent/10 text-primary ring-4 ring-accent/15'
              : 'border-primary/20 text-gray-600 hover:border-accent/60 hover:bg-accent/[0.03]'
          }`}
        >
          <ImagePlus className="h-4 w-4 shrink-0 text-accent-dark" />
          <span>
            Add roof photos or <span className="font-semibold text-accent-dark underline underline-offset-2">browse</span> (optional)
          </span>
        </div>
        {photoFiles.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {photoFiles.map((file, i) => (
              <div key={i} className="group relative h-11 w-11 overflow-hidden rounded-lg ring-1 ring-primary/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(file)} alt={`Roof photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Invisible unless Cloudflare requires an interactive challenge */}
      <FormTurnstile
        id="turnstile-kit-builder"
        turnstileRef={turnstileRef}
        onToken={setTurnstileToken}
        appearance="interaction-only"
      />
      {error && <FormError>{error}</FormError>}
      <SubmitButton submitting={submitting} submittingLabel="Sending...">
        Send to a Rep
      </SubmitButton>
    </form>
  )
}

'use client'

import { useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Hammer,
  ImagePlus,
  Loader2,
  MessageSquare,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Button, Input, LinkButton, Select, Textarea } from '@/lib/design-system'
import { uploadPhotos } from '@/components/forms/PhotoUploadField'
import { Stars } from '@/components/store/Stars'
import { useCart } from '@/contexts/CartContext'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { useTracking } from '@/components/tracking'
import { trackMetaEvent, generateEventId } from '@/lib/tracking/meta-pixel'
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
    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5">
      {KIT_ASSURANCES.map((a) => (
        <p key={a.label} className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
          <a.icon className="w-4 h-4 text-accent" />
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
  const { openQuoteModal } = useQuoteModal()
  const { trackEvent } = useTracking()

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
    <div className="rounded-2xl bg-white border border-gray-200/80 shadow-sm p-5 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Hammer className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary">Kit Builder</h2>
          <p className="text-sm text-gray-500">
            Answer a few questions — we&apos;ll build your custom kit instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Select
          label="What best describes your application type?"
          placeholder="Please Select"
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

        <Select
          label="How will the kit be applied?"
          placeholder="Please Select"
          value={installMethod}
          onChange={(e) => {
            setInstallMethod(e.target.value as KitInstallMethod)
            setRvLength('')
          }}
          options={[
            { value: 'over-existing', label: 'Over existing substrate' },
            { value: 'direct-to-deck', label: 'Direct to wood decking' },
          ]}
        />

        {isRv && installMethod && (
          <Select
            label={applicationType === 'rv' ? 'How long is your RV?' : 'How long is your vehicle roof?'}
            placeholder="Please Select"
            value={rvLength}
            onChange={(e) => setRvLength(e.target.value)}
            options={rvLengthOptions}
          />
        )}

        {!isRv && applicationType && (
          <Input
            label="Project square footage"
            type="number"
            min={0}
            placeholder="e.g. 250"
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
          />
        )}

        {applicationType && installMethod && (
          <Select
            label="Choose your roof color"
            value={color}
            onChange={(e) => setColor(e.target.value as KitColor)}
            options={KIT_COLORS.map((c) => ({ value: c, label: c }))}
          />
        )}

        {!isRv && applicationType && (
          <Input
            label="Approximate linear footage of seams (optional)"
            type="number"
            min={0}
            placeholder="e.g. 5 seams x 50 FT = 250"
            value={seams}
            onChange={(e) => setSeams(e.target.value)}
          />
        )}
      </div>

      {/* Result: standard sized kit */}
      {kit && (
        <div className="relative mt-6 rounded-2xl bg-primary text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(18,95,151,0.6),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(91,164,17,0.18),transparent_45%)]" />
          <div className="relative z-10 p-5 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-6 lg:gap-8 items-center">
              {/* Kit image */}
              {(kit.variant.image ?? kit.product.featuredImage) && (
                <div className="rounded-2xl bg-white p-3 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={kit.variant.image ?? kit.product.featuredImage ?? undefined}
                    alt={kit.product.title}
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              {/* Kit details */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-highlight mb-2">
                  Your Kit Is Ready
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-1">{kit.product.title}</h3>
                <p className="text-white/70 mb-3">
                  {kit.sizeLabel} &middot; {color}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <Stars className="w-3.5 h-3.5" />
                  <span className="text-xs text-white/60">
                    Thousands of successful installations
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold">{usd(kit.variant.price)}</p>
                {kit.variant.price >= 100 && kit.variant.price <= 1000 && (
                  <p className="text-xs text-white/50 mt-1">
                    or 4 installments with Affirm at checkout
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-5">
                  <Button variant="accent" size="md" className="gap-2" onClick={addKitToCart}>
                    <ShoppingCart className="w-4 h-4" />
                    Add Kit to Cart
                  </Button>
                  <LinkButton
                    href={`/store/${kit.product.handle}`}
                    variant="outline-white"
                    size="md"
                  >
                    View Full Kit Details
                    <ArrowRight className="w-4 h-4" />
                  </LinkButton>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openQuoteModal({ sourcePage: 'kit-builder', initialMessage: kitSummary() })
                  }
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Talk to a Specialist about this kit
                </button>
                <KitAssurances />
              </div>
            </div>

            {/* What's included — per-variant contents from Shopify */}
            {kit.variant.descriptionHtml && (
              <div className="mt-6 rounded-xl bg-white/10 ring-1 ring-white/15 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-highlight mb-2">
                  What&apos;s Included
                </p>
                <div
                  className="prose prose-sm prose-invert max-w-none text-white/80 [&_strong]:text-white [&_p]:mb-2 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: kit.variant.descriptionHtml }}
                />
              </div>
            )}

            <KitLeadForm summary={kitSummary} />
          </div>
        </div>
      )}

      {/* Result: custom itemized build for large flat roofs */}
      {custom && (
        <div className="relative mt-6 rounded-2xl bg-primary text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(18,95,151,0.6),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(91,164,17,0.18),transparent_45%)]" />
          <div className="relative z-10 p-5 sm:p-6 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-highlight mb-2">
            Your Custom Kit Is Ready
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            Custom {isDeck ? 'Direct-to-Deck' : 'Seamless Roofing'} Build
          </h3>
          <p className="text-white/70 mb-1">
            {sqftNum.toLocaleString('en-US')} sq ft &middot; {color}
          </p>
          <div className="flex items-center gap-2 mb-4">
            <Stars className="w-3.5 h-3.5" />
            <span className="text-xs text-white/60">
              Thousands of successful installations
            </span>
          </div>
          <div className="rounded-xl bg-white/10 ring-1 ring-white/15 p-4 sm:p-5 mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-highlight mb-3">
              What&apos;s In Your Build
            </p>
            <ul className="text-white/85 text-sm space-y-2">
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
          <p className="text-3xl sm:text-4xl font-bold mb-4">{usd(custom.total)}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="accent" size="md" className="gap-2" onClick={addCustomKitToCart}>
              <ShoppingCart className="w-4 h-4" />
              Add Kit to Cart
            </Button>
            <button
              type="button"
              onClick={() =>
                openQuoteModal({ sourcePage: 'kit-builder-custom', initialMessage: kitSummary() })
              }
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm sm:text-base font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Talk to a Specialist
            </button>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <Phone className="w-4 h-4" />
              (800) 963-0131
            </a>
          </div>
          <KitAssurances />

          {commercialKit && (
            <div className="mt-5 rounded-xl bg-white/10 ring-1 ring-white/15 p-4 sm:p-5">
              <p className="text-sm font-semibold text-white mb-1">
                Prefer a pre-built kit?
              </p>
              <p className="text-white/70 text-sm mb-3">
                Our {commercialKit.product.title} covers projects like yours with everything
                boxed and ready — {usd(commercialKit.variant.price)}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="sm" className="gap-2" onClick={addCommercialKitToCart}>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </Button>
                <LinkButton
                  href={`/store/${commercialKit.product.handle}`}
                  variant="outline-white"
                  size="sm"
                >
                  View Kit
                  <ArrowRight className="w-4 h-4" />
                </LinkButton>
              </div>
            </div>
          )}

          <KitLeadForm summary={kitSummary} />
          </div>
        </div>
      )}

      {!kit && !custom && (
        <div className="mt-6">
          <p className="text-sm text-gray-400 text-center mb-4">
            Answer the questions above and your kit appears here with live pricing.
          </p>
          <button
            type="button"
            onClick={() => openQuoteModal({ sourcePage: 'kit-builder' })}
            className="group w-full flex items-center gap-4 rounded-2xl border-2 border-[#003365]/15 bg-blue-50/60 px-4 py-3.5 sm:px-5 text-left shadow-sm hover:border-[#003365] hover:shadow-md hover:bg-blue-50 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span className="flex-shrink-0 rounded-full bg-[#003365] p-3 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 text-white" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-[#003365]">
                Not sure where to start? Ask a specialist — free
              </span>
              <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                Opens a quick form. We&apos;ll build the kit for your exact roof
                and get right back to you.
              </span>
            </span>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-[#003365]/40 group-hover:text-[#003365] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Ungated quick lead form shown alongside every kit result. Submitting never
 * blocks the kit or cart — it just gets a specialist reviewing the build.
 */
function KitLeadForm({ summary }: { summary: () => string }) {
  const [submitted, setSubmitted] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(LEAD_SUBMITTED_KEY) === '1'
  )
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

      sessionStorage.setItem(LEAD_SUBMITTED_KEY, '1')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl bg-white/10 ring-1 ring-white/15 p-4 sm:p-5 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-highlight shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-white">
            Got it — a roofing specialist will reach out shortly.
          </p>
          <p className="text-white/70 text-sm">
            Your kit is ready in the meantime — order whenever you&apos;re ready.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl bg-white/10 ring-1 ring-white/15 p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
        <MessageSquare className="w-4 h-4 text-highlight" />
        Want to talk to us about your kit?
      </p>
      <p className="text-white/70 text-sm mb-4">
        Drop your info and a roofing specialist will double-check the fit and answer any
        questions — free, no obligation.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <Input name="name" size="md" placeholder="Name" required className="bg-white" />
        <Input name="email" size="md" type="email" placeholder="Email" required className="bg-white" />
        <Input name="phone" size="md" type="tel" placeholder="Phone" required className="bg-white" />
      </div>
      <Textarea
        name="comments"
        rows={2}
        placeholder="Anything we should know about your roof? (optional)"
        className="bg-white mb-3 min-h-0 py-2.5"
      />
      <div className="mb-4">
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
          className={`flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm transition-colors cursor-pointer ${
            dragging
              ? 'border-white/80 bg-white/15 text-white'
              : 'border-white/30 text-white/70 hover:border-white/60 hover:text-white'
          }`}
        >
          <ImagePlus className="w-4 h-4 shrink-0" />
          <span>
            Drag &amp; drop roof photos or <span className="font-semibold underline underline-offset-2">browse</span> (optional)
          </span>
        </div>
        {photoFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {photoFiles.map((file, i) => (
              <div
                key={i}
                className="relative group w-11 h-11 rounded-lg overflow-hidden ring-1 ring-white/25"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Roof photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Invisible unless Cloudflare requires an interactive challenge */}
      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setTurnstileToken}
        onExpire={() => setTurnstileToken(null)}
        options={{ theme: 'dark', size: 'flexible', appearance: 'interaction-only' }}
      />
      <Button type="submit" variant="accent" size="md" disabled={submitting || !turnstileToken}>
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          'Talk to Us About My Kit'
        )}
      </Button>
      {error && (
        <p className="mt-3 text-sm text-red-200 bg-red-500/20 px-4 py-2.5 rounded-lg">{error}</p>
      )}
    </form>
  )
}

'use client'

import React, { useEffect, useState, useRef } from 'react'
import { type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send, Star } from 'lucide-react'
import { Input, Textarea, Select } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'
import { PhotoUploadField, startUpload, uploadPhotos } from '@/components/forms/PhotoUploadField'
import {
  applyFields,
  clearDraft,
  loadDraft,
  loadDraftFiles,
  readFields,
  saveDraft,
  saveDraftFiles,
  type FieldValues,
} from '@/lib/form-draft'
import { FormTurnstile, ensureTurnstileToken, TURNSTILE_RETRY_MESSAGE } from '@/components/forms/FormTurnstile'
import {
  FieldLabel,
  FormError,
  FormSection,
  FormStepper,
  FormStepperFinal,
  FormSuccess,
  SubmitButton,
  checkRowClass,
  checkboxClass,
  fieldClass,
} from '@/components/forms/form-ui'

const DRAFT_KEY = 'warranty-registration'

type WarrantyDraft = { fields: FieldValues; projectType: string; installType: string; rating: number }
type WarrantyPhotoDraft = { before: File[]; after: File[] }

function initialDraft(): WarrantyDraft | null {
  if (typeof window === 'undefined') return null
  const draft = loadDraft<WarrantyDraft>(DRAFT_KEY)
  // Ignore drafts with nothing typed (the photo-consent box starts ticked).
  const hasContent =
    draft &&
    (draft.projectType || draft.installType || draft.rating ||
      Object.entries(draft.fields).some(([k, v]) => k !== 'photo_display_consent' && v))
  return hasContent ? draft : null
}

const RV_LENGTHS = Array.from({ length: 38 }, (_, i) => `${i + 8}`)

export function WarrantyRegistrationForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [beforeFiles, setBeforeFiles] = useState<File[]>([])
  const [afterFiles, setAfterFiles] = useState<File[]>([])
  // Restore any saved progress (see src/lib/form-draft.ts).
  const [draft] = useState(initialDraft)
  const [projectType, setProjectType] = useState(draft?.projectType ?? '')
  const [installType, setInstallType] = useState(draft?.installType ?? '')
  const [rating, setRating] = useState(draft?.rating ?? 0)
  const [restored, setRestored] = useState(Boolean(draft))
  const [photosLoaded, setPhotosLoaded] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const pendingFields = useRef<FieldValues | null>(draft ? { ...draft.fields } : null)
  const [hoverRating, setHoverRating] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const { visitorId, sessionId, trackEvent } = useTracking()

  // Fill saved values into fields as they render (some only appear after a
  // restored choice, like RV length or the contractor fields).
  useEffect(() => {
    if (formRef.current && pendingFields.current) applyFields(formRef.current, pendingFields.current)
  })

  useEffect(() => {
    let cancelled = false
    loadDraftFiles<WarrantyPhotoDraft>(DRAFT_KEY).then((photos) => {
      if (cancelled) return
      if (photos && (photos.before.length || photos.after.length)) {
        setBeforeFiles(photos.before)
        setAfterFiles(photos.after)
        setRestored(true)
        // Resume uploading in the background, as when they were first picked.
        ;[...photos.before, ...photos.after].forEach((f) => startUpload(f, 'warranty').catch(() => {}))
      }
      setPhotosLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function saveProgress() {
    if (!formRef.current || submitted) return
    const fields = { ...readFields(formRef.current, ['website']), ...(pendingFields.current ?? {}) }
    saveDraft<WarrantyDraft>(DRAFT_KEY, { fields, projectType, installType, rating })
  }

  // Choices held in state change outside the form's input events.
  useEffect(() => {
    if (formRef.current) saveProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectType, installType, rating])

  useEffect(() => {
    if (photosLoaded && !submitted) saveDraftFiles<WarrantyPhotoDraft>(DRAFT_KEY, { before: beforeFiles, after: afterFiles })
  }, [beforeFiles, afterFiles, photosLoaded, submitted])

  function startOver() {
    pendingFields.current = null
    formRef.current?.reset()
    setProjectType('')
    setInstallType('')
    setRating(0)
    setBeforeFiles([])
    setAfterFiles([])
    setRestored(false)
    clearDraft(DRAFT_KEY)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)

      const verifiedToken = await ensureTurnstileToken(turnstileRef, turnstileToken)

      if (!verifiedToken) {
        setError(TURNSTILE_RETRY_MESSAGE)
        return
      }

      if (!beforeFiles.length || !afterFiles.length) {
        setError('Please upload at least one before photo and one after photo.')
        return
      }

      if (!rating) {
        setError('Please rate your experience with Crazy Seal.')
        return
      }

      const [before_photo_urls, after_photo_urls] = await Promise.all([
        uploadPhotos(beforeFiles, 'warranty'),
        uploadPhotos(afterFiles, 'warranty'),
      ])
      if (!before_photo_urls.length || !after_photo_urls.length) {
        setError("Some photos didn't upload. Check your connection and submit again. Photos that already uploaded won't upload twice.")
        return
      }
      const photo_urls = [...before_photo_urls, ...after_photo_urls]

      const firstName = (formData.get('first_name') as string || '').trim()
      const lastName = (formData.get('last_name') as string || '').trim()

      const body = {
        name: `${firstName} ${lastName}`.trim(),
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        customer_details: formData.get('customer_details') as string,
        order_number: formData.get('order_number') as string,
        project_type: projectType,
        rv_length: formData.get('rv_length') as string,
        square_footage: formData.get('square_footage') as string,
        install_type: installType,
        installer_name: formData.get('installer_name') as string,
        installer_phone: formData.get('installer_phone') as string,
        installer_email: formData.get('installer_email') as string,
        photo_urls,
        before_photo_urls,
        after_photo_urls,
        rating,
        experience_notes: formData.get('experience_notes') as string,
        contractor_notes: formData.get('contractor_notes') as string,
        warranty_consent: formData.get('warranty_consent') === 'on',
        photo_display_consent: formData.get('photo_display_consent') === 'on',
        visitor_id: visitorId,
        session_id: sessionId,
        turnstile_token: verifiedToken,
        website: formData.get('website') as string,
      }

      const res = await fetch('/api/warranty/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to submit. Please try again.')
      }

      const data = await res.json().catch(() => null)
      if (data?.certificate_url) setCertificateUrl(data.certificate_url)

      await clearDraft(DRAFT_KEY)
      await trackEvent('warranty_registered', { order_number: body.order_number })
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
      <FormSuccess
        title="Congratulations!"
        action={
          certificateUrl ? (
            <a
              href={certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-primary-light to-primary px-6 py-3 font-semibold text-white shadow-[0_8px_22px_-8px_rgb(0_51_101/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_rgb(0_51_101/0.6)]"
            >
              View Your Warranty Certificate
            </a>
          ) : undefined
        }
      >
        <p>
          Your warranty registration has been received. Your application is
          covered for 50 years! A confirmation email is on its way.
        </p>
      </FormSuccess>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} onInput={saveProgress} onChange={saveProgress}>
      <div className="space-y-3.5">
        {restored && (
          <p className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent/[0.08] px-3 py-2 text-sm text-gray-700 ring-1 ring-accent/20">
            <span>We saved your progress on this device.</span>
            <button type="button" onClick={startOver} className="font-semibold text-primary underline underline-offset-2">
              Start over
            </button>
          </p>
        )}
        <div aria-hidden="true" className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
          <label htmlFor="wr-website">Website</label>
          <input type="text" id="wr-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <FormStepper
          titles={['Details', 'Installation', 'Photos', 'Experience']}
          validateStep={(step) =>
            step === 3 && (!beforeFiles.length || !afterFiles.length)
              ? 'Please upload at least one before photo and one after photo.'
              : null
          }
        >
        <FormSection step={1} title="Your details">
          <div className="grid grid-cols-2 gap-3">
            <Input name="first_name" size="md" required placeholder="First name *" aria-label="First name" autoComplete="given-name" className={fieldClass} />
            <Input name="last_name" size="md" required placeholder="Last name *" aria-label="Last name" autoComplete="family-name" className={fieldClass} />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <Input name="phone" size="md" type="tel" required placeholder="Phone *" aria-label="Phone" autoComplete="tel" className={fieldClass} />
            <Input name="email" size="md" type="email" required placeholder="Email *" aria-label="Email" autoComplete="email" className={fieldClass} />
          </div>

          {/* Customer details + Order number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Business name (optional)</FieldLabel>
              <Input name="customer_details" size="md" className={fieldClass} />
            </div>
            <div>
              <FieldLabel required>Order Number</FieldLabel>
              <Input name="order_number" size="md" required className={fieldClass} />
            </div>
          </div>
        </FormSection>

        <FormSection step={2} title="Your installation">
          {/* Project type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Project type</FieldLabel>
              <Select
                name="project_type"
                size="md"
                required
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="Please Select"
                options={[
                  { value: 'RV Roof', label: 'RV Roof' },
                  { value: 'Other', label: 'Other' },
                ]}
                className={fieldClass}
              />
            </div>
            {projectType === 'RV Roof' && (
              <div className="animate-fade-up">
                <FieldLabel required>RV length</FieldLabel>
                <Select
                  name="rv_length"
                  size="md"
                  required
                  placeholder="Please Select"
                  options={RV_LENGTHS.map(l => ({ value: l, label: `${l} FT` }))}
                  className={fieldClass}
                />
              </div>
            )}
            {projectType === 'Other' && (
              <div className="animate-fade-up">
                <FieldLabel required>Approx. square footage</FieldLabel>
                <Input name="square_footage" size="md" type="number" min={0} required className={fieldClass} />
              </div>
            )}
          </div>

          {/* Install type */}
          <div>
            <FieldLabel required>Installed by</FieldLabel>
            <Select
              name="install_type"
              size="md"
              required
              value={installType}
              onChange={(e) => setInstallType(e.target.value)}
              placeholder="Please Select"
              options={[
                { value: 'diy', label: 'Self installed (DIY)' },
                { value: 'contractor', label: 'Installed by a dealer / contractor / handyman' },
              ]}
              className={fieldClass}
            />
          </div>

          {installType === 'contractor' && (
            <div className="animate-fade-up grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-slate-50/70 p-3 ring-1 ring-gray-200/80">
              <div>
                <FieldLabel>Installer name</FieldLabel>
                <Input name="installer_name" size="md" className={fieldClass} />
              </div>
              <div>
                <FieldLabel>Installer phone</FieldLabel>
                <Input name="installer_phone" size="md" type="tel" className={fieldClass} />
              </div>
              <div>
                <FieldLabel>Installer email</FieldLabel>
                <Input name="installer_email" size="md" type="email" className={fieldClass} />
              </div>
            </div>
          )}
        </FormSection>

        <FormSection step={3} title="Before & after photos">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PhotoUploadField
              label={<>Before photos of your application <span className="text-red-500">*</span></>}
              hint="Show the roof before Crazy Seal was applied. JPG, PNG, or HEIC."
              inputLabel="Upload before photos"
              folder="warranty"
              files={beforeFiles}
              onChange={setBeforeFiles}
            />
            <PhotoUploadField
              label={<>After photos of your application <span className="text-red-500">*</span></>}
              hint="Show the finished roof. JPG, PNG, or HEIC."
              inputLabel="Upload after photos"
              folder="warranty"
              files={afterFiles}
              onChange={setAfterFiles}
            />
          </div>
        </FormSection>

        <FormSection step={4} title="Your experience">
          {/* Experience rating */}
          <div>
            <FieldLabel required>Rate your experience</FieldLabel>
            <div
              className="inline-flex items-center gap-1 rounded-2xl bg-slate-50/80 px-2 py-1.5 ring-1 ring-gray-200/80"
              role="radiogroup"
              aria-label="Rate your experience from 1 to 5 stars"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating)
                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1 cursor-pointer transition-transform duration-200 hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-6 h-6 transition-all duration-200 ${
                        active
                          ? 'text-highlight-dark fill-highlight drop-shadow-[0_2px_4px_rgb(199_186_22/0.5)]'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                )
              })}
              {rating > 0 && (
                <span className="ml-1 mr-2 text-sm font-semibold text-primary">{rating} / 5</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <FieldLabel required>Your experience</FieldLabel>
            <Textarea name="experience_notes" rows={3} required className={fieldClass} />
          </div>

          {installType === 'contractor' && (
            <div className="animate-fade-up">
              <FieldLabel>Contractor Notes</FieldLabel>
              <Textarea name="contractor_notes" rows={3} className={fieldClass} />
            </div>
          )}
        </FormSection>

        {/* Consents */}
        <FormStepperFinal>
        <div className="space-y-2">
          <label className={checkRowClass}>
            <input
              type="checkbox"
              name="warranty_consent"
              required
              className={checkboxClass}
            />
            <span className="text-gray-600">
              I confirm that my application was installed according to the Crazy Seal
              installation guidelines and I agree to the warranty terms and conditions. <span className="text-red-500">*</span>
            </span>
          </label>

          <label className={checkRowClass}>
            <input
              type="checkbox"
              name="photo_display_consent"
              defaultChecked
              className={checkboxClass}
            />
            <span className="text-gray-600">
              We love showing off your work! Leave this box checked to allow us to
              display your photos on our website and social media.
            </span>
          </label>
        </div>

        <div className="flex justify-center empty:hidden">
          <FormTurnstile
            id="turnstile-warranty-register"
            turnstileRef={turnstileRef}
            onToken={setTurnstileToken}
            appearance="interaction-only"
          />
        </div>

        {error && <FormError>{error}</FormError>}

        <div className="flex justify-center">
          <SubmitButton submitting={submitting} icon={<Send className="h-4 w-4" />}>
            Register My Warranty
          </SubmitButton>
        </div>
        </FormStepperFinal>
        </FormStepper>
      </div>
    </form>
  )
}

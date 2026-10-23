'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send } from 'lucide-react'
import { Input, Textarea, Select } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'
import { trackMetaEvent, generateEventId, pushDedupEventId } from '@/lib/tracking/meta-pixel'
import { reportLeadToGoogleAds } from '@/lib/tracking/google-ads'
import { PhotoUploadField, uploadPhotos } from '@/components/forms/PhotoUploadField'
import { FormTurnstile } from '@/components/forms/FormTurnstile'
import {
  FieldLabel,
  FormError,
  FormSection,
  SubmitButton,
  checkRowClass,
  checkboxClass,
  fieldClass,
} from '@/components/forms/form-ui'

interface ContactFormProps {
  sourcePage?: string
  /** Prefills the message field with page/product context. */
  initialMessage?: string
  /** Preselects the project type, e.g. 'RV Roof' on RV pages. */
  defaultProjectType?: string
}

const RV_LENGTHS = Array.from({ length: 38 }, (_, i) => `${i + 8}`)

const SQ_FT_RANGES = Array.from({ length: 15 }, (_, i) => `${i * 100}-${(i + 1) * 100} SQ FT`)

const PROJECT_TYPES = [
  'RV Roof',
  'Residential Flat Roof',
  'Commercial Flat Roof',
  'Transportation',
  'Other',
]

export function ContactForm({
  sourcePage = 'contact',
  initialMessage,
  defaultProjectType = '',
}: ContactFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [projectType, setProjectType] = useState(defaultProjectType)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const { visitorId, sessionId, trackEvent, identify } = useTracking()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    if (!turnstileToken) {
      setError('Please complete the verification check.')
      setSubmitting(false)
      return
    }

    const photo_urls = await uploadPhotos(photoFiles, 'lead-photos')

    const firstName = (formData.get('first_name') as string || '').trim()
    const lastName = (formData.get('last_name') as string || '').trim()
    const fullName = `${firstName} ${lastName}`.trim()

    // Shared id so the browser Pixel event and the server-side CAPI event
    // (sent from /api/leads) are deduplicated by Meta.
    const eventId = generateEventId()

    const body = {
      name: fullName,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      project_type: projectType,
      rv_length: formData.get('rv_length') as string,
      square_footage: formData.get('square_footage') as string,
      texting_consent: formData.get('texting_consent') === 'on',
      lead_type: 'quote',
      photo_url: photo_urls[0] || undefined,
      photo_urls: photo_urls.length > 0 ? photo_urls : undefined,
      message: formData.get('message') as string,
      source_page: sourcePage,
      visitor_id: visitorId,
      session_id: sessionId,
      turnstile_token: turnstileToken,
      website: formData.get('website') as string,
      event_id: eventId,
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error('Failed to submit. Please try again.')
      }

      await trackEvent('form_submitted', { source_page: sourcePage })
      await identify({
        email: body.email,
        firstName,
        lastName,
        phone: body.phone,
      })

      // Browser Pixel Lead — shares event_id with the server CAPI event above.
      trackMetaEvent('Lead', { content_name: sourcePage }, eventId)
      await reportLeadToGoogleAds(res, {
        email: body.email,
        phone: body.phone,
        eventId,
      })

      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'form_submission',
          form_source: sourcePage,
          conversion_type: 'lead',
          event_id: eventId,
        })
      } else {
        pushDedupEventId('form_submission', eventId)
      }

      router.push('/thank-you?type=quote')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3.5">
        <div aria-hidden="true" className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

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

          {/* Texting consent */}
          <label className={checkRowClass}>
            <input type="checkbox" name="texting_consent" className={checkboxClass} />
            <span className="text-gray-600">
              It&apos;s OK to text me about my project — often the fastest way to
              get kit questions answered. (Message rates may apply. Opt out
              anytime.)
            </span>
          </label>
        </FormSection>

        <FormSection step={2} title="Your project">
          {/* Project type + conditional size */}
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
                options={PROJECT_TYPES.map((t) => ({ value: t, label: t }))}
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
            {projectType !== '' && projectType !== 'RV Roof' && (
              <div className="animate-fade-up">
                <FieldLabel required>Approx. square footage</FieldLabel>
                <Select
                  name="square_footage"
                  size="md"
                  required
                  placeholder="Please Select"
                  options={SQ_FT_RANGES.map(r => ({ value: r, label: r }))}
                  className={fieldClass}
                />
              </div>
            )}
          </div>

          {/* Photo Upload */}
          <PhotoUploadField
            label="Photos (optional)"
            files={photoFiles}
            onChange={setPhotoFiles}
          />

          {/* Message */}
          <div>
            <FieldLabel>Notes</FieldLabel>
            <Textarea
              name="message"
              defaultValue={initialMessage}
              placeholder="Tell us about your roof or ask a question"
              rows={2}
              className={fieldClass}
            />
          </div>
        </FormSection>

        <div className="flex justify-center empty:hidden">
          <FormTurnstile
            id="turnstile-contact"
            turnstileRef={turnstileRef}
            onToken={setTurnstileToken}
            appearance="interaction-only"
          />
        </div>

        {error && <FormError>{error}</FormError>}

        <div className="flex justify-center">
          <SubmitButton submitting={submitting} icon={<Send className="h-4 w-4" />}>
            Talk to a Specialist
          </SubmitButton>
        </div>
      </div>
    </form>
  )
}

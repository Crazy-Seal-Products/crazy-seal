'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send, Loader2 } from 'lucide-react'
import { Input, Textarea, Select, Button } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'
import { trackMetaEvent, generateEventId, pushDedupEventId } from '@/lib/tracking/meta-pixel'
import { PhotoUploadField, uploadPhotos } from '@/components/forms/PhotoUploadField'

interface ContactFormProps {
  sourcePage?: string
}

const RV_LENGTHS = Array.from({ length: 38 }, (_, i) => `${i + 8}`)

const SQ_FT_RANGES = Array.from({ length: 15 }, (_, i) => `${i * 100}-${(i + 1) * 100} SQ FT`)

export function ContactForm({ sourcePage = 'contact' }: ContactFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [projectType, setProjectType] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const { visitorId, sessionId, trackEvent, identify } = useTracking()

  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

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

      router.push('/thank-you')
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
      <div className="space-y-6">
        <div aria-hidden="true" className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Warm intro */}
        <p className="text-gray-600 text-[15px] leading-relaxed">
          Whether you have a question, want help building the perfect kit, or
          just want to talk roofing — fill out the form below and our team will
          be in touch shortly!
        </p>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Name <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input name="first_name" size="lg" required />
              <span className="block text-xs text-gray-400 mt-1.5 ml-1">First</span>
            </div>
            <div>
              <Input name="last_name" size="lg" required />
              <span className="block text-xs text-gray-400 mt-1.5 ml-1">Last</span>
            </div>
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Phone <span className="text-red-500">*</span>
            </label>
            <Input name="phone" size="lg" type="tel" placeholder="(555) 123-4567" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Email <span className="text-red-500">*</span>
            </label>
            <Input name="email" size="lg" type="email" placeholder="john@example.com" required />
          </div>
        </div>

        {/* Project type + conditional size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What best describes your project type? <span className="text-red-500">*</span>
            </label>
            <Select
              name="project_type"
              size="lg"
              required
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              placeholder="Please Select"
              options={[
                { value: 'RV Roof', label: 'RV Roof' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </div>
          {projectType === 'RV Roof' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How long is your RV? (FT) <span className="text-red-500">*</span>
              </label>
              <Select
                name="rv_length"
                size="lg"
                required
                placeholder="Please Select"
                options={RV_LENGTHS.map(l => ({ value: l, label: `${l} FT` }))}
              />
            </div>
          )}
          {projectType === 'Other' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What is the approximate square footage of your application? <span className="text-red-500">*</span>
              </label>
              <Select
                name="square_footage"
                size="lg"
                required
                placeholder="Please Select"
                options={SQ_FT_RANGES.map(r => ({ value: r, label: r }))}
              />
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <PhotoUploadField
          label="If you would like to share photos, you can upload them here."
          files={photoFiles}
          onChange={setPhotoFiles}
        />

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Please add a quick note about your application so we can best assist you.
          </label>
          <Textarea
            name="message"
            placeholder="Tell us about your roof, any questions you have, or just say hi!"
            rows={4}
            className="text-base px-5 py-4"
          />
        </div>

        <div className="flex justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={handleTurnstileSuccess}
            onExpire={() => setTurnstileToken(null)}
            options={{ theme: 'light', size: 'normal' }}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex justify-center pt-2">
          <Button type="submit" variant="primary" size="lg" disabled={submitting || !turnstileToken}>
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

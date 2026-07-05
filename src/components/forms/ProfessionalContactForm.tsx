'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send, Loader2 } from 'lucide-react'
import { Input, Textarea, Select, Button } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'
import { trackMetaEvent, generateEventId, pushDedupEventId } from '@/lib/tracking/meta-pixel'
import { PhotoUploadField, uploadPhotos } from '@/components/forms/PhotoUploadField'

interface ProfessionalContactFormProps {
  sourcePage?: string
}

const BUSINESS_TYPES = [
  'Dealership / Service Center',
  'Mobile Technician',
  'Sole Proprietor',
  'Other Business Type',
]

export function ProfessionalContactForm({
  sourcePage = 'professionals',
}: ProfessionalContactFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
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
      business_name: formData.get('business_name') as string,
      business_type: formData.get('business_type') as string,
      lead_type: 'business',
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
          <label htmlFor="pro-website">Website</label>
          <input type="text" id="pro-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <p className="text-gray-600 text-[15px] leading-relaxed">
          We&apos;d love to have a conversation about your business to see how
          we can work together to increase your profits. Fill out the form
          below and a Crazy Seal specialist will reach out shortly!
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

        {/* Business name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Business / Dealership Name (If Applicable)
          </label>
          <Input name="business_name" size="lg" />
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

        {/* Business type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            What best describes your business type? <span className="text-red-500">*</span>
          </label>
          <Select
            name="business_type"
            size="lg"
            required
            placeholder="Please Select"
            options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
          />
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
            Please add a quick note about your business so we can best assist you.
          </label>
          <Textarea
            name="message"
            placeholder="Tell us about your business, how many roofs you service, or any questions you have!"
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
                Start a Conversation
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

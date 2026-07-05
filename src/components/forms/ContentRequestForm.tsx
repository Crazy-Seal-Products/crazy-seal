'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send, Loader2 } from 'lucide-react'
import { Input, Textarea, Button } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'
import { trackMetaEvent, generateEventId, pushDedupEventId } from '@/lib/tracking/meta-pixel'
import { PhotoUploadField, uploadPhotos } from '@/components/forms/PhotoUploadField'

interface ContentRequestFormProps {
  sourcePage?: string
}

export function ContentRequestForm({
  sourcePage = 'business-accelerator-program',
}: ContentRequestFormProps) {
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

    const fileLink = (formData.get('file_link') as string || '').trim()
    const description = (formData.get('message') as string || '').trim()
    const message = [
      'Content / feature request from the Business Accelerator Program page.',
      fileLink ? `File link: ${fileLink}` : null,
      description,
    ]
      .filter(Boolean)
      .join('\n\n')

    // Shared id so the browser Pixel event and the server-side CAPI event
    // (sent from /api/leads) are deduplicated by Meta.
    const eventId = generateEventId()

    const body = {
      name: fullName,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      lead_type: 'business',
      photo_url: photo_urls[0] || undefined,
      photo_urls: photo_urls.length > 0 ? photo_urls : undefined,
      message,
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
          <label htmlFor="content-request-website">Website</label>
          <input
            type="text"
            id="content-request-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

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

        {/* Cloud file link */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Google Drive | Dropbox | Cloud File Link
          </label>
          <Input
            name="file_link"
            size="lg"
            type="url"
            placeholder="https://drive.google.com/..."
          />
        </div>

        {/* File uploads */}
        <PhotoUploadField
          label="If you would like to share files or photos, you can upload them here."
          files={photoFiles}
          onChange={setPhotoFiles}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Please describe the content or feature that would support you in
            your business. <span className="text-red-500">*</span>
          </label>
          <Textarea
            name="message"
            placeholder="Tell us what marketing materials, sales resources, or features would help you close more deals!"
            rows={4}
            required
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
                Submit Request
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send, Loader2, Upload, X } from 'lucide-react'
import { Input, Textarea, Select, Button } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'
import { trackMetaEvent, generateEventId, pushDedupEventId } from '@/lib/tracking/meta-pixel'

interface ContactFormProps {
  sourcePage?: string
}

const ROOF_TYPES = [
  { value: '', label: 'Select roof type...' },
  { value: 'rubber', label: 'Rubber Membrane (EPDM)' },
  { value: 'fiberglass', label: 'Fiberglass' },
  { value: 'tpo', label: 'TPO' },
  { value: 'metal', label: 'Metal / Aluminum' },
  { value: 'unknown', label: 'Unknown' },
]

const US_STATES = [
  { value: '', label: 'Select state...' },
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
]


export function ContactForm({ sourcePage = 'contact' }: ContactFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const { visitorId, sessionId, trackEvent, identify } = useTracking()

  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files).filter(f => f.type.startsWith('image/'))
    setPhotoFiles(prev => [...prev, ...incoming])
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    let photo_urls: string[] = []
    if (photoFiles.length > 0) {
      try {
        const uploadData = new FormData()
        for (const file of photoFiles) {
          uploadData.append('files', file)
        }
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        })
        if (uploadRes.ok) {
          const { urls } = await uploadRes.json()
          photo_urls = urls || []
        }
      } catch {
        // Photo upload failed -- continue without photos
      }
    }

    const firstName = (formData.get('first_name') as string || '').trim()
    const lastName = (formData.get('last_name') as string || '').trim()
    const fullName = `${firstName} ${lastName}`.trim()

    if (!turnstileToken) {
      setError('Please complete the verification check.')
      setSubmitting(false)
      return
    }

    // Shared id so the browser Pixel event and the server-side CAPI event
    // (sent from /api/leads) are deduplicated by Meta.
    const eventId = generateEventId()

    const body = {
      name: fullName,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      street_address: formData.get('street_address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip_code: formData.get('zip_code') as string,
      rv_year: formData.get('rv_year') as string,
      rv_make: formData.get('rv_make') as string,
      rv_model: formData.get('rv_model') as string,
      rv_length: formData.get('rv_length') as string,
      roof_type: formData.get('roof_type') as string,
      has_roof_damage: formData.get('has_roof_damage') === 'yes',
      texting_consent: formData.get('texting_consent') === 'on',
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
      <div className="space-y-8">
        <div aria-hidden="true" className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Warm intro */}
        <p className="text-gray-600 text-[15px] leading-relaxed">
          Please fill out the information about your RV below and we will be in touch with you shortly!
          We promise to be fun, informative, and will do our very best to help you.
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

        {/* Street Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Street Address (Not required but helpful)
          </label>
          <Input name="street_address" size="lg" />
          <span className="block text-xs text-gray-400 mt-1.5 ml-1">Street Address</span>
        </div>

        {/* City, State, Zip */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            City, State, Zip Code (Required) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input name="city" size="lg" required />
              <span className="block text-xs text-gray-400 mt-1.5 ml-1">City</span>
            </div>
            <div>
              <Select name="state" size="lg" options={US_STATES} required />
              <span className="block text-xs text-gray-400 mt-1.5 ml-1">State</span>
            </div>
          </div>
          <div className="mt-4 max-w-[calc(50%-0.5rem)]">
            <Input name="zip_code" size="lg" required />
            <span className="block text-xs text-gray-400 mt-1.5 ml-1">ZIP Code</span>
          </div>
        </div>

        {/* RV Info - softer transition */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 mb-6">
            Tell us a bit about your RV so we can give you the best estimate.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Input name="rv_year" size="lg" placeholder="2020" />
              <span className="block text-xs text-gray-400 mt-1.5 ml-1">Year</span>
            </div>
            <div>
              <Input name="rv_make" size="lg" placeholder="Jayco" />
              <span className="block text-xs text-gray-400 mt-1.5 ml-1">Make</span>
            </div>
            <div>
              <Input name="rv_model" size="lg" placeholder="Eagle" />
              <span className="block text-xs text-gray-400 mt-1.5 ml-1">Model</span>
            </div>
            <div>
              <Input name="rv_length" size="lg" type="number" placeholder="32" required />
              <span className="block text-xs text-gray-400 mt-1.5 ml-1">Length (ft) <span className="text-red-500">*</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What type of RV roof do you have? <span className="text-red-500">*</span>
              </label>
              <Select name="roof_type" size="lg" options={ROOF_TYPES} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Do you have roof damage or an existing leak? <span className="text-red-500">*</span>
              </label>
              <Select
                name="has_roof_damage"
                size="lg"
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
                required
              />
            </div>
          </div>
        </div>

        {/* Photo Upload - drag & drop */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Roof Photos (optional)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`
              w-full rounded-xl border-2 border-dashed cursor-pointer transition-colors
              ${dragging
                ? 'border-[#003365] bg-blue-50'
                : 'border-gray-300 hover:border-[#003365] hover:bg-gray-50'
              }
            `}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Upload className={`w-8 h-8 mb-2 ${dragging ? 'text-[#003365]' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600">
                Drag and drop your roof photos here, or <span className="text-[#003365] font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, or HEIC</p>
            </div>
          </div>

          {photoFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {photoFiles.map((file, i) => (
                <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Roof photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(i) }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Anything else you&apos;d like us to know?
          </label>
          <Textarea
            name="message"
            placeholder="Tell us about your RV roof situation, any questions you have, or just say hi!"
            rows={4}
            className="text-base px-5 py-4"
          />
        </div>

        {/* Texting Consent */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="texting_consent"
            className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#003365] focus:ring-[#003365]"
          />
          <span className="text-sm text-gray-500 leading-relaxed">
            I agree to receive text messages from RV Armor about my quote request. Message and data rates may apply. Reply STOP to opt out.
          </span>
        </label>

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
                Get My Free Quote
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

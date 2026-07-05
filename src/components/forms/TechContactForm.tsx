'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'
import { Input, Textarea, Select, Button, Stack } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'
import { trackMetaEvent, generateEventId, pushDedupEventId } from '@/lib/tracking/meta-pixel'

interface TechContactFormProps {
  sourcePage?: string
}

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

export function TechContactForm({ sourcePage = 'techs' }: TechContactFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { visitorId, sessionId, trackEvent, identify } = useTracking()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    // Shared id so the browser Pixel event and the server-side CAPI event
    // (sent from /api/tech-leads) are deduplicated by Meta.
    const eventId = generateEventId()

    const body = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      street_address: formData.get('street_address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip_code: formData.get('zip_code') as string,
      experience: formData.get('experience') as string,
      visitor_id: visitorId,
      session_id: sessionId,
      event_id: eventId,
    }

    try {
      const res = await fetch('/api/tech-leads', {
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
        firstName: body.first_name,
        lastName: body.last_name,
        phone: body.phone,
      })

      // Browser Pixel Schedule — shares event_id with the server CAPI event.
      trackMetaEvent('Schedule', { content_name: sourcePage }, eventId)

      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'tech_lead_submission',
          form_source: sourcePage,
          conversion_type: 'schedule',
          event_id: eventId,
        })
      } else {
        pushDedupEventId('tech_lead_submission', eventId)
      }

      router.push('/tech-application')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-3">Contact Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="first_name" label="First Name" placeholder="John" required />
            <Input name="last_name" label="Last Name" placeholder="Smith" required />
            <Input name="phone" label="Phone" type="tel" placeholder="(555) 123-4567" required />
            <Input name="email" label="Email" type="email" placeholder="john@example.com" required />
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-3">Location</legend>
          <div className="grid grid-cols-1 gap-4">
            <Input name="street_address" label="Street Address (Not required but helpful)" placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            <Input name="city" label="City" placeholder="Orlando" required />
            <Select name="state" label="State" options={US_STATES} required />
            <Input name="zip_code" label="ZIP Code" placeholder="12345" required />
          </div>
        </fieldset>

        <Textarea
          name="experience"
          label="Please describe your experience and why you may be a good fit for the RV Armor family."
          placeholder="Tell us about your relevant experience..."
          rows={5}
          required
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex justify-center pt-2">
          <Button type="submit" variant="primary" className="rounded-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </Stack>
    </form>
  )
}

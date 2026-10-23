'use client'

import React, { useState, useRef } from 'react'
import { type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send } from 'lucide-react'
import { Input, Textarea } from '@/lib/design-system'
import { PhotoUploadField, uploadPhotos } from '@/components/forms/PhotoUploadField'
import { FormTurnstile } from '@/components/forms/FormTurnstile'
import {
  FieldLabel,
  FormError,
  FormSection,
  FormSuccess,
  SubmitButton,
  fieldClass,
} from '@/components/forms/form-ui'

export function WarrantyClaimForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

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

    try {
      const photo_urls = await uploadPhotos(photoFiles, 'warranty')
      const firstName = (formData.get('first_name') as string || '').trim()
      const lastName = (formData.get('last_name') as string || '').trim()

      const body = {
        name: `${firstName} ${lastName}`.trim(),
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        order_number: formData.get('order_number') as string,
        failure_description: formData.get('failure_description') as string,
        photo_urls,
        turnstile_token: turnstileToken,
        website: formData.get('website') as string,
      }

      const res = await fetch('/api/warranty/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to submit. Please try again.')
      }

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
      <FormSuccess title="Claim Received!">
        <p>
          We&apos;re sorry you&apos;re having an issue. Our team will be in touch
          as soon as possible to make it right.
        </p>
      </FormSuccess>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3.5">
        <div aria-hidden="true" className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
          <label htmlFor="wc-website">Website</label>
          <input type="text" id="wc-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <FormSection step={1} title="Your details">
          <div className="grid grid-cols-2 gap-3">
            <Input name="first_name" size="md" required placeholder="First name *" aria-label="First name" autoComplete="given-name" className={fieldClass} />
            <Input name="last_name" size="md" required placeholder="Last name *" aria-label="Last name" autoComplete="family-name" className={fieldClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input name="phone" size="md" type="tel" required placeholder="Phone *" aria-label="Phone" autoComplete="tel" className={fieldClass} />
            <Input name="email" size="md" type="email" required placeholder="Email *" aria-label="Email" autoComplete="email" className={fieldClass} />
          </div>

          <div>
            <FieldLabel>Order number (optional)</FieldLabel>
            <Input name="order_number" size="md" className={fieldClass} />
          </div>
        </FormSection>

        <FormSection step={2} title="The issue">
          <div>
            <FieldLabel required>Notes</FieldLabel>
            <Textarea name="failure_description" rows={3} required className={fieldClass} />
          </div>

          <PhotoUploadField
            label="Photos (optional)"
            files={photoFiles}
            onChange={setPhotoFiles}
          />
        </FormSection>

        <div className="flex justify-center empty:hidden">
          <FormTurnstile
            id="turnstile-warranty-claim"
            turnstileRef={turnstileRef}
            onToken={setTurnstileToken}
            appearance="interaction-only"
          />
        </div>

        {error && <FormError>{error}</FormError>}

        <div className="flex justify-center">
          <SubmitButton submitting={submitting} icon={<Send className="h-4 w-4" />}>
            Submit Claim
          </SubmitButton>
        </div>
      </div>
    </form>
  )
}

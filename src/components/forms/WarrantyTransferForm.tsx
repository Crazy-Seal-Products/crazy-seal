'use client'

import React, { useState, useRef } from 'react'
import { type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send } from 'lucide-react'
import { Input, Textarea } from '@/lib/design-system'
import { FormTurnstile } from '@/components/forms/FormTurnstile'
import {
  FieldLabel,
  FormError,
  FormSection,
  FormSuccess,
  SubmitButton,
  fieldClass,
} from '@/components/forms/form-ui'

export function WarrantyTransferForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

    const firstName = (formData.get('first_name') as string || '').trim()
    const lastName = (formData.get('last_name') as string || '').trim()

    const body = {
      new_owner_name: `${firstName} ${lastName}`.trim(),
      new_owner_email: formData.get('email') as string,
      new_owner_phone: formData.get('phone') as string,
      original_owner_email: formData.get('original_owner_email') as string,
      order_number: formData.get('order_number') as string,
      transfer_notes: formData.get('transfer_notes') as string,
      turnstile_token: turnstileToken,
      website: formData.get('website') as string,
    }

    try {
      const res = await fetch('/api/warranty/transfer/', {
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
      <FormSuccess title="Transfer Request Received!">
        <p>
          Our team will process your warranty transfer and reach out if we need
          any additional information.
        </p>
      </FormSuccess>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3.5">
        <div aria-hidden="true" className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
          <label htmlFor="wt-website">Website</label>
          <input type="text" id="wt-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <FormSection step={1} title="New owner">
          <div className="grid grid-cols-2 gap-3">
            <Input name="first_name" size="md" required placeholder="First name *" aria-label="First name" autoComplete="given-name" className={fieldClass} />
            <Input name="last_name" size="md" required placeholder="Last name *" aria-label="Last name" autoComplete="family-name" className={fieldClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input name="phone" size="md" type="tel" required placeholder="Phone *" aria-label="Phone" autoComplete="tel" className={fieldClass} />
            <Input name="email" size="md" type="email" required placeholder="Email *" aria-label="Email" autoComplete="email" className={fieldClass} />
          </div>
        </FormSection>

        <FormSection step={2} title="Original purchase">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Order Number</FieldLabel>
              <Input name="order_number" size="md" required className={fieldClass} />
            </div>
            <div>
              <FieldLabel required>Email of Original Owner</FieldLabel>
              <Input name="original_owner_email" size="md" type="email" required className={fieldClass} />
            </div>
          </div>

          <div>
            <FieldLabel>Notes (optional)</FieldLabel>
            <Textarea name="transfer_notes" rows={3} className={fieldClass} />
          </div>
        </FormSection>

        <div className="flex justify-center empty:hidden">
          <FormTurnstile
            id="turnstile-warranty-transfer"
            turnstileRef={turnstileRef}
            onToken={setTurnstileToken}
            appearance="interaction-only"
          />
        </div>

        {error && <FormError>{error}</FormError>}

        <div className="flex justify-center">
          <SubmitButton submitting={submitting} icon={<Send className="h-4 w-4" />}>
            Submit Transfer Request
          </SubmitButton>
        </div>
      </div>
    </form>
  )
}

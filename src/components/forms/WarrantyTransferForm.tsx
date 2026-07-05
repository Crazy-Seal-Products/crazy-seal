'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { Input, Textarea, Button } from '@/lib/design-system'

export function WarrantyTransferForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

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
      const res = await fetch('/api/warranty/transfer', {
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
      <div className="text-center py-12">
        <CheckCircle className="w-14 h-14 text-accent mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-primary mb-2">Transfer Request Received!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Our team will process your warranty transfer and reach out if we need
          any additional information.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div aria-hidden="true" className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
          <label htmlFor="wt-website">Website</label>
          <input type="text" id="wt-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Name (New Owner) <span className="text-red-500">*</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Phone <span className="text-red-500">*</span>
            </label>
            <Input name="phone" size="lg" type="tel" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Email <span className="text-red-500">*</span>
            </label>
            <Input name="email" size="lg" type="email" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Order Number <span className="text-red-500">*</span>
            </label>
            <Input name="order_number" size="lg" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Email of Original Owner <span className="text-red-500">*</span>
            </label>
            <Input name="original_owner_email" size="lg" type="email" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Please add a quick note describing the warranty transfer situation.
          </label>
          <Textarea name="transfer_notes" rows={4} />
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
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
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
                Submit Transfer Request
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

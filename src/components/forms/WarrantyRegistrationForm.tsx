'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { Input, Textarea, Select, Button } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'
import { PhotoUploadField, uploadPhotos } from '@/components/forms/PhotoUploadField'

const RV_LENGTHS = Array.from({ length: 38 }, (_, i) => `${i + 8}`)

export function WarrantyRegistrationForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [projectType, setProjectType] = useState('')
  const [installType, setInstallType] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const { visitorId, sessionId, trackEvent } = useTracking()

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

    if (photoFiles.length < 2) {
      setError('Please upload before AND after photos of your application.')
      setSubmitting(false)
      return
    }

    const photo_urls = await uploadPhotos(photoFiles, 'warranty')
    if (!photo_urls.length) {
      setError('Photo upload failed. Please try again.')
      setSubmitting(false)
      return
    }

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
      experience_notes: formData.get('experience_notes') as string,
      contractor_notes: formData.get('contractor_notes') as string,
      warranty_consent: formData.get('warranty_consent') === 'on',
      photo_display_consent: formData.get('photo_display_consent') === 'on',
      visitor_id: visitorId,
      session_id: sessionId,
      turnstile_token: turnstileToken,
      website: formData.get('website') as string,
    }

    try {
      const res = await fetch('/api/warranty/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to submit. Please try again.')
      }

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
      <div className="text-center py-12">
        <CheckCircle className="w-14 h-14 text-accent mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-primary mb-2">Congratulations!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Your warranty registration has been received. Your application is
          covered for 50 years! A confirmation email is on its way.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div aria-hidden="true" className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
          <label htmlFor="wr-website">Website</label>
          <input type="text" id="wr-website" name="website" tabIndex={-1} autoComplete="off" />
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
            <Input name="phone" size="lg" type="tel" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Email <span className="text-red-500">*</span>
            </label>
            <Input name="email" size="lg" type="email" required />
          </div>
        </div>

        {/* Customer details + Order number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Customer Details (Business Name, Etc.)
            </label>
            <Input name="customer_details" size="lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Order Number <span className="text-red-500">*</span>
            </label>
            <Input name="order_number" size="lg" required />
          </div>
        </div>

        {/* Project type */}
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
              <Input name="square_footage" size="lg" type="number" min={0} required />
            </div>
          )}
        </div>

        {/* Install type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            How was your kit installed? <span className="text-red-500">*</span>
          </label>
          <Select
            name="install_type"
            size="lg"
            required
            value={installType}
            onChange={(e) => setInstallType(e.target.value)}
            placeholder="Please Select"
            options={[
              { value: 'diy', label: 'Self installed (DIY)' },
              { value: 'contractor', label: 'Installed by a dealer / contractor / handyman' },
            ]}
          />
        </div>

        {installType === 'contractor' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Installer&apos;s Name</label>
              <Input name="installer_name" size="lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Installer&apos;s Phone Number</label>
              <Input name="installer_phone" size="lg" type="tel" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Installer&apos;s Email</label>
              <Input name="installer_email" size="lg" type="email" />
            </div>
          </div>
        )}

        {/* Photos */}
        <PhotoUploadField
          label={<>Please upload before &amp; after images of your application <span className="text-red-500">*</span></>}
          hint="Both before AND after photos are required for warranty coverage."
          files={photoFiles}
          onChange={setPhotoFiles}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Please add a quick note about your experience with Crazy Seal <span className="text-red-500">*</span>
          </label>
          <Textarea name="experience_notes" rows={3} required />
        </div>

        {installType === 'contractor' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Contractor Notes</label>
            <Textarea name="contractor_notes" rows={3} />
          </div>
        )}

        {/* Consents */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="warranty_consent"
            required
            className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#003365] focus:ring-[#003365]"
          />
          <span className="text-sm text-gray-500 leading-relaxed">
            I confirm that my application was installed according to the Crazy Seal
            installation guidelines and I agree to the warranty terms and conditions. <span className="text-red-500">*</span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="photo_display_consent"
            defaultChecked
            className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#003365] focus:ring-[#003365]"
          />
          <span className="text-sm text-gray-500 leading-relaxed">
            We love showing off your work! Leave this box checked to allow us to
            display your photos on our website and social media.
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
                Register My Warranty
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

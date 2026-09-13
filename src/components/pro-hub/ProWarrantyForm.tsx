'use client'

import React, { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, Send, Star } from 'lucide-react'
import { Input, Textarea, Select, Button } from '@/lib/design-system'
import { PhotoUploadField, uploadPhotos } from '@/components/forms/PhotoUploadField'

const RV_LENGTHS = Array.from({ length: 38 }, (_, i) => `${i + 8}`)

interface OrderOption {
  name: string
  hasWarranty: boolean
}

export function ProWarrantyForm({
  installerName,
  installerPhone,
  installerEmail,
}: {
  installerName: string
  installerPhone: string
  installerEmail: string
}) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-400">Loading form…</p>}>
      <ProWarrantyFormInner
        installerName={installerName}
        installerPhone={installerPhone}
        installerEmail={installerEmail}
      />
    </Suspense>
  )
}

function ProWarrantyFormInner({
  installerName,
  installerPhone,
  installerEmail,
}: {
  installerName: string
  installerPhone: string
  installerEmail: string
}) {
  const params = useSearchParams()
  const presetOrder = params.get('order') || ''
  const [orders, setOrders] = useState<OrderOption[]>([])
  const [orderNumber, setOrderNumber] = useState(presetOrder)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [beforeFiles, setBeforeFiles] = useState<File[]>([])
  const [afterFiles, setAfterFiles] = useState<File[]>([])
  const [projectType, setProjectType] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    fetch('/api/pro/orders/')
      .then((r) => r.json())
      .then((json) => {
        const list: OrderOption[] = (json.orders || []).map((o: { name: string; hasWarranty: boolean }) => ({
          name: o.name,
          hasWarranty: o.hasWarranty,
        }))
        setOrders(list)
        if (!presetOrder && list.length) {
          const open = list.find((o) => !o.hasWarranty)
          if (open) setOrderNumber(open.name)
        }
      })
      .catch(() => {})
  }, [presetOrder])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      if (!beforeFiles.length || !afterFiles.length) {
        setError('Please upload at least one before photo and one after photo.')
        return
      }
      if (!rating) {
        setError('Please rate your experience with Crazy Seal.')
        return
      }
      const [before_photo_urls, after_photo_urls] = await Promise.all([
        uploadPhotos(beforeFiles, 'warranty'),
        uploadPhotos(afterFiles, 'warranty'),
      ])
      if (!before_photo_urls.length || !after_photo_urls.length) {
        setError('Photo upload failed. Please try a smaller JPEG or PNG.')
        return
      }
      const firstName = (formData.get('first_name') as string || '').trim()
      const lastName = (formData.get('last_name') as string || '').trim()
      const body = {
        name: `${firstName} ${lastName}`.trim(),
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        customer_details: formData.get('customer_details') as string,
        order_number: orderNumber,
        project_type: projectType,
        rv_length: formData.get('rv_length') as string,
        square_footage: formData.get('square_footage') as string,
        installer_name: formData.get('installer_name') as string,
        installer_phone: formData.get('installer_phone') as string,
        installer_email: formData.get('installer_email') as string,
        before_photo_urls,
        after_photo_urls,
        rating,
        experience_notes: formData.get('experience_notes') as string,
        contractor_notes: formData.get('contractor_notes') as string,
        warranty_consent: formData.get('warranty_consent') === 'on',
        photo_display_consent: formData.get('photo_display_consent') === 'on',
      }
      const res = await fetch('/api/pro/warranty/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'Failed to submit.')
      if (data?.certificate_url) setCertificateUrl(data.certificate_url)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10 bg-white border border-gray-200 rounded-2xl">
        <CheckCircle className="w-14 h-14 text-[#5BA411] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-[#003365] mb-2">Warranty filed</h3>
        <p className="text-gray-600 max-w-md mx-auto text-sm">
          The owner will get a confirmation email with their 50-year certificate.
        </p>
        {certificateUrl && (
          <a
            href={certificateUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#003365] text-white font-semibold rounded-lg"
          >
            View certificate
          </a>
        )}
      </div>
    )
  }

  const optionNames = new Set(orders.filter((o) => !o.hasWarranty || o.name === orderNumber).map((o) => o.name))
  if (orderNumber) optionNames.add(orderNumber)
  const selectOptions = [...optionNames].map((name) => ({ value: name, label: name }))
  const useSelect = selectOptions.length > 0

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 space-y-6">
      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
        You are filing on behalf of the <strong>RV / roof owner</strong>. The certificate goes to them. Your installer info is filled in below.
      </p>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Order number <span className="text-red-500">*</span></label>
        {useSelect ? (
          <Select
            name="order_select"
            size="lg"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Choose an order"
            options={selectOptions}
          />
        ) : (
          <Input
            name="order_number_fallback"
            size="lg"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="#1234"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Owner&apos;s name <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input name="first_name" size="lg" required />
            <span className="block text-xs text-gray-400 mt-1.5">First</span>
          </div>
          <div>
            <Input name="last_name" size="lg" required />
            <span className="block text-xs text-gray-400 mt-1.5">Last</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Owner&apos;s phone <span className="text-red-500">*</span></label>
          <Input name="phone" size="lg" type="tel" required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Owner&apos;s email <span className="text-red-500">*</span></label>
          <Input name="email" size="lg" type="email" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Customer details (business name, job notes)</label>
        <Input name="customer_details" size="lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Project type <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">RV length (FT) <span className="text-red-500">*</span></label>
            <Select name="rv_length" size="lg" required placeholder="Please Select" options={RV_LENGTHS.map((l) => ({ value: l, label: `${l} FT` }))} />
          </div>
        )}
        {projectType === 'Other' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Approximate square footage <span className="text-red-500">*</span></label>
            <Input name="square_footage" size="lg" type="number" min={0} required />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Installer name</label>
          <Input name="installer_name" size="lg" defaultValue={installerName} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Installer phone</label>
          <Input name="installer_phone" size="lg" type="tel" defaultValue={installerPhone} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Installer email</label>
          <Input name="installer_email" size="lg" type="email" defaultValue={installerEmail} />
        </div>
      </div>

      <PhotoUploadField
        label={<>Before photos <span className="text-red-500">*</span></>}
        hint="Roof before Crazy Seal. JPG, PNG, or HEIC."
        inputLabel="Upload before photos"
        files={beforeFiles}
        onChange={setBeforeFiles}
      />
      <PhotoUploadField
        label={<>After photos <span className="text-red-500">*</span></>}
        hint="Finished roof. JPG, PNG, or HEIC."
        inputLabel="Upload after photos"
        files={afterFiles}
        onChange={setAfterFiles}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Rate this Crazy Seal job <span className="text-red-500">*</span></label>
        <div className="flex items-center gap-1" role="radiogroup" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoverRating || rating)
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} stars`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                className="p-1"
              >
                <Star className={`w-8 h-8 ${active ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Notes about this job <span className="text-red-500">*</span></label>
        <Textarea name="experience_notes" rows={3} required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Contractor notes (optional)</label>
        <Textarea name="contractor_notes" rows={3} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="warranty_consent" required className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#003365]" />
        <span className="text-sm text-gray-500">Installed per Crazy Seal guidelines. I agree to the warranty terms. <span className="text-red-500">*</span></span>
      </label>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="photo_display_consent" defaultChecked className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#003365]" />
        <span className="text-sm text-gray-500">Allow Crazy Seal to show these photos on the website and social media.</span>
      </label>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <Button type="submit" variant="accent" size="lg" disabled={submitting || !orderNumber}>
        {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting…</> : <><Send className="w-5 h-5 mr-2" /> Register this warranty</>}
      </Button>
    </form>
  )
}

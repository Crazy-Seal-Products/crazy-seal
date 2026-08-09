import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { verifyCertificateToken } from '@/lib/warranty/certificate'
import { PrintButton } from './PrintButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Warranty Certificate | Crazy Seal',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}

interface Registration {
  id: string
  name: string
  email: string
  phone: string | null
  customer_details: string | null
  order_number: string | null
  install_type: string | null
  installer_name: string | null
  installer_phone: string | null
  installer_email: string | null
  photo_urls: string[] | null
  created_at: string
}

/** Staff logged into the admin panel may view any certificate without a token. */
async function isStaffRequest(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const admin = createAdminClient()
    const { data: staff } = await admin
      .from('staff')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single()
    return Boolean(staff)
  } catch {
    return false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 whitespace-pre-wrap">{value}</p>
    </div>
  )
}

export default async function WarrantyCertificatePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { t } = await searchParams

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(id)) notFound()

  if (!verifyCertificateToken(id, t) && !(await isStaffRequest())) {
    notFound()
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('warranty_registrations')
    .select('id, name, email, phone, customer_details, order_number, install_type, installer_name, installer_phone, installer_email, photo_urls, created_at')
    .eq('id', id)
    .single()

  if (!data) notFound()
  const reg = data as Registration

  const certificateNumber = `CS-${reg.id.slice(0, 8).toUpperCase()}`
  const installLabel = reg.install_type === 'diy'
    ? 'Self installed (DIY)'
    : reg.install_type
      ? 'Installed by a dealer / contractor'
      : null
  const installerLine = [reg.installer_name, reg.installer_phone, reg.installer_email]
    .filter(Boolean).join(' · ') || null

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white py-8 px-4 print:p-0">
      <div className="max-w-3xl mx-auto mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none rounded-xl print:rounded-none overflow-hidden border-4 border-double border-[#003365]">
        {/* Header */}
        <div className="bg-[#003365] text-white px-8 py-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-150.png"
            alt="Crazy Seal"
            className="h-14 mx-auto mb-4"
          />
          <p className="text-xs font-semibold tracking-[0.3em] text-blue-200 uppercase mb-1">
            Crazy Seal Products, Inc.
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            50-Year Warranty Certificate
          </h1>
        </div>

        {/* Certificate meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <div className="px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Certificate No.</p>
            <p className="text-sm font-semibold text-gray-900">{certificateNumber}</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Registered On</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(reg.created_at)}</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Coverage</p>
            <p className="text-sm font-semibold text-[#5BA411]">50 Years From Purchase</p>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">
          {/* Registered to */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-[#5BA411] mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">This certifies that the application registered by</p>
            <p className="text-2xl font-bold text-[#003365]">{reg.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              is covered by the Crazy Seal Products, Inc. 50-year warranty against defects in materials.
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-gray-50 print:bg-white rounded-lg print:rounded-none border border-gray-200 p-6">
            <Field label="Order Number" value={reg.order_number} />
            <Field label="Email" value={reg.email} />
            <Field label="Phone" value={reg.phone} />
            <Field label="Installation" value={installLabel} />
            {installerLine && <Field label="Installer" value={installerLine} />}
            {reg.customer_details && (
              <div className="sm:col-span-2">
                <Field label="Project Details" value={reg.customer_details} />
              </div>
            )}
          </div>

          {/* Photos */}
          {reg.photo_urls && reg.photo_urls.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Application Photos on File
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {reg.photo_urls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={`Application photo ${i + 1}`}
                    className="w-full aspect-square object-cover rounded border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Coverage summary */}
          <div className="text-xs text-gray-500 leading-relaxed space-y-2">
            <p>
              This warranty is provided on behalf of Crazy Seal Products, Inc. to customers who
              submit a warranty form for our do-it-yourself roofing products. Crazy Seal Products,
              Inc. warranties its products against defects in materials for 50 years from the date
              of purchase. This warranty is transferable — new owners may submit a transfer form at{' '}
              <span className="font-medium text-gray-700">crazyseal.com/warranty-transfer</span>.
            </p>
            <p>
              Please refer to the warranty terms and conditions provided to you for detailed
              information regarding coverage, limitations, and the claims process. Claims may be
              submitted at <span className="font-medium text-gray-700">crazyseal.com/warranty</span>.
            </p>
          </div>

          {/* Signature */}
          <div className="flex items-end justify-between border-t border-gray-200 pt-6">
            <div>
              <p className="font-serif italic text-2xl text-[#003365]">Crazy Curtis</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                Mascot, Crazy Seal Products, Inc.
              </p>
            </div>
            <div className="text-right text-[10px] text-gray-400 leading-relaxed">
              <p>Crazy Seal Products, Inc.</p>
              <p>4654 E State Road 64 #204, Bradenton, FL 34208</p>
              <p>(800) 963-0131 · info@crazyseal.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

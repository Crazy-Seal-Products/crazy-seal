import Link from 'next/link'
import { PRO_HUB_NAME } from '@/lib/pro/config'

export function ProAuthLayout({
  children,
  subtitle,
}: {
  children: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="min-h-screen bg-[#003365] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/pro/login/" className="w-12 h-12 rounded-xl bg-[#F9EA1C] flex items-center justify-center mb-3">
            <span className="text-[#003365] text-lg font-bold">CS</span>
          </Link>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#F9EA1C] font-bold">Crazy Seal</p>
          <h1 className="text-2xl font-bold text-white mt-1">{PRO_HUB_NAME}</h1>
          <p className="text-sm text-white/70 mt-2">
            {subtitle || 'You\u2019re in. Orders, warranties, and tools in one place.'}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">{children}</div>
      </div>
    </div>
  )
}

export const authInputClass =
  'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#003365] focus:ring-1 focus:ring-[#003365]/20'

export const authPrimaryButtonClass =
  'w-full py-2.5 px-4 bg-[#5BA411] hover:bg-[#4A870E] text-white text-sm font-semibold rounded-lg disabled:opacity-50'

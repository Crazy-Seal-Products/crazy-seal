import Link from 'next/link'
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_TEL } from '@/lib/pro/config'
import { ChangePasswordGate } from '@/components/pro-hub/ChangePasswordCard'

export default function ProPerksPage() {
  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#003365]">Perks &amp; status</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">Why spending stays with Crazy Seal. Rebates are a conversation today — the meter on Home tracks toward the next one.</p>

      <div className="space-y-4">
        <ChangePasswordGate />

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-bold text-[#003365] mb-2">How status works</h2>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
            <li><strong>Member</strong> — anyone with an account. Orders and certificates.</li>
            <li><strong>Pro</strong> — Shopify tag <code>dealer</code>, or staff made you Pro.</li>
            <li><strong>Commercial</strong> — fleet / shop / facility tags.</li>
            <li><strong>High Volume</strong> — five or more Shopify orders, automatic.</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-bold text-[#003365] mb-2">What you already get</h2>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
            <li>No franchise fees and no inventory sitting in the shop</li>
            <li>Fast, free on-demand shipping</li>
            <li>50-year warranty on kits and products</li>
            <li>File warranties for the owner from your order list</li>
          </ul>
        </div>

        <div className="bg-[#003365] text-white rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-widest text-[#F9EA1C] font-bold mb-1">Your Crazy Seal person</p>
          <p className="font-semibold">Questions on a job, a rebate, or a custom kit?</p>
          <p className="text-sm text-white/70 mt-1">M–F 9AM–6PM EST</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="px-4 py-2 rounded-lg bg-[#5BA411] text-sm font-semibold">
              {SUPPORT_PHONE}
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="px-4 py-2 rounded-lg bg-white/10 text-sm font-semibold">
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <Link href="/professionals/#start-a-conversation" className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#5BA411]">
          <p className="font-bold text-[#003365]">Not a Pro yet?</p>
          <p className="text-sm text-gray-500 mt-1">Tell us about your shop. Staff can also invite you from the admin Customers / Pros screen.</p>
        </Link>
      </div>
    </div>
  )
}

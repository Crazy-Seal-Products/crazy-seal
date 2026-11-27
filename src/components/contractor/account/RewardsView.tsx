'use client'

import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { Panel, PanelTitle, ViewHeader, portalButton, portalGhostButton } from '@/components/portal/ui'
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_TEL, type ProStatus } from '@/lib/pro/config'
import { StatusPills } from '@/components/contractor/dashboard/AccountSummary'

/** Status pills and how they're earned, the rebate meter, and what every Pro gets (Pro Hub's Perks page). */
export function RewardsView({
  statuses,
  rebate,
  orderCount,
  memberOnly,
}: {
  statuses: ProStatus[]
  rebate: { current: number; next: number; remaining: number } | null
  orderCount: number
  memberOnly: boolean
}) {
  const pct = rebate?.next ? Math.min(100, Math.round((rebate.current / rebate.next) * 100)) : 100
  return (
    <div>
      <ViewHeader
        kicker="Rewards"
        title="Perks & status"
        description="Why spending stays with Crazy Seal. Rebates are a conversation today; the meter tracks toward the next one."
      >
        <StatusPills statuses={statuses} />
      </ViewHeader>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Your rebate meter</PanelTitle>
          {rebate && rebate.remaining > 0 ? (
            <>
              <p className="text-sm text-white/80">
                {rebate.remaining} more kit {rebate.remaining === 1 ? 'order' : 'orders'} until your next rebate conversation
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-secondary to-highlight" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/45">
                {rebate.current} / {rebate.next} lifetime orders
              </p>
            </>
          ) : (
            <p className="text-sm text-white/70">
              {orderCount} lifetime orders. You’ve passed every milestone; talk to your Crazy Seal person about rebates.
            </p>
          )}
        </Panel>

        <Panel>
          <PanelTitle>How status works</PanelTitle>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <strong className="text-white">Member</strong>: anyone with an account. Orders and certificates.
            </li>
            <li>
              <strong className="text-white">Pro</strong>: tagged a dealer in Crazy Seal’s store, or staff made you Pro.
            </li>
            <li>
              <strong className="text-white">Commercial</strong>: fleet, shop or facility accounts.
            </li>
            <li>
              <strong className="text-white">High Volume</strong>: five or more orders, automatically.
            </li>
          </ul>
        </Panel>

        <Panel>
          <PanelTitle>What you already get</PanelTitle>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-white/75">
            <li>No franchise fees and no inventory sitting in the shop</li>
            <li>Fast, free on-demand shipping</li>
            <li>50-year warranty on kits and products</li>
            <li>File warranties for the owner from your order list</li>
          </ul>
        </Panel>

        <Panel>
          <PanelTitle>Your Crazy Seal person</PanelTitle>
          <p className="text-sm text-white/75">Questions on a job, a rebate, or a custom kit? M–F 9AM–6PM EST.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className={portalButton}>
              <Phone className="h-4 w-4" /> {SUPPORT_PHONE}
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className={portalGhostButton}>
              <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
            </a>
          </div>
        </Panel>
      </div>

      {memberOnly && (
        <Link href="/professionals/#start-a-conversation" className="mt-5 block rounded-3xl border border-white/10 bg-white/[0.035] p-5 hover:border-highlight/40">
          <p className="font-bold">Not a Pro yet?</p>
          <p className="mt-1 text-sm text-white/60">Tell us about your shop and we’ll set you up.</p>
        </Link>
      )}
    </div>
  )
}

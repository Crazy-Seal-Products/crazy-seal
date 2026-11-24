'use client'

import Link from 'next/link'
import { ArrowRight, FileCheck, Package, Phone, RefreshCw, ShieldCheck, ShoppingCart } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { Panel, PanelTitle, StatTile, portalButton, portalGhostButton } from '@/components/portal/ui'
import { PRO_STATUS_LABEL, SUPPORT_PHONE_TEL, type ProStatus } from '@/lib/pro/config'
import type { AccountSummary as Summary } from '@/lib/contractor/account-summary'

const PILL: Record<ProStatus, string> = {
  member: 'bg-white/10 text-white/80 ring-white/15',
  pro: 'bg-secondary/25 text-white ring-secondary/40',
  commercial: 'bg-sky-400/15 text-sky-100 ring-sky-300/30',
  high_volume: 'bg-highlight/20 text-highlight ring-highlight/40',
}

export function StatusPills({ statuses }: { statuses: ProStatus[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((s) => (
        <span key={s} className={twMerge('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ring-1', PILL[s])}>
          {PRO_STATUS_LABEL[s]}
        </span>
      ))}
    </div>
  )
}

function OrderRow({ order }: { order: Summary['recentOrders'][number] }) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{order.name}</p>
        <p className="truncate text-xs text-white/50">
          {new Date(order.createdAt).toLocaleDateString()} · {order.firstItem || 'Kit'}
        </p>
      </div>
      {order.hasWarranty ? (
        <span className="text-[11px] font-bold text-secondary-light">Warranty filed</span>
      ) : (
        <Link href={`/portal/warranties/new/?order=${encodeURIComponent(order.name)}`} className="text-[11px] font-bold text-highlight hover:underline">
          File warranty
        </Link>
      )}
    </li>
  )
}

/**
 * The account side of the portal home (what Pro Hub's home showed): status,
 * orders and warranties, the rebate meter and recent orders. `compact` for a
 * contractor's dashboard, where the company's own numbers come first.
 */
export function AccountSummary({ summary, compact = false }: { summary: Summary; compact?: boolean }) {
  const rebatePct = summary.rebate?.next ? Math.min(100, Math.round((summary.rebate.current / summary.rebate.next) * 100)) : 100
  const orders = compact ? summary.missingOrders : summary.recentOrders

  return (
    <div className="space-y-5">
      {summary.shopifyError && <p className="rounded-xl bg-amber-400/10 px-4 py-3 text-sm text-amber-200 ring-1 ring-amber-300/20">{summary.shopifyError}</p>}

      {!compact && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Orders this year" value={summary.stats.orderCountThisYear} icon={Package} hint={`${summary.stats.orderCount} all time`} />
          <StatTile label="Warranties filed" value={summary.stats.warrantiesFiled} icon={ShieldCheck} delay={0.05} />
          <StatTile
            label="Orders missing a warranty"
            value={summary.stats.warrantiesMissing}
            icon={FileCheck}
            hint={summary.stats.warrantiesMissing ? 'File these from Orders' : 'You’re caught up'}
            delay={0.1}
          />
        </div>
      )}

      <div className={twMerge('grid gap-5', !compact && 'lg:grid-cols-[1.4fr_1fr]')}>
        <Panel>
          <PanelTitle
            action={
              <Link href="/portal/orders/" className="inline-flex items-center gap-1 text-xs font-semibold text-highlight hover:underline">
                All orders <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {compact ? 'Your orders missing a warranty' : 'Recent orders'}
          </PanelTitle>
          {orders.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {orders.map((o) => (
                <OrderRow key={o.name} order={o} />
              ))}
            </ul>
          ) : summary.stats.orderCount === 0 && !summary.shopifyError ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 text-white/30" />
              <p className="text-sm font-semibold">No Shopify orders on this email yet</p>
              <p className="mt-1 text-xs text-white/50">Shop a kit, or ask Crazy Seal to link the email you check out with.</p>
              <Link href="/kit-builder/" className="mt-3 inline-block text-sm font-semibold text-highlight">
                Build a kit
              </Link>
            </div>
          ) : (
            <p className="text-sm text-white/55">Every order has its warranty filed. Nice work.</p>
          )}
        </Panel>

        <div className="space-y-5">
          {summary.rebate && summary.rebate.remaining > 0 && (
            <Panel>
              <PanelTitle>Rebates</PanelTitle>
              <p className="text-sm text-white/80">
                {summary.rebate.remaining} more kit {summary.rebate.remaining === 1 ? 'order' : 'orders'} until your next rebate conversation
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-secondary to-highlight" style={{ width: `${rebatePct}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/45">
                {summary.rebate.current} / {summary.rebate.next} lifetime orders
              </p>
            </Panel>
          )}
          {!compact && (
            <Panel>
              <PanelTitle>Quick actions</PanelTitle>
              <div className="flex flex-wrap gap-2">
                <Link href="/portal/warranties/new/" className={portalButton}>
                  <FileCheck className="h-4 w-4" /> File a warranty
                </Link>
                <Link href="/portal/orders/" className={portalGhostButton}>
                  <ShoppingCart className="h-4 w-4" /> Reorder
                </Link>
                <a href={`tel:${SUPPORT_PHONE_TEL}`} className={portalGhostButton}>
                  <Phone className="h-4 w-4" /> Call Crazy Seal
                </a>
              </div>
            </Panel>
          )}
          {summary.memberOnly && (
            <Link href="/professionals/#start-a-conversation" className="block rounded-3xl bg-gradient-to-br from-primary to-[#15181C] p-5 ring-1 ring-white/10">
              <p className="text-[11px] font-bold uppercase tracking-widest text-highlight">Become a Pro</p>
              <p className="mt-1 font-semibold">Install for customers and unlock filing on their behalf, tools, and volume perks.</p>
              <p className="mt-1 text-sm text-white/60">No franchise fees. No inventory. Tell us about your shop.</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

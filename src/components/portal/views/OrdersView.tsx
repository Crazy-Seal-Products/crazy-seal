'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gift, Package, Percent, ShoppingCart, Truck } from 'lucide-react'
import { TIER_LABELS, nextTier } from '@/lib/portal/accounts'
import { demoOrders } from '@/lib/portal/demo-data'
import { EASE_OUT_EXPO } from '@/components/motion'
import { usePortal } from '../PortalContext'
import { Panel, PanelTitle, ProgressBar, StatTile, StatusPill, ViewHeader, money, portalButton } from '../ui'

const PERKS = [
  { icon: Percent, title: 'Partner pricing', desc: 'Tiered pricing on every kit and product.' },
  { icon: Truck, title: 'Free shipping over $500', desc: 'Straight to your shop or the job site.' },
  { icon: Gift, title: 'Rewards on every order', desc: 'Balance applies to future orders.' },
]

export function OrdersView() {
  const { account } = usePortal()
  const orders = demoOrders(account.id)
  const upcoming = nextTier(account.tier)
  const spend = orders.reduce((n, o) => n + o.total, 0)

  return (
    <>
      <ViewHeader kicker="Orders & Rewards" title="Orders, tier and rewards" description="Everything you’ve ordered and how close you are to your next tier.">
        <Link href="/kit-builder/" className={portalButton}>
          <ShoppingCart className="h-4 w-4" />
          Order a kit
        </Link>
      </ViewHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Orders (90 days)" value={orders.length} icon={Package} />
        <StatTile label="Spend (90 days)" value={spend} prefix="$" icon={ShoppingCart} delay={0.05} />
        <StatTile label="Rewards balance" value={account.metrics.rewardsBalance} prefix="$" icon={Gift} delay={0.1} />
        <StatTile label="Tier progress" value={account.metrics.tierProgress} suffix="%" icon={Percent} delay={0.15} hint={upcoming ? `to ${TIER_LABELS[upcoming]}` : 'Top tier'} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel delay={0.15}>
          <PanelTitle>Recent orders</PanelTitle>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-blue-100/50">No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {orders.map((o, i) => (
                <motion.li
                  key={o.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, ease: EASE_OUT_EXPO }}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-3"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06]">
                    <Package className="h-4.5 w-4.5 text-accent-light" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{o.item}</p>
                    <p className="text-[11px] text-blue-100/50">
                      <span className="font-mono">{o.id}</span> · {o.date}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{money(o.total)}</p>
                  <StatusPill status={o.status} />
                </motion.li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel delay={0.2}>
            <PanelTitle>{TIER_LABELS[account.tier]} tier</PanelTitle>
            <div className="flex items-center justify-between text-xs text-blue-100/60">
              <span>{TIER_LABELS[account.tier]}</span>
              <span>{upcoming ? TIER_LABELS[upcoming] : 'Max'}</span>
            </div>
            <ProgressBar pct={account.metrics.tierProgress} className="mt-2 h-2.5" />
            <p className="mt-3 text-sm text-blue-100/65">
              {upcoming
                ? `You're ${account.metrics.tierProgress}% of the way to ${TIER_LABELS[upcoming]} pricing.`
                : 'You’re at the top tier — thanks for the volume!'}
            </p>
          </Panel>
          <Panel delay={0.25}>
            <PanelTitle>Partner perks</PanelTitle>
            <ul className="space-y-3">
              {PERKS.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-xs text-blue-100/55">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  )
}

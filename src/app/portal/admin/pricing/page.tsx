import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { dateTime, num } from '@/lib/portal/admin/format'
import { listPricingLog } from '@/lib/pricing/log'
import { getPriceBook, getQuoteCatalog, priceBookEditorRows } from '@/lib/pricing/price-book'
import { getPricingSettings } from '@/lib/pricing/settings'
import { listTiers } from '@/lib/pricing/tiers'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge, Empty, ExternalButton, PageHeader, Panel, Stat, StatGrid } from '@/components/portal/admin/ui'
import { PriceBookEditor } from '@/components/portal/admin/pricing/PriceBookEditor'
import { PriceListEditor } from '@/components/portal/admin/pricing/PriceListEditor'
import { SettingsForm } from '@/components/portal/admin/pricing/SettingsForm'
import { TiersEditor } from '@/components/portal/admin/pricing/TiersEditor'

export const metadata: Metadata = { title: 'Pricing' }

function changeText(changes: Record<string, [unknown, unknown]>): string {
  const show = (v: unknown) => (v && typeof v === 'object' ? 'changed' : String(v ?? '—'))
  return Object.entries(changes)
    .map(([k, [a, b]]) => `${k}: ${show(a)} → ${show(b)}`)
    .join('; ')
}

/**
 * How quotes are priced: the price list (2027 retail and project prices,
 * totes, costs, contractor order discounts; with a live margin preview),
 * settings (the live offer and how long it holds, free shipping and freight,
 * capture thresholds, follow-ups, coverage, the public builder switch),
 * tiers, the price book (per-variant overrides) and the log of every change.
 */
export default async function PricingPage() {
  await requirePortalAdmin('pricing')
  const [settings, tiers, book, log, usageRows] = await Promise.all([
    getPricingSettings(),
    listTiers(),
    getPriceBook(),
    listPricingLog(100),
    createAdminClient()
      .from('contractors')
      .select('pricing_tier_id')
      .not('pricing_tier_id', 'is', null)
      .then((r) => r.data ?? []),
  ])
  const catalog = await getQuoteCatalog().catch((err) => {
    console.error('[pricing] catalog load failed', err)
    return null
  })
  const rows = catalog ? priceBookEditorRows(catalog, book, settings.price_list) : []
  const usage: Record<string, number> = {}
  for (const r of usageRows) {
    const id = String(r.pricing_tier_id)
    usage[id] = (usage[id] ?? 0) + 1
  }
  const overrides = rows.filter((r) => r.in_book && (r.material_cost != null || r.markup != null || !r.active)).length
  const list = settings.price_list

  return (
    <>
      <PageHeader
        title="Pricing"
        description={`Quotes price from the price list: retail for RV roofs and roofs under ${list.bands[0]?.minSqft.toLocaleString('en-US') ?? '1,500'} sq ft, project pricing by roof size above, less the single best discount (the live offer, a contractor’s order-count level or tier). Every change is logged.`}
        actions={<ExternalButton href="/quote/">Quote builder{settings.public_builder_live ? '' : ' (preview)'}</ExternalButton>}
      >
        <StatGrid>
          <Stat hero label="Public builder" value={settings.public_builder_live ? 'Live' : 'Off'} sub={settings.public_builder_live ? 'anyone can quote at /quote/' : 'staff preview only'} />
          <Stat label="Live offer" value={`${settings.offer_discount_pct}%`} sub={`held ${settings.offer_hours} h · ${settings.auto_reoffer ? 'auto re-offer on' : 'buyer refreshes'}`} tone="info" />
          <Stat label="Retail Crazy Seal" value={`$${num(list.retail.seal)}/gal`} sub={`project $${list.bands.map((b) => num(b.perGallon)).join(' / ')}`} tone="info" />
          <Stat label="Free shipping" value={`$${num(settings.free_shipping_over)}–$${num(settings.free_shipping_under)}`} sub="freight above" tone="info" />
          <Stat label="Order discounts" value={settings.job_discounts.length ? settings.job_discounts.map((j) => `${j.pct}%`).join(' / ') : 'None'} sub={settings.job_discounts.map((j) => `${j.minOrders}+`).join(' / ') || undefined} tone="dealers" />
          <Stat label="Active tiers" value={num(tiers.filter((t) => t.active).length)} sub={`${num(overrides)} price book override${overrides === 1 ? '' : 's'}`} tone="dealers" />
        </StatGrid>
      </PageHeader>

      <div className="mb-2">
        <Panel
          title="Price list"
          meta={settings.has_price_list ? 'pricing_settings.price_list and job_discounts' : 'Built-in 2027 sheet (migration 036 not applied)'}
          tone="sales"
        >
          <PriceListEditor priceList={settings.price_list} jobDiscounts={settings.job_discounts} offerPct={settings.offer_discount_pct} saved={settings.has_price_list} />
        </Panel>
      </div>

      <div className="grid gap-2 2xl:grid-cols-2">
        <Panel
          title="Settings"
          meta={settings.updated_at ? `Last changed ${dateTime(settings.updated_at)}${settings.updated_by ? ` by ${settings.updated_by}` : ''}` : undefined}
          tone="sales"
        >
          <SettingsForm settings={settings} />
        </Panel>

        <div className="grid content-start gap-2">
          <Panel title="Tiers" meta="Contractor: set on the contractor (e.g. Military 20%). Public: when the full subtotal reaches it. A quote gets the best discount." tone="dealers">
            <TiersEditor tiers={tiers} usage={usage} />
          </Panel>
          <Panel title="Change log" meta={`${log.length} most recent`}>
            {log.length ? (
              <ul className="max-h-[26rem] divide-y divide-adm-line-soft overflow-y-auto">
                {log.map((l) => (
                  <li key={l.id} className="px-3 py-1.5 text-[12.5px]">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={l.subject === 'cost' ? 'gold' : l.subject === 'tier' ? 'info' : 'neutral'}>{l.subject}</Badge>
                      <span className="text-adm-text">{l.summary}</span>
                    </span>
                    <span className="block text-[11px] text-adm-muted">
                      {dateTime(l.at)} · {l.actor_name || l.actor_email || 'Someone'}
                      {l.changes ? ` · ${changeText(l.changes)}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No changes yet.</Empty>
            )}
          </Panel>
        </div>
      </div>

      <div className="mt-2">
        <Panel title="Price book" meta="Optional overrides per variant: off, its own cost, or a fixed price at cost × markup. Save each row." tone="sales">
          {!catalog ? (
            <Empty>Shopify’s catalog couldn’t be read just now. Reload to try again.</Empty>
          ) : rows.length ? (
            <PriceBookEditor rows={rows} />
          ) : (
            <Empty>The builder’s products aren’t in the Shopify catalog.</Empty>
          )}
        </Panel>
      </div>
    </>
  )
}

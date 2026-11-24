import React from 'react'
import { money, pct } from '@/lib/portal/admin/format'
import { shippingCopy } from '@/lib/pricing/engine'
import { discountLabel, type QuoteLine } from '@/lib/pricing/types'
import { KV, Table, TBody, Td, Th, THead, Tr } from '@/components/portal/admin/ui'
import type { QuoteTotals } from '../QuoteLines'

/**
 * A quote's materials and totals in the admin (a saved quote, and the new
 * quote's live preview): list and discounted price per line, and cost and
 * margin only with `showCost` (roles that can open Pricing). Works on the
 * server and in the browser.
 */
export function AdminQuoteLines({ lines, totals, showCost }: { lines: QuoteLine[]; totals: QuoteTotals & { cost_total: number | null }; showCost: boolean }) {
  const merchandise = totals.total - (totals.shipping_total ?? 0)
  const margin = showCost && totals.cost_total != null ? merchandise - totals.cost_total : null
  return (
    <>
      <Table>
        <THead>
          <Th>Material</Th>
          <Th align="right">Qty</Th>
          <Th align="right">List</Th>
          <Th align="right">Price</Th>
          <Th align="right">Line</Th>
          {showCost && <Th align="right">Cost</Th>}
          {showCost && <Th align="right">Margin</Th>}
        </THead>
        <TBody>
          {lines.map((l, i) => {
            const lineCost = showCost && l.unit_cost != null ? l.unit_cost * l.quantity : null
            return (
              <Tr key={`${l.variant_id}-${i}`}>
                <Td className="max-w-[18rem]">
                  <span className="block truncate font-medium text-adm-ink">{l.product_title}</span>
                  <span className="block truncate text-[11px] text-adm-muted">
                    {l.variant_title} · {l.detail}
                  </span>
                </Td>
                <Td align="right">{l.quantity}</Td>
                <Td align="right" muted>
                  {money(l.unit_full)}
                </Td>
                <Td align="right">{money(l.unit_price)}</Td>
                <Td align="right">{money(l.line_total)}</Td>
                {showCost && (
                  <Td align="right" muted>
                    {lineCost != null ? money(lineCost) : 'No cost'}
                  </Td>
                )}
                {showCost && <Td align="right">{lineCost != null && l.line_total > 0 ? pct((l.line_total - lineCost) / l.line_total) : '—'}</Td>}
              </Tr>
            )
          })}
        </TBody>
      </Table>
      <KV
        className="border-t border-adm-line"
        rows={[
          ['Full price', money(totals.subtotal_full)],
          [totals.discount_pct > 0 ? discountLabel(totals.tier_name, totals.discount_pct) : 'Discount', totals.discount_total ? `−${money(totals.discount_total)}` : '—'],
          ['Shipping', totals.shipping_total != null && totals.shipping_total > 0 ? money(totals.shipping_total) : shippingCopy(totals)],
          ['Total', <strong key="t" className="text-adm-ink">{money(totals.total)}</strong>],
          ...(showCost
            ? ([
                ['Material cost', totals.cost_total != null ? money(totals.cost_total) : 'Not every line has a cost'],
                ['Margin', margin != null && merchandise > 0 ? `${money(margin)} (${pct(margin / merchandise)})` : '—'],
              ] as [string, React.ReactNode][])
            : []),
        ]}
      />
    </>
  )
}

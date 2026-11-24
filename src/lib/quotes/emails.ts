import { sendEmail } from '@/lib/email/gmail'
import { createAdminClient } from '@/lib/supabase/admin'
import { roofSummary, shippingCopy } from '@/lib/pricing/engine'
import { discountLabel, HANDOFF_LABEL, usd } from '@/lib/pricing/types'
import { SUPPORT_PHONE } from '@/lib/pro/config'
import { quoteUrl } from './token'
import type { QuoteRow } from './types'

/**
 * Quote emails, sent through the site's Gmail sender (src/lib/email/gmail):
 * the buyer's link, the reminder before the live offer ends and the refreshed
 * offer go to the buyer;
 * new quotes and handoffs go to Crazy Seal's lead inbox
 * (LEAD_NOTIFICATION_EMAIL) and the quote's sales rep. None of these throw:
 * they return whether the email went, and log why not.
 */

const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://crazyseal.com').replace(/\/$/, '')
const LEAD_INBOX = () => process.env.LEAD_NOTIFICATION_EMAIL || 'info@crazyseal.com'

function esc(v: string): string {
  return v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

/** "November 26 at 3:15 PM EST": when the live offer ends. */
const expiry = (iso: string) => {
  const d = new Date(iso)
  const day = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/New_York' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' })
  return `${day} at ${time}`
}

function linesTable(q: QuoteRow): string {
  const rows = q.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;">${esc(l.product_title)}<br><span style="color:#777;font-size:12px;">${esc(l.variant_title)}</span></td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center;">${l.quantity}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;">${usd(l.line_total)}</td></tr>`,
    )
    .join('')
  const totals: [string, string][] = [['Full price', usd(q.subtotal_full)]]
  if (q.discount_total > 0) totals.push([discountLabel(q.tier_name, q.discount_pct), `−${usd(q.discount_total)}`])
  totals.push(['Shipping', q.shipping_total != null && q.shipping_total > 0 ? usd(q.shipping_total) : shippingCopy(q)])
  totals.push(['Total', usd(q.total)])
  const foot = totals
    .map(([k, v], i) => `<tr><td colspan="2" style="padding:4px 10px;text-align:right;${i === totals.length - 1 ? 'font-weight:700;' : 'color:#555;'}">${esc(k)}</td><td style="padding:4px 10px;text-align:right;${i === totals.length - 1 ? 'font-weight:700;' : ''}">${esc(v)}</td></tr>`)
    .join('')
  return `<table style="border-collapse:collapse;width:100%;max-width:600px;font-size:14px;"><thead><tr style="background:#f4f6f8;"><th style="padding:6px 10px;text-align:left;">Material</th><th style="padding:6px 10px;">Qty</th><th style="padding:6px 10px;text-align:right;">Price</th></tr></thead><tbody>${rows}${foot}</tbody></table>`
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${esc(href)}" style="display:inline-block;background:#5BA411;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;">${esc(label)}</a></p>`
}

function wrap(body: string): string {
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;line-height:1.5;max-width:640px;">${body}<p style="color:#777;font-size:12px;margin-top:24px;">Crazy Seal · questions? Reply to this email or call ${SUPPORT_PHONE}.</p></div>`
}

async function send(to: string | string[], subject: string, html: string, replyTo?: string): Promise<boolean> {
  try {
    await sendEmail({ to, subject, html, replyTo })
    return true
  } catch (err) {
    console.error(`[quote email] "${subject}" failed`, err)
    return false
  }
}

/** The rep's admin login, for copying them on their quotes. */
async function repEmail(repId: string | null): Promise<string | null> {
  if (!repId) return null
  const { data } = await createAdminClient().from('sales_reps').select('staff_email, is_active').eq('id', repId).maybeSingle()
  return data?.is_active && data.staff_email ? String(data.staff_email) : null
}

/** The buyer's quote and link. */
export async function emailQuoteToBuyer(q: QuoteRow, intro?: string): Promise<boolean> {
  const first = q.name.split(/\s+/)[0] || 'there'
  const body =
    `<p>Hi ${esc(first)},</p>` +
    `<p>${esc(intro ?? `Here’s your Crazy Seal quote ${q.number} for ${roofSummary(q.inputs)}. ${offerLine(q)}`)}</p>` +
    linesTable(q) +
    button(quoteUrl(q.token), q.status === 'checkout' && q.invoice_url ? 'View quote and pay' : 'View your quote')
  return send(q.email, `Your Crazy Seal quote ${q.number}`, wrap(body))
}

/** Lead inbox (and the rep): a new quote, a handoff or anything staff should act on. */
export async function emailStaff(q: QuoteRow, headline: string, detail?: string): Promise<boolean> {
  const to = [LEAD_INBOX()]
  const rep = await repEmail(q.rep_id)
  if (rep && !to.includes(rep)) to.push(rep)
  const who = [q.name, q.company, q.email, q.phone].filter(Boolean).map((v) => esc(String(v))).join(' · ')
  const ship = q.ship_to ? [q.ship_to.street, q.ship_to.street2, q.ship_to.city, q.ship_to.state, q.ship_to.zip].filter(Boolean).join(', ') : ''
  const body =
    `<p><strong>${esc(headline)}</strong></p>` +
    (detail ? `<p>${esc(detail)}</p>` : '') +
    `<p>${who}<br>${esc(roofSummary(q.inputs))}${ship ? `<br>Ship to: ${esc(ship)}` : ''}${q.handoff ? `<br>Handoff: ${esc(HANDOFF_LABEL[q.handoff])}` : ''}</p>` +
    linesTable(q) +
    button(`${SITE()}/portal/admin/quotes/${q.id}/`, `Open ${q.number} in the admin`)
  return send(to, `${headline} · ${q.number} · ${q.name}`, wrap(body), q.email)
}

/** "Your price is a live offer (Live offer 10% off) until November 26 at 3:15 PM EST." */
function offerLine(q: QuoteRow): string {
  const off = q.discount_pct > 0 ? ` with ${discountLabel(q.tier_name, q.discount_pct)} off` : ''
  return `Your price${off} is a live offer, good until ${expiry(q.expires_at)}. After that we can refresh it at the day’s prices.`
}

/** Sent reminder_hours before the live offer ends. */
export async function emailReminder(q: QuoteRow): Promise<boolean> {
  const first = q.name.split(/\s+/)[0] || 'there'
  const off = q.discount_pct > 0 ? ` (${discountLabel(q.tier_name, q.discount_pct)} off)` : ''
  const body =
    `<p>Hi ${esc(first)},</p>` +
    `<p>Your live offer on Crazy Seal quote ${esc(q.number)}${esc(off)} ends ${esc(expiry(q.expires_at))}. Questions about coverage, colors or how to install? Reply here and a roofing specialist will help.</p>` +
    linesTable(q) +
    button(quoteUrl(q.token), 'Finish your order')
  return send(q.email, `Your Crazy Seal offer ends soon (${q.number})`, wrap(body))
}

/** The offer ended and the cron refreshed the quote at today's prices: a new live offer of `hours`. */
export async function emailReoffer(q: QuoteRow, hours: number): Promise<boolean> {
  const first = q.name.split(/\s+/)[0] || 'there'
  const off = q.discount_pct > 0 ? `, with ${discountLabel(q.tier_name, q.discount_pct)} off` : ''
  const body =
    `<p>Hi ${esc(first)},</p>` +
    `<p>Your last offer on Crazy Seal quote ${esc(q.number)} ended, so we’ve priced it again at today’s prices${esc(off)}. This new offer is good for ${hours} hours, until ${esc(expiry(q.expires_at))}.</p>` +
    linesTable(q) +
    button(quoteUrl(q.token), 'See your new price')
  return send(q.email, `A new price on your Crazy Seal quote ${q.number}`, wrap(body))
}

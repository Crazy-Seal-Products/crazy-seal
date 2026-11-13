import { createAdminClient } from '@/lib/supabase/admin'
import { getMetaCampaignInsights, getMetaCampaignNames, metaAdsConfigured, type MetaAdAccount, type MetaCampaignInsight } from '@/lib/meta/ads'
import { memo } from './cache'
import { dayKey } from './format'
import { bucketKey, RANGES, shiftDay, windowFor, type Bucket, type RangeKey } from './sales'

/**
 * Data for the Marketing tab. One database call (admin_marketing_report,
 * migration 020) totals the site's own visit tracking, leads and the Shopify
 * copy for a date range. This module sorts each source into a channel and
 * shapes the result for the page. Visit tracking began in July 2026, so no
 * range reaches further back than that.
 */

// ─── Channels ─────────────────────────────────────────────────────────────

export const CHANNELS = [
  { key: 'meta_ads', label: 'Meta ads', hint: 'Facebook & Instagram ads', paid: true },
  { key: 'google_ads', label: 'Google Ads', hint: 'Google ad clicks', paid: true },
  { key: 'microsoft_ads', label: 'Microsoft Ads', hint: 'Bing ad clicks', paid: true },
  { key: 'other_paid', label: 'Other paid', hint: 'Links tagged as paid', paid: true },
  { key: 'search', label: 'Organic search', hint: 'Google, Bing, DuckDuckGo, Yahoo', paid: false },
  { key: 'social', label: 'Organic social', hint: 'Posts and links on Facebook, YouTube, Reddit', paid: false },
  { key: 'ai', label: 'AI assistants', hint: 'ChatGPT, Perplexity, Gemini', paid: false },
  { key: 'email', label: 'Email', hint: 'Email links and webmail', paid: false },
  { key: 'referral', label: 'Referral sites', hint: 'Links from other websites', paid: false },
  { key: 'other', label: 'Other campaigns', hint: 'Tagged links that fit nothing above', paid: false },
  { key: 'direct', label: 'Direct / unknown', hint: 'Typed in, bookmarks, apps that hide the source', paid: false },
] as const

export type ChannelKey = (typeof CHANNELS)[number]['key']

/** Where a visit (or a person's first visit) came from, as the tracking stored it. */
export interface Touch {
  src: string | null
  med: string | null
  host: string | null
  /** Google Ads click id (gclid, gbraid or wbraid) */
  g: boolean
  /** Facebook click id: on every Facebook/Instagram link, ad or not */
  f: boolean
  /** Microsoft Ads click id */
  m?: boolean
  /** TikTok click id */
  t?: boolean
}

const PAID_MEDIUMS = new Set(['paid', 'cpc', 'ppc', 'cpm', 'cpv', 'display', 'paid_social', 'paidsocial', 'paid-social', 'ads', 'ad', 'banner', 'retargeting'])
const META_SOURCES = new Set(['facebook', 'fb', 'ig', 'instagram', 'meta', 'an', 'msg', 'messenger', 'threads'])
const GOOGLE_SOURCES = new Set(['google', 'adwords', 'googleads', 'google_ads', 'youtube', 'pmax'])
const MICROSOFT_SOURCES = new Set(['bing', 'microsoft', 'msn'])
const SOCIAL_SOURCES = new Set([...META_SOURCES, 'youtube', 'reddit', 'tiktok', 'pinterest', 'x', 'twitter', 'linkedin', 'nextdoor'])
const SEARCH_SOURCES = new Set(['google', 'bing', 'yahoo', 'duckduckgo', 'ecosia', 'brave', 'yandex', 'baidu'])

const EMAIL_HOSTS = /^(mail\.google\.com|com\.google\.android\.gm|outlook\.(live|office|office365)\.com|mail\.yahoo\.com|mail\.aol\.com|webmail\..+)$/
const AI_HOSTS = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai|you\.com|meta\.ai|grok\.com)$/
const AI_SOURCES = /chatgpt|openai|perplexity|gemini|copilot|claude|grok/
const SOCIAL_HOSTS =
  /(^|\.)(facebook\.com|fb\.com|instagram\.com|youtube\.com|youtu\.be|reddit\.com|tiktok\.com|pinterest\.[a-z.]+|x\.com|t\.co|twitter\.com|linkedin\.com|lnkd\.in|nextdoor\.com|threads\.net)$|^com\.(reddit\.frontpage|facebook\.katana|instagram\.android|google\.android\.youtube)$/
const SEARCH_HOSTS =
  /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.com|yandex\.[a-z.]+|ecosia\.org|baidu\.com|aol\.com|ask\.com)$|^com\.google\.android\.googlequicksearchbox$|^search\.brave\.com$/
/** Our own sites and Shopify: a visit "from" these is a return trip, not a referral. */
const OWN_HOSTS = /(^|\.)(crazyseal\.com|myshopify\.com|shopify\.com|shop\.app|vercel\.app|localhost)$/

export function channelFor(t: Touch): ChannelKey {
  const src = t.src ?? ''
  const med = t.med ?? ''
  const host = t.host ?? ''
  if (t.g) return 'google_ads'
  if (t.m) return 'microsoft_ads'
  // Meta's own placement names ("Facebook_Mobile_Feed") arrive as the medium.
  if (PAID_MEDIUMS.has(med) || /^(facebook|instagram)_/.test(med)) {
    if (META_SOURCES.has(src) || t.f || /(^|\.)(facebook|instagram)\.com$/.test(host)) return 'meta_ads'
    if (GOOGLE_SOURCES.has(src)) return 'google_ads'
    if (MICROSOFT_SOURCES.has(src)) return 'microsoft_ads'
    return 'other_paid'
  }
  if (t.t) return 'other_paid'
  if (med === 'email' || med === 'newsletter' || /email|newsletter|klaviyo/.test(src) || EMAIL_HOSTS.test(host)) return 'email'
  if (AI_SOURCES.test(src) || AI_HOSTS.test(host)) return 'ai'
  if (/social/.test(med) || SOCIAL_SOURCES.has(src) || t.f || SOCIAL_HOSTS.test(host)) return 'social'
  if (med === 'organic' || SEARCH_SOURCES.has(src) || (!src && SEARCH_HOSTS.test(host))) return 'search'
  if (med === 'referral' || (!src && host && !OWN_HOSTS.test(host))) return 'referral'
  if (src) return 'other'
  return 'direct'
}

export function channelInfo(key: ChannelKey) {
  return CHANNELS.find((c) => c.key === key)!
}

function isPaid(key: ChannelKey) {
  return channelInfo(key).paid
}

// ─── Report ───────────────────────────────────────────────────────────────

interface RawReport {
  tracking_since: string | null
  sources: (Touch & { visits: number; leads: number })[]
  daily: { day: string; visits: number }[]
  daily_leads: { day: string; leads: number }[]
  campaigns: (Touch & { campaign: string; visits: number; leads: number })[]
  landing: { path: string; visits: number; leads: number }[]
  devices: { device: string; visits: number; leads: number }[]
  lead_types: { lead_type: string; leads: number }[]
  lead_sales: (Touch & { people: number; buyers: number; orders: number; revenue: number })[]
  leads_tracked: number
  orders: { total: number; revenue: number; online: number; online_revenue: number; tagged: number }
  order_sources: (Touch & { orders: number; revenue: number })[]
  codes: { code: string; orders: number; sales: number; discount: number }[]
  customers: { total: number; email_subscribed: number; sms_subscribed: number; new_customers: number; new_email_subscribers: number }
  warranty: { registrations: number; rated: number; avg_rating: number | null; ratings: number[]; photo_consent: number; marketing_ready: number }
  marketing_ready_all: number
  prev: { visits: number; leads: number } | null
}

export interface ChannelRow {
  key: ChannelKey
  label: string
  hint: string
  paid: boolean
  visits: number
  leads: number
}

export interface LeadSalesRow {
  key: ChannelKey
  label: string
  people: number
  buyers: number
  orders: number
  revenue: number
}

export interface MarketingPoint {
  key: string
  visits: number
  leads: number
}

const LEAD_TYPE_LABELS: Record<string, string> = {
  quote: 'Purchase quotes',
  business: 'Dealer / partner',
  contact: 'Contact',
}

/** Groups rows by channel; `add` folds each row into its channel's totals. */
function byChannel<R extends Touch>(rows: R[], add: (acc: Record<string, number>, row: R) => void) {
  const map = new Map<ChannelKey, Record<string, number>>()
  for (const row of rows) {
    const key = channelFor(row)
    const acc = map.get(key) ?? {}
    add(acc, row)
    map.set(key, acc)
  }
  return map
}

function sumInto(acc: Record<string, number>, values: Record<string, number>) {
  for (const [k, v] of Object.entries(values)) acc[k] = (acc[k] ?? 0) + Number(v ?? 0)
}

/** Daily's charts show this many days, ending on the picked day. */
export const DAILY_TREND_DAYS = 14

/** `day` picks the day for the Daily range (default today). */
export function getMarketingReport(range: RangeKey, day?: string) {
  const today = dayKey(new Date())
  const win = windowFor(range, null, day)
  const daily = range === 'day'
  return memo(`marketing:${range}:${win.from}:${today}`, 5 * 60_000, async () => {
    const preset = RANGES.find((r) => r.key === range)!
    const from = range === 'all' ? null : win.from
    const prevFrom = preset.days ? shiftDay(win.from, -preset.days) : null
    const trendFrom = shiftDay(win.to, -(DAILY_TREND_DAYS - 1))

    const db = createAdminClient()
    const [{ data, error }, trend] = await Promise.all([
      db.rpc('admin_marketing_report', { p_from: from, p_to: win.to, p_prev_from: prevFrom }),
      // One day is one column, so Daily charts the two weeks ending on it instead.
      daily ? db.rpc('admin_marketing_report', { p_from: trendFrom, p_to: win.to, p_prev_from: null }) : null,
    ])
    if (error) throw new Error(`admin_marketing_report: ${error.message}`)
    if (trend?.error) throw new Error(`admin_marketing_report: ${trend.error.message}`)
    const raw = data as RawReport
    const charted = (trend?.data as RawReport | undefined) ?? raw

    const trackingDay = raw.tracking_since ? dayKey(raw.tracking_since) : win.to
    const chartStart = daily ? trendFrom : from
    const seriesFrom = chartStart && chartStart > trackingDay ? chartStart : trackingDay
    const days = daily ? 1 : Math.round((Date.parse(win.to) - Date.parse(seriesFrom)) / 86_400_000) + 1
    // Only compare when the earlier period is fully inside the tracking.
    const prev = prevFrom && prevFrom >= trackingDay ? raw.prev : null

    // Visits and leads per day/week, zero-filled across the range.
    const bucket: Bucket = daily || days <= 92 ? 'day' : 'week'
    const points = new Map<string, MarketingPoint>()
    for (let day = seriesFrom; day <= win.to; day = shiftDay(day, 1)) {
      const key = bucketKey(day, bucket)
      if (!points.has(key)) points.set(key, { key, visits: 0, leads: 0 })
    }
    for (const d of charted.daily) {
      const p = points.get(bucketKey(d.day, bucket))
      if (p) p.visits += d.visits
    }
    for (const d of charted.daily_leads) {
      const p = points.get(bucketKey(d.day, bucket))
      if (p) p.leads += d.leads
    }

    const visitChannels = byChannel(raw.sources, (acc, r) => sumInto(acc, { visits: r.visits, leads: r.leads }))
    const channels: ChannelRow[] = CHANNELS.map((c) => ({
      key: c.key,
      label: c.label,
      hint: c.hint,
      paid: c.paid,
      visits: visitChannels.get(c.key)?.visits ?? 0,
      leads: visitChannels.get(c.key)?.leads ?? 0,
    }))
      .filter((c) => c.visits || c.leads)
      .sort((a, b) => b.visits - a.visits || b.leads - a.leads)

    const visits = channels.reduce((n, c) => n + c.visits, 0)
    const paidVisits = channels.filter((c) => c.paid).reduce((n, c) => n + c.visits, 0)
    const leads = raw.lead_types.reduce((n, t) => n + t.leads, 0)

    const saleChannels = byChannel(raw.lead_sales, (acc, r) =>
      sumInto(acc, { people: r.people, buyers: r.buyers, orders: r.orders, revenue: r.revenue }),
    )
    const leadSales: LeadSalesRow[] = CHANNELS.map((c) => {
      const v = saleChannels.get(c.key)
      return { key: c.key, label: c.label, people: v?.people ?? 0, buyers: v?.buyers ?? 0, orders: v?.orders ?? 0, revenue: v?.revenue ?? 0 }
    })
      .filter((r) => r.people)
      .sort((a, b) => b.revenue - a.revenue || b.people - a.people)

    const orderChannels = byChannel(raw.order_sources, (acc, r) => sumInto(acc, { orders: r.orders, revenue: r.revenue }))
    const orderSources = CHANNELS.map((c) => ({
      key: c.key,
      label: c.label,
      orders: orderChannels.get(c.key)?.orders ?? 0,
      revenue: orderChannels.get(c.key)?.revenue ?? 0,
    }))
      .filter((r) => r.orders)
      .sort((a, b) => b.revenue - a.revenue)

    // Other websites that sent visits (search engines and social sites included).
    const hostTotals = new Map<string, { visits: number; leads: number }>()
    for (const s of raw.sources) {
      if (!s.host || OWN_HOSTS.test(s.host)) continue
      const t = hostTotals.get(s.host) ?? { visits: 0, leads: 0 }
      t.visits += s.visits
      t.leads += s.leads
      hostTotals.set(s.host, t)
    }
    const referrers = [...hostTotals.entries()]
      .map(([host, t]) => ({ host: prettyHost(host), ...t }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10)

    return {
      range,
      window: daily ? { from: win.from, to: win.to, days: 1 } : { from: seriesFrom, to: win.to, days },
      /** First and last day of the charts (the two weeks ending on the day, for Daily). */
      chart: { from: seriesFrom, to: win.to },
      trackingSince: raw.tracking_since,
      bucket,
      series: [...points.values()].sort((a, b) => a.key.localeCompare(b.key)),
      totals: {
        visits,
        paidVisits,
        leads,
        leadsTracked: raw.leads_tracked,
        leadRate: visits ? leads / visits : 0,
      },
      prev: prev ? { visits: prev.visits, leads: prev.leads, leadRate: prev.visits ? prev.leads / prev.visits : 0 } : null,
      channels,
      campaigns: raw.campaigns.map((c) => {
        const channel = channelFor(c)
        return { ...c, channel, channelLabel: channelInfo(channel).label, paid: isPaid(channel) }
      }),
      landing: raw.landing,
      devices: raw.devices,
      referrers,
      leadTypes: raw.lead_types.map((t) => ({ key: t.lead_type, label: LEAD_TYPE_LABELS[t.lead_type] ?? t.lead_type, leads: t.leads })),
      leadSales,
      leadSalesTotals: leadSales.reduce(
        (n, r) => ({ people: n.people + r.people, buyers: n.buyers + r.buyers, orders: n.orders + r.orders, revenue: n.revenue + r.revenue }),
        { people: 0, buyers: 0, orders: 0, revenue: 0 },
      ),
      orders: raw.orders,
      orderSources,
      codes: raw.codes,
      customers: raw.customers,
      warranty: raw.warranty,
      marketingReadyAll: raw.marketing_ready_all,
    }
  })
}

export type MarketingReport = Awaited<ReturnType<typeof getMarketingReport>>

// ─── Meta ads spend ───────────────────────────────────────────────────────

/** admin_marketing_report returns at most this many campaigns (migration 020). */
const CAMPAIGN_LIMIT = 25

export interface CampaignRow {
  /** The utm_campaign tag, or Meta's campaign ID for a campaign with no tagged visits. */
  campaign: string
  /** Meta's campaign name when known, else the tag. */
  name: string
  src: string | null
  med: string | null
  channel: ChannelKey
  channelLabel: string
  paid: boolean
  /** Null when the site's campaign list was cut off, so the count isn't known. */
  visits: number | null
  leads: number | null
  ads: MetaCampaignInsight | null
}

export interface MetaAdsTotals {
  spend: number
  impressions: number
  clicks: number
  ctr: number | null
  cpc: number | null
  /** Site leads sent from Meta ad visits (the Channels table's Meta row). */
  siteLeads: number
  /** Lead events Meta itself counts for these campaigns. */
  metaLeads: number
  costPerLead: number | null
}

export type MetaAdsView = { campaigns: CampaignRow[] } & (
  | { status: 'off' }
  | { status: 'error'; message: string }
  | { status: 'ok'; account: MetaAdAccount; since: string; until: string; totals: MetaAdsTotals }
)

function siteCampaignRows(report: MarketingReport): CampaignRow[] {
  return report.campaigns.map((c) => ({
    campaign: c.campaign,
    name: c.campaign,
    src: c.src,
    med: c.med,
    channel: c.channel,
    channelLabel: c.channelLabel,
    paid: c.paid,
    visits: c.visits,
    leads: c.leads,
    ads: null,
  }))
}

/**
 * Meta ad spend for the report's window, joined to the site's campaign rows:
 * Meta campaigns arrive tagged with their campaign ID as utm_campaign (a few
 * older links carry the name). Read-only: nothing about visitors or leads is
 * sent to Meta. Without META_ADS_* env vars the rows come back unchanged.
 */
export async function getMetaAds(report: MarketingReport): Promise<MetaAdsView> {
  const rows = siteCampaignRows(report)
  if (!metaAdsConfigured()) return { status: 'off', campaigns: rows }

  try {
    const ads = await getMetaCampaignInsights(report.window.from, report.window.to)
    if (!ads) return { status: 'off', campaigns: rows }

    const byId = new Map(ads.campaigns.map((a) => [a.id, a]))
    const byName = new Map(ads.campaigns.map((a) => [a.name.trim().toLowerCase(), a]))
    const used = new Set<string>()
    for (const row of rows) {
      const hit = byId.get(row.campaign) ?? byName.get(row.campaign.trim().toLowerCase())
      if (!hit || used.has(hit.id)) continue
      used.add(hit.id)
      row.ads = hit
      row.name = hit.name
    }

    // Older ad links still send visits after a campaign stops spending; name those too.
    const unnamed = rows.filter((r) => !r.ads && r.channel === 'meta_ads').map((r) => r.campaign)
    const names = await getMetaCampaignNames(unnamed)
    for (const row of rows) row.name = names.get(row.campaign) ?? row.name

    // Campaigns that spent but sent no tagged visits. When the site's list is
    // complete that means zero visits; when it was cut off, the count is unknown.
    const complete = report.campaigns.length < CAMPAIGN_LIMIT
    for (const a of ads.campaigns) {
      if (used.has(a.id) || !(a.spend > 0 || a.impressions > 0)) continue
      rows.push({
        campaign: a.id,
        name: a.name,
        src: null,
        med: null,
        channel: 'meta_ads',
        channelLabel: channelInfo('meta_ads').label,
        paid: true,
        visits: complete ? 0 : null,
        leads: complete ? 0 : null,
        ads: a,
      })
    }

    const spend = ads.campaigns.reduce((n, a) => n + a.spend, 0)
    const impressions = ads.campaigns.reduce((n, a) => n + a.impressions, 0)
    const clicks = ads.campaigns.reduce((n, a) => n + a.clicks, 0)
    const siteLeads = report.channels.find((c) => c.key === 'meta_ads')?.leads ?? 0
    return {
      status: 'ok',
      account: ads.account,
      since: ads.since,
      until: ads.until,
      campaigns: rows,
      totals: {
        spend,
        impressions,
        clicks,
        ctr: impressions ? clicks / impressions : null,
        cpc: clicks ? spend / clicks : null,
        siteLeads,
        metaLeads: ads.campaigns.reduce((n, a) => n + a.metaLeads, 0),
        costPerLead: siteLeads ? spend / siteLeads : null,
      },
    }
  } catch (err) {
    console.error('[admin/marketing] meta ads', err)
    const message = err instanceof Error ? err.message : String(err)
    return { status: 'error', message: message.slice(0, 300), campaigns: siteCampaignRows(report) }
  }
}

/** Money in the ad account's currency. */
export function adMoney(currency: string, digits: 0 | 2 = 2) {
  let fmt: Intl.NumberFormat
  try {
    fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits })
  } catch {
    fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits })
  }
  return (n: number | null | undefined) => (n == null || !Number.isFinite(n) ? '—' : fmt.format(n))
}

/** "com.google.android.googlequicksearchbox" → "Google app (Android)" and similar. */
function prettyHost(host: string): string {
  const apps: Record<string, string> = {
    'com.google.android.googlequicksearchbox': 'Google app (Android)',
    'com.google.android.gm': 'Gmail app (Android)',
    'com.reddit.frontpage': 'Reddit app (Android)',
    'com.facebook.katana': 'Facebook app (Android)',
    'com.instagram.android': 'Instagram app (Android)',
    'com.google.android.youtube': 'YouTube app (Android)',
  }
  return apps[host] ?? host
}

// ─── Google reviews (Featurable) ──────────────────────────────────────────

export interface GoogleReviews {
  rating: number
  count: number
  writeUrl: string | null
  latest: { id: string; author: string; rating: number; text: string; publishedAt: string | null; url: string | null }[]
}

interface FeaturableReview {
  id: string
  author?: { name?: string }
  text?: string | null
  rating?: { value?: number }
  publishedAt?: string | null
  url?: string | null
}

/** The Google Business Profile summary behind the site's reviews widget. */
export function getGoogleReviews(): Promise<GoogleReviews | null> {
  const id = process.env.NEXT_PUBLIC_FEATURABLE_WIDGET_ID
  if (!id) return Promise.resolve(null)
  return memo('marketing:google-reviews', 30 * 60_000, async () => {
    const res = await fetch(`https://api.featurable.com/v2/widgets/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`Featurable HTTP ${res.status}`)
    const json = (await res.json()) as {
      success?: boolean
      widget?: { reviews?: FeaturableReview[]; gbpLocationSummary?: { reviewsCount?: number; rating?: number; writeAReviewUri?: string } }
    }
    const summary = json.widget?.gbpLocationSummary
    if (!json.success || !summary) throw new Error('Featurable: no summary')
    const latest = [...(json.widget?.reviews ?? [])]
      .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        author: r.author?.name ?? 'Google user',
        rating: r.rating?.value ?? 5,
        text: r.text ?? '',
        publishedAt: r.publishedAt ?? null,
        url: r.url ?? null,
      }))
    return { rating: summary.rating ?? 0, count: summary.reviewsCount ?? 0, writeUrl: summary.writeAReviewUri ?? null, latest }
  }).catch((err) => {
    console.error('[admin/marketing] google reviews', err)
    return null
  })
}

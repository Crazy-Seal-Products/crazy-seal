import { memo } from '@/lib/portal/admin/cache'

/**
 * Meta (Facebook/Instagram) ad results for the admin's Marketing tab.
 *
 * Read-only reporting: it asks Meta for the ad account's own campaign totals
 * (spend, impressions, clicks) and sends nothing about customers or leads.
 *
 * Env (both optional; the Marketing tab hides ad spend without them):
 *   META_ADS_ACCESS_TOKEN  System User token with ads_read on the ad account
 *   META_AD_ACCOUNT_ID     act_1234567890 (the "act_" prefix is optional)
 */

const GRAPH = 'https://graph.facebook.com/v26.0'
const TTL = 15 * 60_000

export interface MetaAdAccount {
  id: string
  name: string
  currency: string
  timezone: string
}

export interface MetaCampaignInsight {
  id: string
  name: string
  spend: number
  impressions: number
  /** All clicks Meta counts on the ad (link clicks, likes, profile taps…). */
  clicks: number
  /** Clicks per impression, as a fraction (Meta reports it as a percent). */
  ctr: number | null
  cpc: number | null
  /** Lead events Meta attributed to the campaign (Pixel and Conversions API). */
  metaLeads: number
}

export interface MetaAdsReport {
  account: MetaAdAccount
  since: string
  until: string
  campaigns: MetaCampaignInsight[]
}

function config() {
  const token = process.env.META_ADS_ACCESS_TOKEN?.trim()
  const raw = process.env.META_AD_ACCOUNT_ID?.trim().replace(/^act_/, '')
  if (!token || !raw || !/^\d+$/.test(raw)) return null
  return { token, account: `act_${raw}` }
}

export function metaAdsConfigured(): boolean {
  return config() !== null
}

interface GraphError {
  error?: { message?: string; code?: number; error_subcode?: number }
}

/** GET from the Graph API with the token in a header, so it never sits in a logged URL. */
async function graph<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
  const json = (await res.json().catch(() => ({}))) as T & GraphError
  if (!res.ok || json.error) {
    const e = json.error
    throw new Error(`Meta API ${res.status}${e?.code ? ` (code ${e.code})` : ''}: ${e?.message ?? res.statusText}`)
  }
  return json
}

interface RawInsight {
  campaign_id: string
  campaign_name?: string
  spend?: string
  impressions?: string
  clicks?: string
  ctr?: string
  cpc?: string
  actions?: { action_type: string; value: string }[]
}

// Meta reports the same lead under several action types; take the first that's present.
const LEAD_ACTIONS = ['lead', 'offsite_conversion.fb_pixel_lead', 'onsite_conversion.lead_grouped']

function toNumber(v: string | undefined): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function parseInsight(row: RawInsight): MetaCampaignInsight {
  const actions = new Map((row.actions ?? []).map((a) => [a.action_type, Number(a.value) || 0]))
  const leadType = LEAD_ACTIONS.find((t) => actions.has(t))
  const ctr = toNumber(row.ctr)
  return {
    id: row.campaign_id,
    name: row.campaign_name || row.campaign_id,
    spend: toNumber(row.spend) ?? 0,
    impressions: toNumber(row.impressions) ?? 0,
    clicks: toNumber(row.clicks) ?? 0,
    ctr: ctr == null ? null : ctr / 100,
    cpc: toNumber(row.cpc),
    metaLeads: leadType ? actions.get(leadType)! : 0,
  }
}

async function insightRows(cfg: { token: string; account: string }, since: string, until: string): Promise<RawInsight[]> {
  const params = new URLSearchParams({
    level: 'campaign',
    fields: 'campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,actions',
    time_range: JSON.stringify({ since, until }),
    limit: '500',
  })
  const rows: RawInsight[] = []
  let next: string | undefined = `${GRAPH}/${cfg.account}/insights?${params}`
  // Follow Meta's paging links, but only to Meta's own host.
  for (let page = 0; next && page < 10; page++) {
    const json: { data?: RawInsight[]; paging?: { next?: string } } = await graph(next, cfg.token)
    rows.push(...(json.data ?? []))
    next = json.paging?.next?.startsWith('https://graph.facebook.com/') ? json.paging.next : undefined
  }
  return rows
}

/**
 * Campaign totals for `since`–`until` (inclusive YYYY-MM-DD, in the ad
 * account's time zone). Null when the env vars aren't set. Cached ~15 minutes.
 */
export function getMetaCampaignInsights(since: string, until: string): Promise<MetaAdsReport | null> {
  const cfg = config()
  if (!cfg) return Promise.resolve(null)
  return memo(`meta-ads:${cfg.account}:${since}:${until}`, TTL, async () => {
    const [account, rows] = await Promise.all([
      graph<{ id: string; name?: string; currency?: string; timezone_name?: string }>(
        `${GRAPH}/${cfg.account}?fields=name,currency,timezone_name`,
        cfg.token,
      ),
      insightRows(cfg, since, until),
    ])
    return {
      account: {
        id: account.id,
        name: account.name ?? account.id,
        currency: account.currency ?? 'USD',
        timezone: account.timezone_name ?? 'America/New_York',
      },
      since,
      until,
      campaigns: rows.map(parseInsight).sort((a, b) => b.spend - a.spend),
    }
  })
}

/**
 * Names for campaign IDs that had no delivery in the range (so no Insights
 * row) but still sent visits from older ad links. The IDs come from visitors'
 * utm_campaign tags, so each is looked up on its own and kept only when it is
 * a campaign in this ad account. Cached a day per ID, misses included.
 */
export async function getMetaCampaignNames(ids: string[]): Promise<Map<string, string>> {
  const cfg = config()
  const wanted = [...new Set(ids)].filter((id) => /^\d{6,25}$/.test(id)).slice(0, 25)
  if (!cfg || !wanted.length) return new Map()
  const accountNum = cfg.account.slice('act_'.length)
  const names = await Promise.all(
    wanted.map((id) =>
      memo(`meta-ads:name:${cfg.account}:${id}`, 24 * 60 * 60_000, async () => {
        try {
          const c = await graph<{ id: string; name?: string; account_id?: string }>(`${GRAPH}/${id}?fields=name,account_id`, cfg.token)
          return c.account_id === accountNum && c.name ? c.name : null
        } catch {
          return null
        }
      }),
    ),
  )
  return new Map(wanted.flatMap((id, i) => (names[i] ? [[id, names[i]] as [string, string]] : [])))
}

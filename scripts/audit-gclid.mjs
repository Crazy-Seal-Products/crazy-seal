// Read-only audit of GCLID capture across visitors / sessions / leads.
// Run with: node --env-file=.env.local scripts/audit-gclid.mjs

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const fmt = (n) => n?.toLocaleString() ?? '0'
const pct = (num, denom) =>
  denom > 0 ? ((num / denom) * 100).toFixed(1) + '%' : 'n/a'

async function count(table, filter = (q) => q) {
  const q = filter(supabase.from(table).select('*', { count: 'exact', head: true }))
  const { count, error } = await q
  if (error) throw new Error(`${table}: ${error.message}`)
  return count ?? 0
}

const windows = [
  { label: 'All time', since: null },
  { label: 'Last 90 days', since: new Date(Date.now() - 90 * 864e5).toISOString() },
  { label: 'Last 30 days', since: new Date(Date.now() - 30 * 864e5).toISOString() },
  { label: 'Last 7 days', since: new Date(Date.now() - 7 * 864e5).toISOString() },
]

console.log('\nRV Armor — GCLID capture audit\n' + '='.repeat(60))

for (const { label, since } of windows) {
  console.log(`\n[${label}]`)

  const sinceFilterVisitor = (q) => (since ? q.gte('first_seen_at', since) : q)
  const sinceFilterSession = (q) => (since ? q.gte('started_at', since) : q)
  const sinceFilterLead = (q) => (since ? q.gte('created_at', since) : q)

  const visTotal = await count('visitors', sinceFilterVisitor)
  const visGclid = await count('visitors', (q) =>
    sinceFilterVisitor(q).not('first_gclid', 'is', null)
  )
  const visFbclid = await count('visitors', (q) =>
    sinceFilterVisitor(q).not('first_fbclid', 'is', null)
  )
  const visUtm = await count('visitors', (q) =>
    sinceFilterVisitor(q).not('first_utm_source', 'is', null)
  )

  const sesTotal = await count('sessions', sinceFilterSession)
  const sesGclid = await count('sessions', (q) =>
    sinceFilterSession(q).not('gclid', 'is', null)
  )
  const sesGbraid = await count('sessions', (q) =>
    sinceFilterSession(q).not('gbraid', 'is', null)
  )
  const sesWbraid = await count('sessions', (q) =>
    sinceFilterSession(q).not('wbraid', 'is', null)
  )
  const sesFbclid = await count('sessions', (q) =>
    sinceFilterSession(q).not('fbclid', 'is', null)
  )
  const sesUtmGoogle = await count('sessions', (q) =>
    sinceFilterSession(q).eq('utm_source', 'google')
  )

  const leadsTotal = await count('leads', sinceFilterLead)
  const leadsGclid = await count('leads', (q) =>
    sinceFilterLead(q).not('first_gclid', 'is', null)
  )
  const leadsFbclid = await count('leads', (q) =>
    sinceFilterLead(q).not('first_fbclid', 'is', null)
  )
  const leadsVisitor = await count('leads', (q) =>
    sinceFilterLead(q).not('visitor_id', 'is', null)
  )
  const leadsSession = await count('leads', (q) =>
    sinceFilterLead(q).not('session_id', 'is', null)
  )
  const leadsZoho = await count('leads', (q) =>
    sinceFilterLead(q).not('zoho_lead_id', 'is', null)
  )

  console.log(
    `  visitors     ${fmt(visTotal).padStart(8)}   first_gclid ${fmt(
      visGclid
    ).padStart(6)} (${pct(visGclid, visTotal)})   first_fbclid ${fmt(
      visFbclid
    ).padStart(6)} (${pct(visFbclid, visTotal)})   any utm ${fmt(
      visUtm
    ).padStart(6)} (${pct(visUtm, visTotal)})`
  )
  console.log(
    `  sessions     ${fmt(sesTotal).padStart(8)}   gclid       ${fmt(
      sesGclid
    ).padStart(6)} (${pct(sesGclid, sesTotal)})   gbraid       ${fmt(
      sesGbraid
    ).padStart(6)}   wbraid ${fmt(sesWbraid).padStart(4)}   fbclid ${fmt(
      sesFbclid
    ).padStart(5)}   utm=google ${fmt(sesUtmGoogle).padStart(5)}`
  )
  console.log(
    `  leads        ${fmt(leadsTotal).padStart(8)}   first_gclid ${fmt(
      leadsGclid
    ).padStart(6)} (${pct(leadsGclid, leadsTotal)})   first_fbclid ${fmt(
      leadsFbclid
    ).padStart(6)} (${pct(leadsFbclid, leadsTotal)})`
  )
  console.log(
    `  leads linked  visitor=${fmt(leadsVisitor)} (${pct(
      leadsVisitor,
      leadsTotal
    )})   session=${fmt(leadsSession)} (${pct(
      leadsSession,
      leadsTotal
    )})   zoho_synced=${fmt(leadsZoho)} (${pct(leadsZoho, leadsTotal)})`
  )

  // GCLID leak: leads whose CONVERTING session had a gclid, but lead has no first_gclid
  if (since) {
    const { data: leakRows, error: leakErr } = await supabase
      .from('leads')
      .select('id, sessions!inner(gclid, gbraid, wbraid)')
      .gte('created_at', since)
      .is('first_gclid', null)
      .not('session_id', 'is', null)

    if (!leakErr && leakRows) {
      const sessionGclidLeak = leakRows.filter((r) => r.sessions?.gclid).length
      const sessionGbraidLeak = leakRows.filter((r) => r.sessions?.gbraid).length
      const sessionWbraidLeak = leakRows.filter((r) => r.sessions?.wbraid).length
      console.log(
        `  LEAK (lead has no first_gclid but converting session does):  gclid=${sessionGclidLeak}   gbraid=${sessionGbraidLeak}   wbraid=${sessionWbraidLeak}`
      )
    }
  }
}

// Sample 5 recent google-attributed leads to spot-check
console.log('\n' + '='.repeat(60))
console.log('Recent leads with utm_source=google (sample of 10)')
const { data: sample } = await supabase
  .from('leads')
  .select(
    'id, created_at, email, first_utm_source, first_utm_medium, first_utm_campaign, first_gclid, converting_utm_source, session_id, visitor_id'
  )
  .eq('first_utm_source', 'google')
  .order('created_at', { ascending: false })
  .limit(10)

if (sample?.length) {
  for (const r of sample) {
    console.log(
      `  ${r.created_at.slice(0, 10)}  ${(r.email || '').padEnd(34)}  campaign=${(
        r.first_utm_campaign || '-'
      ).padEnd(20)}  gclid=${r.first_gclid ? 'YES (' + r.first_gclid.slice(0, 12) + '...)' : 'no '}  conv_src=${r.converting_utm_source || '-'}`
    )
  }
} else {
  console.log('  (no leads with utm_source=google found)')
}

// Top campaigns by lead count (last 90d)
console.log('\nTop campaigns producing leads (last 90 days)')
const since90 = new Date(Date.now() - 90 * 864e5).toISOString()
const { data: campaignRows } = await supabase
  .from('leads')
  .select('first_utm_source, first_utm_medium, first_utm_campaign, first_gclid')
  .gte('created_at', since90)

if (campaignRows?.length) {
  const buckets = new Map()
  for (const r of campaignRows) {
    const key = `${r.first_utm_source || '(direct)'} / ${r.first_utm_medium || '-'} / ${r.first_utm_campaign || '-'}`
    const b = buckets.get(key) || { total: 0, withGclid: 0 }
    b.total++
    if (r.first_gclid) b.withGclid++
    buckets.set(key, b)
  }
  const sorted = [...buckets.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 15)
  for (const [key, v] of sorted) {
    console.log(
      `  ${String(v.total).padStart(4)} leads (${String(v.withGclid).padStart(
        3
      )} w/ gclid)  ${key}`
    )
  }
}

console.log('\nDone.\n')

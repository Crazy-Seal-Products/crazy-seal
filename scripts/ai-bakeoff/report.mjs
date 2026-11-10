// Builds report.html (self-contained) from a graded results folder.
//
//   node report.mjs results/<run>      (defaults to the newest run)

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { HERE, percentile, readJson, readJsonl } from './lib.mjs'

const given = process.argv.slice(2).find((a) => !a.startsWith('--'))
const runDir = given
  ? pathToFileURL(given.replace(/[\\/]?$/, '/'))
  : new URL(`results/${readdirSync(new URL('results/', HERE)).sort().at(-1)}/`, HERE)

const meta = JSON.parse(readFileSync(new URL('meta.json', runDir), 'utf8'))
const rows = readJsonl(new URL('raw.jsonl', runDir))
const { judges, graded, mock: judgedMock } = JSON.parse(readFileSync(new URL('grades.json', runDir), 'utf8'))
const { cases } = readJson('questions.json')
const kb = readJson('kb.json')
const chunkUrl = new Map(kb.chunks.map((c) => [c.id, c.url]))

const gradeOf = new Map(graded.map((g) => [`${g.caseId}|${g.candidateId}`, g.grades]))
const SCORE = { correct: 1, partial: 0.5, wrong: 0 }

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const pct = (x) => (x === null || Number.isNaN(x) ? '–' : `${Math.round(x * 100)}%`)
const sec = (ms) => (ms === null ? '–' : `${(ms / 1000).toFixed(1)}s`)
const usd = (x) => (x === null || Number.isNaN(x) ? '–' : x < 1 ? `$${x.toFixed(2)}` : `$${x.toFixed(0)}`)
const mean = (xs) => { const v = xs.filter((x) => typeof x === 'number'); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }

function judgeSummary(grades) {
  const ok = Object.values(grades ?? {}).filter((g) => g && g.verdict)
  if (!ok.length) return null
  return {
    score: mean(ok.map((g) => SCORE[g.verdict])),
    allCorrect: ok.every((g) => g.verdict === 'correct'),
    hallucination: ok.some((g) => g.hallucination),
    agree: new Set(ok.map((g) => g.verdict)).size === 1,
  }
}

function stats(candidateId, filter) {
  const caseIds = new Set(cases.filter(filter).map((c) => c.id))
  const mine = rows.filter((r) => r.candidateId === candidateId && caseIds.has(r.caseId))
  const first = mine.filter((r) => r.repeat === 1)
  const sums = first.map((r) => judgeSummary(gradeOf.get(`${r.caseId}|${candidateId}`))).filter(Boolean)
  const toolRows = first.filter((r) => r.toolCheck)
  return {
    n: first.length,
    score: mean(sums.map((s) => s.score)),
    correct: sums.length ? sums.filter((s) => s.allCorrect).length / sums.length : null,
    halluc: sums.length ? sums.filter((s) => s.hallucination).length / sums.length : null,
    agree: sums.length ? sums.filter((s) => s.agree).length / sums.length : null,
    tool: toolRows.length ? toolRows.filter((r) => r.toolCheck.calledExpected ?? r.toolCheck.calledNone).length / toolRows.length : null,
    ttft50: percentile(mine.map((r) => r.ttftMs), 50),
    ttft90: percentile(mine.map((r) => r.ttftMs), 90),
    total50: percentile(mine.map((r) => r.totalMs), 50),
    per1k: mean(mine.map((r) => r.costUsd)) * 1000,
    errors: mine.filter((r) => r.error).length,
    refusals: mine.filter((r) => r.stopReason === 'refusal').length,
  }
}

function table(title, note, filter, preferFor) {
  const candidates = meta.candidates
  const lines = candidates.map((c) => {
    const s = stats(c.id, filter)
    if (!s.n) return ''
    return `<tr class="${c.for === preferFor ? 'pref' : ''}">
      <th scope="row">${esc(c.id)}<span class="sub">${esc(c.mockOf ?? c.model)}</span></th>
      <td class="num strong">${pct(s.score)}</td><td class="num">${pct(s.correct)}</td>
      <td class="num ${s.halluc > 0.1 ? 'bad' : ''}">${pct(s.halluc)}</td>
      <td class="num">${pct(s.tool)}</td>
      <td class="num">${sec(s.ttft50)}</td><td class="num">${sec(s.ttft90)}</td><td class="num">${sec(s.total50)}</td>
      <td class="num">${usd(s.per1k)}</td>
      <td class="num">${pct(s.agree)}</td>
      <td class="num ${s.errors + s.refusals ? 'bad' : ''}">${s.errors}/${s.refusals}</td></tr>`
  }).join('')
  return `<section><h2>${esc(title)}</h2><p class="note">${note}</p><div class="scroll"><table>
    <thead><tr><th>Model @ effort</th><th>Score</th><th>Both judges: correct</th><th>Hallucination</th><th>Right tool use</th>
    <th>First token p50</th><th>First token p90</th><th>Full answer p50</th><th>Cost / 1,000 msgs</th><th>Judges agree</th><th>Errors / refusals</th></tr></thead>
    <tbody>${lines}</tbody></table></div></section>`
}

function caseViewer() {
  return cases.map((c) => {
    const answers = meta.candidates.map((cand) => {
      const r = rows.find((x) => x.caseId === c.id && x.candidateId === cand.id && x.repeat === 1)
      if (!r) return ''
      const grades = gradeOf.get(`${c.id}|${cand.id}`) ?? {}
      const verdicts = Object.entries(grades).map(([j, g]) =>
        `<span class="v v-${esc(g.verdict ?? 'err')}" title="${esc(g.reason ?? g.error)}">${esc(j.replace('judge-', ''))}: ${esc(g.verdict ?? 'error')}${g.hallucination ? ' · halluc.' : ''}</span>`).join(' ')
      const calls = r.toolCalls?.length ? `<div class="calls">Tools: ${r.toolCalls.map((t) => esc(`${t.name}(${JSON.stringify(t.args)})`)).join(', ')}</div>` : ''
      return `<div class="answer"><div class="ahead"><b>${esc(cand.id)}</b> <span class="sub">${sec(r.ttftMs)} to first token · ${usd(r.costUsd)}</span> ${verdicts}</div>
        ${calls}<div class="atext">${r.error ? `<span class="bad">${esc(r.error)}</span>` : esc(r.text)}</div>
        <div class="reasons">${Object.entries(grades).map(([j, g]) => `${esc(j.replace('judge-', ''))}: ${esc(g.reason ?? g.error)}`).join('<br>')}</div></div>`
    }).join('')
    const firstRow = rows.find((x) => x.caseId === c.id)
    const sources = meta.context === 'retrieve'
      ? [...new Set((firstRow?.retrieved ?? []).map((id) => chunkUrl.get(id)?.replace(kb.base, '')))].join(', ') || 'none'
      : 'whole site'
    return `<details><summary><span class="tag">${esc(c.id)}</span> <span class="tag t-${esc(c.audience)}">${esc(c.audience)}</span> <span class="tag">${esc(c.kind)}</span> ${esc(c.question)}</summary>
      <div class="facts"><b>Key facts</b><ul>${c.keyFacts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      ${c.mustNot?.length ? `<b>Must not</b><ul>${c.mustNot.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      <p class="sub">Expected sources: ${esc(c.sources.join(', ') || 'none')} · Model saw: ${esc(sources)}</p>
      ${c.kbConflict ? `<p class="sub bad">Site content conflict: ${esc(c.notes)}</p>` : ''}</div>${answers}</details>`
  }).join('')
}

const isCustomer = (c) => c.audience === 'customer'
const isDealer = (c) => c.audience === 'dealer'

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI Assistant Bake-off</title>
<style>
:root{--bg:#fff;--fg:#1a1a1a;--muted:#666;--line:#e3e3e3;--card:#f7f7f7;--accent:#0b5cad;--bad:#b42318;--good:#1a7f37;--warn:#9a6700}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#eee;--muted:#a0a0a0;--line:#333;--card:#1e1e1e;--accent:#6cb0ff;--bad:#ff7b72;--good:#56d364;--warn:#e3b341}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:1200px;margin:0 auto;padding:24px 16px 64px}
h1{font-size:24px;margin:0 0 4px}h2{font-size:18px;margin:32px 0 4px}
.note,.sub{color:var(--muted);font-size:13px}.sub{display:block}
.banner{background:var(--card);border-left:4px solid var(--warn);padding:10px 14px;margin:16px 0}
.scroll{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:900px;margin-top:8px}
th,td{border-bottom:1px solid var(--line);padding:8px;text-align:left;vertical-align:top}thead th{font-size:12px;color:var(--muted);font-weight:600}
td.num{text-align:right;font-variant-numeric:tabular-nums}td.strong{font-weight:700}
tr.pref th{border-left:3px solid var(--accent)}.bad{color:var(--bad)}
details{border:1px solid var(--line);border-radius:6px;margin:8px 0;background:var(--card)}
summary{cursor:pointer;padding:10px 12px}.tag{font-size:11px;border:1px solid var(--line);border-radius:4px;padding:1px 6px;margin-right:4px}
.t-customer{color:var(--accent)}.t-dealer{color:var(--warn)}
.facts{padding:0 14px}.answer{border-top:1px solid var(--line);padding:10px 14px;background:var(--bg)}
.ahead .sub{display:inline;margin:0 8px}.atext{white-space:pre-wrap;margin-top:6px}
.calls{font-family:ui-monospace,monospace;font-size:12px;color:var(--muted)}.reasons{font-size:12px;color:var(--muted);margin-top:6px}
.v{font-size:12px;border-radius:4px;padding:1px 6px;margin-left:4px;border:1px solid var(--line)}
.v-correct{color:var(--good)}.v-partial{color:var(--warn)}.v-wrong,.v-err{color:var(--bad)}
</style></head><body><main>
<h1>AI Assistant Bake-off</h1>
<p class="note">Run ${esc(meta.startedAt)} · ${meta.caseCount} cases · ${meta.candidates.length} models · ${meta.repeat} run(s) per case · context: ${meta.context === 'retrieve' ? `top ${meta.retrieveTopK} keyword passages` : 'whole site, cached'} · judges: ${esc(judges.join(', '))} · knowledge base fetched ${esc(kb.builtAt)}</p>
${meta.mock || judgedMock ? '<div class="banner"><b>Mock run.</b> No real model was called; every number on this page is fake. It only proves the pipeline works.</div>' : ''}
<div class="banner"><b>How to read this.</b> Score averages both judges (correct = 1, partial = 0.5, wrong = 0). Hallucination = either judge found a specific claim not supported by the reference or tool results. First token = how long until the reply starts appearing. Cost per 1,000 messages uses list prices in config.mjs and these questions' real token counts. Highlighted rows are the models meant for that assistant; every model answers every question.</div>
${table('Customer assistant', 'Questions a homeowner or RV owner asks on crazyseal.com, plus questions it should decline.', isCustomer, 'customer')}
${table('Dealer and sales rep assistant', 'Program, pricing and sales questions, plus order, warranty and customer lookups with mock tools.', isDealer, 'dealer')}
${table('Should decline', 'Only the cases where the right answer is "I don\'t have that" or "I won\'t do that".', (c) => c.kind === 'decline', null)}
<h2>Every question and answer</h2><p class="note">Hover a verdict for the judge's reason.</p>
${caseViewer()}
</main></body></html>`

writeFileSync(new URL('report.html', runDir), html)
console.log(`Wrote ${decodeURIComponent(new URL('report.html', runDir).pathname).replace(/^\/([A-Z]:)/, '$1')}`)

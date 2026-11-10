import React from 'react'
import { twMerge } from 'tailwind-merge'
import type { StoredMessage } from '@/lib/ai/store'
import { redact } from '@/lib/support/admin'
import { dateTime } from '@/lib/portal/admin/format'
import { markdownToHtml } from '@/components/assistant/markdown'
import { Badge, Empty } from '../ui'

/**
 * A chat as reviewers see it: every turn, plus what the assistant was given
 * (sources), what it looked up, how long it took and what it cost. With
 * `hidePii`, emails and phone numbers in the text are masked.
 */
export function Transcript({ messages, hidePii }: { messages: StoredMessage[]; hidePii?: boolean }) {
  if (!messages.length) return <Empty>No messages in this chat.</Empty>
  const clean = (t: string) => (hidePii ? redact(t) : t)
  return (
    <ol className="divide-y divide-adm-line-soft">
      {messages.map((m) => (
        <li key={m.id} className={twMerge('px-3 py-2.5', m.role === 'user' && 'bg-adm-ink/[0.025]')}>
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-adm-muted">
            <span className={twMerge('font-semibold uppercase tracking-wide', m.role === 'user' ? 'text-adm-soft' : 'text-adm-blue-bright')}>
              {m.role === 'user' ? 'Them' : 'Assistant'}
            </span>
            <span>{dateTime(m.created_at)}</span>
            {m.role === 'assistant' && (
              <>
                {m.model && <span>{m.model}</span>}
                {m.ttft_ms != null && <span>first word {(m.ttft_ms / 1000).toFixed(1)}s</span>}
                {m.total_ms != null && <span>done {(m.total_ms / 1000).toFixed(1)}s</span>}
                {m.output_tokens != null && <span>{m.input_tokens ?? 0} in ({m.cached_tokens ?? 0} cached) / {m.output_tokens} out</span>}
                {m.cost_usd != null && <span>${Number(m.cost_usd).toFixed(4)}</span>}
                {m.error && <Badge tone="bad">{m.error}</Badge>}
              </>
            )}
          </div>
          {m.role === 'assistant' ? (
            m.content ? (
              <div
                className="space-y-2 text-[13px] leading-relaxed text-adm-text [&_a]:text-adm-blue-bright [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(clean(m.content)) }}
              />
            ) : (
              <p className="text-[12.5px] italic text-adm-muted">No answer.</p>
            )
          ) : (
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-adm-ink">{clean(m.content)}</p>
          )}
          {m.role === 'assistant' && ((m.tool_calls?.length ?? 0) > 0 || (m.sources?.length ?? 0) > 0) && (
            <details className="mt-1.5 text-[11.5px] text-adm-muted">
              <summary className="cursor-pointer select-none hover:text-adm-ink">
                {m.sources?.length ?? 0} sources{m.tool_calls?.length ? ` · ${m.tool_calls.length} lookups` : ''}
              </summary>
              <ul className="mt-1 space-y-0.5 pl-3">
                {m.tool_calls?.map((t, i) => (
                  <li key={`t${i}`}>
                    <span className={t.ok ? 'text-adm-text' : 'text-adm-red'}>{t.name}</span> {JSON.stringify(t.input)}
                  </li>
                ))}
                {m.sources?.map((s, i) => (
                  <li key={`s${i}`}>
                    [{i + 1}] {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-adm-blue-bright hover:underline">{s.title}</a> : s.title}
                    {s.source === 'note' && <span className="ml-1 text-adm-gold-text">(staff note)</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </li>
      ))}
    </ol>
  )
}

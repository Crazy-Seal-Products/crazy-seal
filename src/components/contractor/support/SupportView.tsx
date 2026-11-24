'use client'

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Lightbulb, Loader2, MessageSquarePlus, MessagesSquare, Send, Trash2, LifeBuoy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORT_PHONE } from '@/lib/pro/config'
import { assistantOpen } from '@/lib/ai/config'
import { ChatThread, type ChatMessage } from '@/components/assistant/ChatThread'

/**
 * Support in the contractor portal (moved from Pro Hub's Support tab, same
 * data through /api/pro/support): every request the person has sent with the
 * team's replies, and "Ask the team" to send one. When the support agent is
 * switched on (NEXT_PUBLIC_DEALER_CHAT, see src/lib/ai/config.ts) it also has
 * the agent, which talks them through questions and checks their own orders and
 * warranty jobs, and their last 20 chats with it.
 */

interface ChatRow {
  id: string
  title: string | null
  message_count: number
  last_message_at: string
}

interface TicketRow {
  id: string
  number: number
  kind: string
  status: string
  subject: string
  pro_unread: boolean
  updated_at: string
}

interface TicketDetail {
  ticket: { id: string; number: number; kindLabel: string; status: string; statusLabel: string; subject: string; resolution: string | null; createdAt: string }
  messages: { from: string; mine: boolean; staff: boolean; body: string; at: string }[]
}

type View = { type: 'chat'; id: string | null } | { type: 'ticket'; id: string } | { type: 'feedback' }

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-highlight/20 text-highlight',
  triaged: 'bg-sky-400/15 text-sky-200',
  in_progress: 'bg-sky-400/15 text-sky-200',
  waiting: 'bg-amber-400/15 text-amber-200',
  resolved: 'bg-secondary/20 text-secondary-light',
  wont_fix: 'bg-white/10 text-white/60',
}
const STATUS_TEXT: Record<string, string> = { new: 'Sent', triaged: 'Seen', in_progress: 'In progress', waiting: 'Replied', resolved: 'Resolved', wont_fix: 'Closed' }
const KIND_TEXT: Record<string, string> = { dealer_support: 'Support', general_feedback: 'Feedback', feature_request: 'Feature request' }

function when(iso: string) {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (days < 1) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (days < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function SupportView() {
  return (
    <Suspense fallback={null}>
      <SupportTab />
    </Suspense>
  )
}

function SupportTab() {
  const params = useSearchParams()
  const [chats, setChats] = useState<ChatRow[]>([])
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [limit, setLimit] = useState(20)
  const [readOnly, setReadOnly] = useState(false)
  const [assistantOn, setAssistantOn] = useState(() => assistantOpen('dealer'))
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>(() => {
    const ticket = params.get('ticket')
    if (ticket) return { type: 'ticket', id: ticket }
    return assistantOpen('dealer') ? { type: 'chat', id: null } : { type: 'feedback' }
  })
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/pro/support/')
    if (!res.ok) return
    const data = (await res.json()) as { chats: ChatRow[]; tickets: TicketRow[]; chatLimit: number; readOnly: boolean; assistantOn: boolean }
    setChats(data.chats)
    setTickets(data.tickets)
    setLimit(data.chatLimit)
    setReadOnly(data.readOnly)
    setAssistantOn(data.assistantOn)
    // Without the agent, an empty new chat has nothing to offer; open "Ask the team" instead.
    if (!data.assistantOn) setView((v) => (v.type === 'chat' && v.id === null ? { type: 'feedback' } : v))
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  async function openChat(id: string | null) {
    if (!id) {
      setChatMessages([])
      setView({ type: 'chat', id: null })
      return
    }
    setChatLoading(true)
    try {
      const res = await fetch(`/api/pro/support/chats/${id}/`)
      const data = (await res.json()) as { messages?: ChatMessage[] }
      setChatMessages(data.messages ?? [])
      setView({ type: 'chat', id })
    } finally {
      setChatLoading(false)
    }
  }

  async function deleteChat(id: string) {
    if (!window.confirm('Delete this chat? This can’t be undone.')) return
    await fetch(`/api/pro/support/chats/${id}/`, { method: 'DELETE' })
    if (view.type === 'chat' && view.id === id) openChat(null)
    refresh()
  }

  const unread = tickets.filter((t) => t.pro_unread).length
  const disabledReason = readOnly
    ? 'You’re viewing this account as an admin, which is read-only.'
    : !assistantOn
      ? `The support agent isn’t switched on yet. Use “Ask the team”, or call ${SUPPORT_PHONE}.`
      : null

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[560px] flex-col lg:h-[calc(100vh-5rem)]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-highlight">Help</p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            <LifeBuoy className="h-6 w-6 text-highlight" /> Support
          </h1>
          <p className="mt-1 text-sm text-blue-100/60">
            {assistantOn
              ? 'Your support agent knows the products, your orders and your warranty jobs, and can bring in the team.'
              : 'Ask the team about a product, an order or a warranty job, or send feedback. Replies show up here and by email.'}
          </p>
        </div>
        <div className="flex gap-2">
          {assistantOn && (
            <button
              type="button"
              onClick={() => openChat(null)}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
            >
              <MessageSquarePlus className="h-4 w-4" /> New chat
            </button>
          )}
          <button
            type="button"
            onClick={() => setView({ type: 'feedback' })}
            disabled={readOnly}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.09] disabled:opacity-50"
          >
            <Lightbulb className="h-4 w-4" /> Ask the team
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="order-2 min-h-0 space-y-4 overflow-y-auto md:order-1">
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.035]">
            <h2 className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 text-sm font-semibold text-white">
              Requests
              {unread > 0 && <span className="rounded-full bg-highlight px-2 py-0.5 text-[11px] font-bold text-[#15181C]">{unread} new repl{unread === 1 ? 'y' : 'ies'}</span>}
            </h2>
            {loading ? (
              <p className="px-3 py-3 text-sm text-white/40">Loading…</p>
            ) : tickets.length === 0 ? (
              <p className="px-3 py-3 text-sm text-white/55">
                {assistantOn ? 'No requests yet. Ask the agent to bring in the team, or use “Ask the team”.' : 'No requests yet. Use “Ask the team” to send one.'}
              </p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setView({ type: 'ticket', id: t.id })}
                      className={cn('w-full px-3 py-2 text-left hover:bg-white/[0.04]', view.type === 'ticket' && view.id === t.id && 'bg-white/[0.07]')}
                    >
                      <span className="flex items-center gap-1.5">
                        {t.pro_unread && <span className="h-2 w-2 shrink-0 rounded-full bg-highlight" aria-label="New reply" />}
                        <span className="truncate text-sm font-medium text-white">{t.subject}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-white/50">
                        <span className={cn('rounded px-1.5 py-0.5 text-[10.5px] font-semibold', STATUS_STYLE[t.status])}>{STATUS_TEXT[t.status] ?? t.status}</span>
                        {KIND_TEXT[t.kind] ?? t.kind} · #{t.number} · {when(t.updated_at)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {(assistantOn || chats.length > 0) && (
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.035]">
              <h2 className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 text-sm font-semibold text-white">
                Recent chats <span className="text-[11px] font-normal text-white/40">{chats.length} of {limit} kept</span>
              </h2>
              {chats.length === 0 ? (
                <p className="px-3 py-3 text-sm text-white/55">Your chats with the agent show up here. The newest {limit} are kept.</p>
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {chats.map((c) => (
                    <li key={c.id} className={cn('group flex items-center', view.type === 'chat' && view.id === c.id && 'bg-white/[0.07]')}>
                      <button type="button" onClick={() => openChat(c.id)} className="min-w-0 flex-1 px-3 py-2 text-left hover:bg-white/[0.04]">
                        <span className="block truncate text-sm text-white">{c.title || 'Chat'}</span>
                        <span className="text-[11.5px] text-white/50">{when(c.last_message_at)}</span>
                      </button>
                      {!readOnly && (
                        <button type="button" onClick={() => deleteChat(c.id)} className="px-2 text-white/30 hover:text-red-300" aria-label="Delete chat">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </aside>

        <section className="order-1 flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1F2328]/70 md:order-2 md:min-h-0">
          {view.type === 'chat' &&
            (chatLoading ? (
              <div className="grid flex-1 place-items-center text-white/40">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <ChatThread
                endpoint="/api/pro/support/chat/"
                variant="portal"
                conversationId={view.id}
                initialMessages={chatMessages}
                disabledReason={disabledReason}
                placeholder="Ask about an install, a product, your orders or warranty jobs…"
                onConversation={(id) => setView({ type: 'chat', id })}
                onTurnDone={refresh}
                empty={
                  <div className="mx-auto max-w-md space-y-3 pt-6 text-center">
                    <MessagesSquare className="mx-auto h-8 w-8 text-white/30" />
                    <p className="text-base font-semibold text-white">How can we help today?</p>
                    <p className="text-sm text-white/55">
                      Ask about prep and install steps, coverage, talking points for a customer, an order’s status, or a warranty registration. If it needs a person, the agent can open a request for the team.
                    </p>
                  </div>
                }
              />
            ))}
          {view.type === 'ticket' && <TicketView id={view.id} readOnly={readOnly} onChange={refresh} onOpenChat={openChat} />}
          {view.type === 'feedback' && (
            <FeedbackForm
              onSent={(id) => {
                refresh()
                setView({ type: 'ticket', id })
              }}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function TicketView({ id, readOnly, onChange, onOpenChat }: { id: string; readOnly: boolean; onChange: () => void; onOpenChat: (id: string) => void }) {
  const [data, setData] = useState<(TicketDetail & { ticket: TicketDetail['ticket'] & { conversationId?: string | null } }) | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/pro/support/tickets/${id}/`)
    const json = await res.json()
    if (!res.ok) setError(json.error || 'Could not load this request')
    else {
      setData(json)
      onChange()
    }
    // onChange only refreshes the unread dots; it's stable from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    setData(null)
    setError(null)
    load()
  }, [load])

  if (error) return <p className="p-6 text-sm text-red-300">{error}</p>
  if (!data) {
    return (
      <div className="grid flex-1 place-items-center text-white/40">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }
  const t = data.ticket
  const closed = t.status === 'resolved' || t.status === 'wont_fix'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-white/10 px-4 py-3">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-white/50">
          {t.kindLabel} · #{t.number}
        </p>
        <h2 className="text-lg font-bold text-white">{t.subject}</h2>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] text-white/50">
          <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-semibold', STATUS_STYLE[t.status])}>{t.statusLabel}</span>
          Opened {new Date(t.createdAt).toLocaleDateString()}
          {t.conversationId && (
            <button type="button" onClick={() => onOpenChat(t.conversationId!)} className="font-semibold text-highlight hover:underline">
              View the chat
            </button>
          )}
        </p>
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {data.messages.map((m, i) => (
          <div key={i} className={cn('flex', m.mine ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                m.mine ? 'rounded-br-md bg-accent text-white' : m.staff ? 'rounded-bl-md border border-highlight/40 bg-highlight/10 text-white' : 'rounded-bl-md border border-white/10 bg-white/[0.05] text-white/90',
              )}
            >
              <p className={cn('mb-1 text-[11px] font-semibold', m.mine ? 'text-white/70' : 'text-highlight')}>
                {m.from} · {when(m.at)}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
            </div>
          </div>
        ))}
        {closed && t.resolution && (
          <div className="rounded-xl border border-secondary/30 bg-secondary/10 px-3.5 py-2.5 text-sm text-white/90">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide">Resolution</p>
            <p className="whitespace-pre-wrap">{t.resolution}</p>
          </div>
        )}
      </div>
      {readOnly ? (
        <p className="border-t border-white/10 px-4 py-3 text-sm text-white/50">Read-only in admin view.</p>
      ) : (
        <form
          className="flex items-end gap-2 border-t border-white/10 p-3"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!reply.trim()) return
            setBusy(true)
            try {
              const res = await fetch(`/api/pro/support/tickets/${id}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body: reply }),
              })
              if (res.ok) {
                setReply('')
                await load()
              } else setError((await res.json()).error || 'Could not send')
            } finally {
              setBusy(false)
            }
          }}
        >
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            maxLength={4000}
            placeholder={closed ? 'Reply to reopen this request…' : 'Reply to the team…'}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-highlight/60 focus:outline-none focus:ring-2 focus:ring-highlight/20"
          />
          <button type="submit" disabled={busy || !reply.trim()} className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-white disabled:opacity-40" aria-label="Send reply">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      )}
    </div>
  )
}

function FeedbackForm({ onSent }: { onSent: (id: string) => void }) {
  const [kind, setKind] = useState<'dealer_support' | 'general_feedback' | 'feature_request'>('dealer_support')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const field = 'w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-highlight/60 focus:outline-none focus:ring-2 focus:ring-highlight/20'

  return (
    <form
      className="mx-auto w-full max-w-xl space-y-3 overflow-y-auto p-5"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
          const res = await fetch('/api/pro/support/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kind, subject, body }),
          })
          const data = await res.json()
          if (!res.ok) setError(data.error || 'Could not send')
          else onSent(data.id)
        } finally {
          setBusy(false)
        }
      }}
    >
      <h2 className="text-lg font-bold text-white">Ask the team</h2>
      <p className="text-sm text-white/55">Only the Crazy Seal team sees what you send. You’ll get replies here and by email.</p>
      <div className="grid gap-2 xl:grid-cols-3">
        {(
          [
            ['dealer_support', 'Get help', 'A question about a product, an order or a warranty job'],
            ['general_feedback', 'Feedback or knowledge', 'Something we should know, or something that isn’t working right'],
            ['feature_request', 'Feature request', 'Something you wish the portal could do'],
          ] as const
        ).map(([key, label, hint]) => (
          <button
            key={key}
            type="button"
            onClick={() => setKind(key)}
            className={cn('rounded-xl border p-3 text-left', kind === key ? 'border-highlight/50 bg-highlight/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20')}
          >
            <span className="block text-sm font-semibold text-white">{label}</span>
            <span className="mt-0.5 block text-[12px] text-white/50">{hint}</span>
          </button>
        ))}
      </div>
      <input className={field} placeholder="Short title (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} />
      <textarea className={`${field} min-h-[140px]`} placeholder="Tell us more…" value={body} onChange={(e) => setBody(e.target.value)} required maxLength={4000} />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={busy || !body.trim()} className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Send
      </button>
    </form>
  )
}

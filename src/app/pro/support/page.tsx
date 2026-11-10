'use client'

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Lightbulb, Loader2, MessageSquarePlus, MessagesSquare, Send, Trash2, LifeBuoy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORT_PHONE } from '@/lib/pro/config'
import { ChatThread, type ChatMessage } from '@/components/assistant/ChatThread'

/**
 * The dealer's personal support tab: a support agent that talks them through
 * questions and checks their own orders and warranty jobs, their last 20
 * chats, and every request they've sent with the team's replies.
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
  new: 'bg-[#F9EA1C]/30 text-[#5c5200]',
  triaged: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-blue-50 text-blue-700',
  waiting: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  wont_fix: 'bg-gray-100 text-gray-600',
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

export default function ProSupportPage() {
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
  const [assistantOn, setAssistantOn] = useState(true)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>(() => {
    const ticket = params.get('ticket')
    return ticket ? { type: 'ticket', id: ticket } : { type: 'chat', id: null }
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
      ? `The support agent isn’t switched on yet. Use “Send feedback”, or call ${SUPPORT_PHONE}.`
      : null

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col p-4 md:h-screen md:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#003365]">
            <LifeBuoy className="h-6 w-6" /> Support
          </h1>
          <p className="mt-1 text-sm text-gray-500">Your support agent knows the products, your orders and your warranty jobs, and can bring in the team.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openChat(null)}
            className="flex items-center gap-1.5 rounded-lg bg-[#003365] px-3 py-2 text-sm font-semibold text-white hover:bg-[#002347]"
          >
            <MessageSquarePlus className="h-4 w-4" /> New chat
          </button>
          <button
            type="button"
            onClick={() => setView({ type: 'feedback' })}
            disabled={readOnly}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-[#003365] hover:bg-gray-50 disabled:opacity-50"
          >
            <Lightbulb className="h-4 w-4" /> Send feedback
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="order-2 min-h-0 space-y-4 overflow-y-auto md:order-1">
          <section className="rounded-xl border border-gray-200 bg-white">
            <h2 className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm font-semibold text-[#003365]">
              Requests
              {unread > 0 && <span className="rounded-full bg-[#F9EA1C] px-2 py-0.5 text-[11px] font-bold text-[#003365]">{unread} new repl{unread === 1 ? 'y' : 'ies'}</span>}
            </h2>
            {loading ? (
              <p className="px-3 py-3 text-sm text-gray-400">Loading…</p>
            ) : tickets.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-500">No requests yet. Ask the agent to bring in the team, or send feedback.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setView({ type: 'ticket', id: t.id })}
                      className={cn('w-full px-3 py-2 text-left hover:bg-gray-50', view.type === 'ticket' && view.id === t.id && 'bg-[#003365]/5')}
                    >
                      <span className="flex items-center gap-1.5">
                        {t.pro_unread && <span className="h-2 w-2 shrink-0 rounded-full bg-[#e0b400]" aria-label="New reply" />}
                        <span className="truncate text-sm font-medium text-gray-900">{t.subject}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-gray-500">
                        <span className={cn('rounded px-1.5 py-0.5 text-[10.5px] font-semibold', STATUS_STYLE[t.status])}>{STATUS_TEXT[t.status] ?? t.status}</span>
                        {KIND_TEXT[t.kind] ?? t.kind} · #{t.number} · {when(t.updated_at)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white">
            <h2 className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm font-semibold text-[#003365]">
              Recent chats <span className="text-[11px] font-normal text-gray-400">{chats.length} of {limit} kept</span>
            </h2>
            {chats.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-500">Your chats with the agent show up here. The newest {limit} are kept.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {chats.map((c) => (
                  <li key={c.id} className={cn('group flex items-center', view.type === 'chat' && view.id === c.id && 'bg-[#003365]/5')}>
                    <button type="button" onClick={() => openChat(c.id)} className="min-w-0 flex-1 px-3 py-2 text-left hover:bg-gray-50">
                      <span className="block truncate text-sm text-gray-900">{c.title || 'Chat'}</span>
                      <span className="text-[11.5px] text-gray-500">{when(c.last_message_at)}</span>
                    </button>
                    {!readOnly && (
                      <button type="button" onClick={() => deleteChat(c.id)} className="px-2 text-gray-300 hover:text-red-600" aria-label="Delete chat">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <main className="order-1 flex min-h-[460px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50 md:order-2 md:min-h-0">
          {view.type === 'chat' &&
            (chatLoading ? (
              <div className="grid flex-1 place-items-center text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <ChatThread
                endpoint="/api/pro/support/chat/"
                variant="pro"
                conversationId={view.id}
                initialMessages={chatMessages}
                disabledReason={disabledReason}
                placeholder="Ask about an install, a product, your orders or warranty jobs…"
                onConversation={(id) => setView({ type: 'chat', id })}
                onTurnDone={refresh}
                empty={
                  <div className="mx-auto max-w-md space-y-3 pt-6 text-center">
                    <MessagesSquare className="mx-auto h-8 w-8 text-[#003365]/40" />
                    <p className="text-base font-semibold text-[#003365]">How can we help today?</p>
                    <p className="text-sm text-gray-500">
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
        </main>
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

  if (error) return <p className="p-6 text-sm text-red-600">{error}</p>
  if (!data) {
    return (
      <div className="grid flex-1 place-items-center text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }
  const t = data.ticket
  const closed = t.status === 'resolved' || t.status === 'wont_fix'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-500">
          {t.kindLabel} · #{t.number}
        </p>
        <h2 className="text-lg font-bold text-[#003365]">{t.subject}</h2>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] text-gray-500">
          <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-semibold', STATUS_STYLE[t.status])}>{t.statusLabel}</span>
          Opened {new Date(t.createdAt).toLocaleDateString()}
          {t.conversationId && (
            <button type="button" onClick={() => onOpenChat(t.conversationId!)} className="font-semibold text-[#0b5cad] hover:underline">
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
                m.mine ? 'rounded-br-md bg-[#003365] text-white' : m.staff ? 'rounded-bl-md border border-[#F9EA1C] bg-[#FFFBD6] text-gray-900' : 'rounded-bl-md border border-gray-200 bg-white text-gray-900',
              )}
            >
              <p className={cn('mb-1 text-[11px] font-semibold', m.mine ? 'text-white/70' : 'text-[#003365]')}>
                {m.from} · {when(m.at)}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
            </div>
          </div>
        ))}
        {closed && t.resolution && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-900">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide">Resolution</p>
            <p className="whitespace-pre-wrap">{t.resolution}</p>
          </div>
        )}
      </div>
      {readOnly ? (
        <p className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">Read-only in admin view.</p>
      ) : (
        <form
          className="flex items-end gap-2 border-t border-gray-200 bg-white p-3"
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
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#003365] focus:outline-none focus:ring-2 focus:ring-[#003365]/20"
          />
          <button type="submit" disabled={busy || !reply.trim()} className="grid h-11 w-11 place-items-center rounded-xl bg-[#003365] text-white disabled:opacity-40" aria-label="Send reply">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      )}
    </div>
  )
}

function FeedbackForm({ onSent }: { onSent: (id: string) => void }) {
  const [kind, setKind] = useState<'general_feedback' | 'feature_request'>('general_feedback')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const field = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#003365] focus:outline-none focus:ring-2 focus:ring-[#003365]/20'

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
      <h2 className="text-lg font-bold text-[#003365]">Send feedback</h2>
      <p className="text-sm text-gray-500">Only the Crazy Seal team sees what you send. You’ll get replies here and by email.</p>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['general_feedback', 'Feedback or knowledge', 'Something we should know, or something that isn’t working right'],
            ['feature_request', 'Feature request', 'Something you wish the Pro Hub or the agent could do'],
          ] as const
        ).map(([key, label, hint]) => (
          <button
            key={key}
            type="button"
            onClick={() => setKind(key)}
            className={cn('rounded-xl border p-3 text-left', kind === key ? 'border-[#003365] bg-[#003365]/5' : 'border-gray-200 bg-white hover:border-gray-300')}
          >
            <span className="block text-sm font-semibold text-[#003365]">{label}</span>
            <span className="mt-0.5 block text-[12px] text-gray-500">{hint}</span>
          </button>
        ))}
      </div>
      <input className={field} placeholder="Short title (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} />
      <textarea className={`${field} min-h-[140px]`} placeholder="Tell us more…" value={body} onChange={(e) => setBody(e.target.value)} required maxLength={4000} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy || !body.trim()} className="flex items-center gap-2 rounded-lg bg-[#003365] px-4 py-2 text-sm font-semibold text-white hover:bg-[#002347] disabled:opacity-50">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Send
      </button>
    </form>
  )
}

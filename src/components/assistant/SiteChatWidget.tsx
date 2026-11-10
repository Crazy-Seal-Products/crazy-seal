'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, MessageCircle, RotateCcw, UserRound, X } from 'lucide-react'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { FormTurnstile } from '@/components/forms/FormTurnstile'
import { ChatThread, type ChatMessage } from './ChatThread'

/**
 * The customer chat on crazyseal.com: a button in the corner that opens the
 * assistant. "Talk to a person" sends the chat to the support team. The chat
 * id and its token stay in this browser so a returning visitor sees the
 * chat, and any reply from the team, when they reopen it.
 */

const STORE_KEY = 'cs_site_chat'
const OPEN_KEY = 'cs_site_chat_open'

interface Saved {
  id: string
  token: string
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    return null
  }
}

function save(value: Saved | null) {
  try {
    if (value) localStorage.setItem(STORE_KEY, JSON.stringify(value))
    else localStorage.removeItem(STORE_KEY)
  } catch {
    /* private mode: the chat just won't survive a reload */
  }
}

function visitorId(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)rva_visitor_id=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

interface Reply {
  body: string
  from: string | null
  at: string
}

const PREVIEW_KEY = 'cs_site_chat_preview'

/**
 * Shown to everyone when NEXT_PUBLIC_SITE_CHAT=on. Before that, open any
 * page with ?chat=on to try it in this browser (?chat=off hides it again).
 */
// The widget only renders in the browser (loaded with ssr: false), so state
// can start from browser storage directly.

function previewOn(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('chat')
    if (param === 'on') localStorage.setItem(PREVIEW_KEY, '1')
    if (param === 'off') localStorage.removeItem(PREVIEW_KEY)
    return localStorage.getItem(PREVIEW_KEY) === '1'
  } catch {
    return false
  }
}

function wasOpen(): boolean {
  try {
    return sessionStorage.getItem(OPEN_KEY) === '1'
  } catch {
    return false
  }
}

export function SiteChatGate() {
  const [show] = useState(() => process.env.NEXT_PUBLIC_SITE_CHAT === 'on' || previewOn())
  return show ? <SiteChatWidget /> : null
}

export function SiteChatWidget() {
  const [open, setOpen] = useState(wasOpen)
  const [mode, setMode] = useState<'chat' | 'handoff' | 'sent'>('chat')
  const [saved, setSaved] = useState<Saved | null>(load)
  const [initial, setInitial] = useState<ChatMessage[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [handoffNumber, setHandoffNumber] = useState<number | null>(null)
  // Nothing to fetch for a visitor without a saved chat.
  const [loaded, setLoaded] = useState(() => !load())
  const [turnstile, setTurnstile] = useState<string | null>(null)
  const [needsVerify, setNeedsVerify] = useState(false)
  /** Changes only on "start over", so starting a chat doesn't remount the thread mid-answer. */
  const [chatKey, setChatKey] = useState(0)
  const turnstileRef = useRef<TurnstileInstance>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(OPEN_KEY, open ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [open])

  // Reopening: fetch the chat so far and any team replies.
  useEffect(() => {
    if (!open || loaded || !saved) return
    fetch(`/api/assistant/chat/?conversationId=${encodeURIComponent(saved.id)}&token=${encodeURIComponent(saved.token)}`)
      .then(async (res) => {
        if (!res.ok) {
          save(null)
          setSaved(null)
          return
        }
        const data = (await res.json()) as { messages: ChatMessage[]; replies: Reply[]; handoff: { number: number } | null }
        setInitial(data.messages)
        setReplies(data.replies)
        setHandoffNumber(data.handoff?.number ?? null)
      })
      .finally(() => setLoaded(true))
  }, [open, loaded, saved])

  const startOver = () => {
    save(null)
    setSaved(null)
    setInitial([])
    setReplies([])
    setHandoffNumber(null)
    setMode('chat')
    setTurnstile(null)
    setLoaded(true)
    setChatKey((k) => k + 1)
  }

  const extraBody = useCallback(
    () => ({
      token: saved?.token,
      turnstileToken: saved ? undefined : turnstile,
      pageUrl: window.location.pathname,
      visitorId: visitorId(),
    }),
    [saved, turnstile],
  )

  const verified = Boolean(saved) || Boolean(turnstile)

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-[88px] right-4 z-40 flex items-center gap-2 rounded-full bg-[#003365] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(0,32,67,0.55)] transition hover:bg-[#002347] md:bottom-6 md:right-6"
          aria-label="Open chat with Crazy Seal"
        >
          <MessageCircle className="h-5 w-5 text-[#F9EA1C]" />
          <span>Questions? Chat</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Crazy Seal chat"
          className="fixed inset-x-2 bottom-2 top-16 z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl md:inset-auto md:bottom-6 md:right-6 md:h-[620px] md:max-h-[calc(100vh-48px)] md:w-[400px]"
        >
          <header className="flex items-center gap-2 bg-[#003365] px-3 py-2.5 text-white">
            {mode === 'handoff' && (
              <button type="button" onClick={() => setMode('chat')} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Back to chat">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="grid h-8 w-8 place-items-center rounded-md bg-[#F9EA1C] text-[11px] font-bold text-[#003365]">CS</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight">Crazy Seal</p>
              <p className="text-[11px] text-white/70">{mode === 'chat' ? 'AI assistant · a person is a tap away' : 'Talk to a person'}</p>
            </div>
            {saved && mode === 'chat' && (
              <button type="button" onClick={startOver} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Start a new chat" title="Start a new chat">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </header>

          {!loaded ? (
            <div className="grid flex-1 place-items-center text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : mode === 'chat' ? (
            <ChatThread
              key={chatKey}
              endpoint="/api/assistant/chat/"
              variant="site"
              conversationId={saved?.id ?? null}
              initialMessages={initial}
              autoFocus
              placeholder={verified || !needsVerify ? 'Ask about products, installs, warranty…' : 'Please finish the check below first'}
              extraBody={extraBody}
              onConversation={(id, token) => {
                if (!token) return
                const value = { id, token }
                save(value)
                setSaved(value)
              }}
              onRequestError={(status, body) => {
                if (body.verify) {
                  setNeedsVerify(true)
                  setTurnstile(null)
                  turnstileRef.current?.reset()
                }
                return false
              }}
              empty={
                <div className="space-y-3 px-1 pt-2 text-[14px] text-gray-700">
                  <p className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3.5 py-2.5">
                    Hi! I can answer questions about Crazy Seal products, installation, warranty, shipping and ordering. What are you working on?
                  </p>
                  <p className="px-1 text-[12.5px] text-gray-500">
                    Try: “Will it work on my RV roof?” · “How long is the warranty?” · “How much do I need?”
                  </p>
                </div>
              }
              footer={
                <div className="space-y-2 px-3 pb-2">
                  {replies.map((r, i) => (
                    <div key={i} className="rounded-xl border border-[#F9EA1C] bg-[#FFFBD6] px-3 py-2 text-[13.5px] text-gray-900">
                      <p className="mb-1 text-[11.5px] font-semibold text-[#003365]">{r.from || 'Crazy Seal Support'} replied</p>
                      <p className="whitespace-pre-wrap">{r.body}</p>
                    </div>
                  ))}
                  {/* Usually invisible; shows a checkbox only if Cloudflare wants one. */}
                  {!saved && <FormTurnstile id="site-chat-turnstile" turnstileRef={turnstileRef} onToken={setTurnstile} appearance="interaction-only" />}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] leading-snug text-gray-500">AI answers can be wrong. Chats may be reviewed to improve service.</p>
                    {handoffNumber ? (
                      <span className="shrink-0 text-[12px] font-semibold text-[#003365]">Request #{handoffNumber} sent</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMode('handoff')}
                        className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#003365]/25 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#003365] hover:bg-[#003365]/5"
                      >
                        <UserRound className="h-3.5 w-3.5" />
                        Talk to a person
                      </button>
                    )}
                  </div>
                </div>
              }
            />
          ) : (
            <HandoffForm
              saved={saved}
              onSent={(number, conversation) => {
                setHandoffNumber(number)
                if (conversation && !saved) {
                  save(conversation)
                  setSaved(conversation)
                }
                setMode('sent')
              }}
              sent={mode === 'sent'}
              number={handoffNumber}
              onBack={() => setMode('chat')}
            />
          )}
        </div>
      )}
    </>
  )
}

function HandoffForm({
  saved,
  onSent,
  sent,
  number,
  onBack,
}: {
  saved: Saved | null
  onSent: (number: number, conversation: Saved | null) => void
  sent: boolean
  number: number | null
  onBack: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  if (sent) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#F9EA1C] text-[#003365]">
          <UserRound className="h-6 w-6" />
        </div>
        <p className="text-base font-bold text-[#003365]">Sent{number ? ` (request #${number})` : ''}</p>
        <p className="text-sm text-gray-600">A member of the Crazy Seal team will reply by email, usually within one business day. Replies also show up here.</p>
        <p className="text-sm text-gray-600">Urgent? Call (800) 963-0131, Mon–Fri 9AM–6PM EST.</p>
        <button type="button" onClick={onBack} className="mt-2 text-sm font-semibold text-[#003365] underline">
          Back to chat
        </button>
      </div>
    )
  }

  const field = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-900 focus:border-[#003365] focus:outline-none focus:ring-2 focus:ring-[#003365]/20'

  return (
    <form
      className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
          const res = await fetch('/api/assistant/handoff/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: saved?.id,
              token: saved?.token,
              name,
              email,
              phone,
              message,
              website,
              turnstileToken: token,
              pageUrl: window.location.pathname,
            }),
          })
          const data = (await res.json()) as { error?: string; number?: number; conversationId?: string; token?: string }
          if (!res.ok) {
            setError(data.error || 'Could not send. Please try again.')
            turnstileRef.current?.reset()
            setToken(null)
            return
          }
          onSent(data.number ?? 0, data.conversationId && data.token ? { id: data.conversationId, token: data.token } : null)
        } finally {
          setBusy(false)
        }
      }}
    >
      <p className="text-[13.5px] text-gray-600">
        Tell us what’s going on and a person on the Crazy Seal team will get back to you.{saved ? ' We’ll see your chat with the assistant too.' : ''}
      </p>
      <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
      <input className={field} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      <input className={field} placeholder="Phone (optional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      <textarea className={`${field} min-h-[110px]`} placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={4000} />
      <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />
      {!saved && <FormTurnstile id="site-handoff-turnstile" turnstileRef={turnstileRef} onToken={setToken} />}
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy || (!saved && !token && process.env.NODE_ENV === 'production')}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#003365] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#002347] disabled:opacity-50"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Send to the team
      </button>
    </form>
  )
}

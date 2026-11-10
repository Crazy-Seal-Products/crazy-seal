'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Search } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { markdownToHtml } from './markdown'

/**
 * The chat itself, shared by the site widget, the Pro Hub Support tab and the
 * admin Assistant. Posts to `endpoint` and reads the newline-delimited JSON
 * events from src/lib/ai/chat.ts as they stream in.
 */

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  failed?: boolean
}

export type ChatVariant = 'site' | 'pro' | 'admin'

const TOOL_LABEL: Record<string, string> = {
  search_knowledge: 'Searching Crazy Seal resources…',
  get_my_account: 'Checking your account…',
  list_my_orders: 'Looking up your orders…',
  list_my_warranty_jobs: 'Looking up your warranty jobs…',
  open_support_request: 'Opening a support request…',
  find_customers: 'Searching customers…',
  find_orders: 'Searching orders…',
  find_warranties: 'Searching warranties…',
}

const STYLE: Record<ChatVariant, { user: string; bot: string; failed: string; input: string; send: string; muted: string; prose: string }> = {
  site: {
    user: 'bg-[#003365] text-white',
    bot: 'bg-white text-gray-900 border border-gray-200',
    failed: 'bg-red-50 text-red-800 border border-red-200',
    input: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#003365] focus:ring-[#003365]/20',
    send: 'bg-[#003365] text-white hover:bg-[#002347]',
    muted: 'text-gray-500',
    prose: '[&_a]:text-[#0b5cad]',
  },
  pro: {
    user: 'bg-[#003365] text-white',
    bot: 'bg-white text-gray-900 border border-gray-200 shadow-sm',
    failed: 'bg-red-50 text-red-800 border border-red-200',
    input: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#003365] focus:ring-[#003365]/20',
    send: 'bg-[#003365] text-white hover:bg-[#002347]',
    muted: 'text-gray-500',
    prose: '[&_a]:text-[#0b5cad]',
  },
  admin: {
    user: 'bg-adm-blue-bright/15 text-adm-ink ring-1 ring-inset ring-adm-blue-bright/30',
    bot: 'adm-glass text-adm-text',
    failed: 'bg-red-500/10 text-adm-red ring-1 ring-inset ring-red-400/30',
    input: 'bg-adm-input border-adm-line text-adm-ink placeholder:text-adm-muted focus:border-adm-blue-bright focus:ring-adm-blue-bright/25',
    send: 'bg-adm-blue-bright text-white hover:brightness-110',
    muted: 'text-adm-muted',
    prose: '[&_a]:text-adm-blue-bright',
  },
}

export interface ChatThreadProps {
  endpoint: string
  variant: ChatVariant
  conversationId: string | null
  initialMessages?: ChatMessage[]
  placeholder?: string
  /** Shown when there are no messages yet. */
  empty?: React.ReactNode
  /** Extra fields for each POST (e.g. the site chat's token and Turnstile token). */
  extraBody?: () => Record<string, unknown>
  /** Called with the chat id (and the site chat's token) when the server starts a chat. */
  onConversation?: (id: string, token?: string) => void
  /** Called after each answer finishes (e.g. to refresh a chat list). */
  onTurnDone?: () => void
  /** A failed POST: return true if handled (e.g. the site widget re-runs Turnstile). */
  onRequestError?: (status: number, body: { error?: string; verify?: boolean }) => boolean
  /** Shown instead of the input box (read-only views). */
  disabledReason?: string | null
  /** Rendered under the messages, above the input (e.g. "Talk to a person"). */
  footer?: React.ReactNode
  className?: string
  autoFocus?: boolean
}

export function ChatThread({
  endpoint,
  variant,
  conversationId,
  initialMessages = [],
  placeholder = 'Ask a question…',
  empty,
  extraBody,
  onConversation,
  onTurnDone,
  onRequestError,
  disabledReason,
  footer,
  className,
  autoFocus,
}: ChatThreadProps) {
  const s = STYLE[variant]
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const idRef = useRef<string | null>(conversationId)
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Switching chats loads the other chat's messages. The parent echoing back
  // the id of a chat this thread just started is not a switch.
  useEffect(() => {
    if (conversationId && conversationId === idRef.current) return
    idRef.current = conversationId
    setMessages(initialMessages)
    setError(null)
    // Only when the chat id changes, not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, status])

  async function send(text: string) {
    const message = text.trim()
    if (!message || busy) return
    setError(null)
    setBusy(true)
    setStatus(null)
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: message }, { role: 'assistant', content: '' }])

    const appendToLast = (fn: (last: ChatMessage) => ChatMessage) =>
      setMessages((m) => {
        const copy = [...m]
        copy[copy.length - 1] = fn(copy[copy.length - 1])
        return copy
      })

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(extraBody?.() ?? {}), conversationId: idRef.current, message }),
      })
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; verify?: boolean }
        setMessages((m) => m.slice(0, -2))
        setInput(message)
        if (!onRequestError?.(res.status, body)) setError(body.error || 'Something went wrong. Please try again.')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let nl: number
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim()
          buffer = buffer.slice(nl + 1)
          if (!line) continue
          const event = JSON.parse(line) as
            | { t: 'meta'; conversationId: string; token?: string }
            | { t: 'text'; d: string }
            | { t: 'tool'; name: string }
            | { t: 'done' }
            | { t: 'error'; message: string }
          if (event.t === 'meta') {
            if (!idRef.current) {
              idRef.current = event.conversationId
              onConversation?.(event.conversationId, event.token)
            }
          } else if (event.t === 'text') {
            setStatus(null)
            appendToLast((last) => ({ ...last, content: last.content + event.d }))
          } else if (event.t === 'tool') {
            setStatus(TOOL_LABEL[event.name] ?? 'Looking that up…')
          } else if (event.t === 'error') {
            appendToLast((last) => (last.content ? last : { ...last, content: event.message, failed: true }))
          }
        }
      }
    } catch {
      appendToLast((last) => (last.content ? last : { ...last, content: 'The connection dropped. Please try again.', failed: true }))
    } finally {
      setBusy(false)
      setStatus(null)
      onTurnDone?.()
      inputRef.current?.focus()
    }
  }

  const waiting = busy && messages[messages.length - 1]?.content === ''

  return (
    <div className={twMerge('flex min-h-0 flex-1 flex-col', className)}>
      <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3" aria-live="polite">
        {messages.length === 0 && empty}
        {messages.map((m, i) =>
          m.role === 'assistant' && !m.content ? null : (
            <div key={i} className={twMerge('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={twMerge(
                  'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed',
                  m.role === 'user' ? `${s.user} rounded-br-md whitespace-pre-wrap` : `${m.failed ? s.failed : s.bot} rounded-bl-md`,
                  m.role === 'assistant' && `space-y-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 ${s.prose}`,
                )}
                {...(m.role === 'assistant'
                  ? { dangerouslySetInnerHTML: { __html: markdownToHtml(m.content) } }
                  : { children: m.content })}
              />
            </div>
          ),
        )}
        {waiting && (
          <div className={twMerge('flex items-center gap-2 px-1 text-[13px]', s.muted)}>
            {status ? <Search className="h-3.5 w-3.5 animate-pulse" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {status ?? 'Thinking…'}
          </div>
        )}
        {busy && !waiting && status && (
          <div className={twMerge('flex items-center gap-2 px-1 text-[13px]', s.muted)}>
            <Search className="h-3.5 w-3.5 animate-pulse" />
            {status}
          </div>
        )}
      </div>

      {footer}

      {disabledReason ? (
        <p className={twMerge('border-t px-3 py-3 text-[13px]', variant === 'admin' ? 'border-adm-line' : 'border-gray-200', s.muted)}>{disabledReason}</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void send(input)
          }}
          className={twMerge('border-t p-2.5', variant === 'admin' ? 'border-adm-line' : 'border-gray-200')}
        >
          {error && <p className="mb-2 px-1 text-[12.5px] text-red-600">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send(input)
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={placeholder}
              autoFocus={autoFocus}
              aria-label="Message"
              className={twMerge(
                'max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2',
                s.input,
              )}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className={twMerge('grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl transition disabled:opacity-40', s.send)}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

'use client'

import React, { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { ActionResult } from '../controls'
import { BUTTON, inputCls, labelCls, textareaCls } from '../styles'

/** Forms for the Support inbox and AI review pages. Each calls a server action passed in from the page. */

function useAction() {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)
  const run = (fn: () => Promise<ActionResult>, onOk?: () => void) => {
    setResult(null)
    start(async () => {
      const r = await fn()
      setResult(r)
      if (r.ok) onOk?.()
    })
  }
  return { pending, result, run }
}

function Result({ result }: { result: ActionResult | null }) {
  if (!result) return null
  return <span className={twMerge('text-[11.5px]', result.ok ? 'text-adm-green' : 'text-adm-red')}>{result.ok ? result.message ?? 'Saved' : result.error}</span>
}

function Submit({ pending, children, tone = 'default' }: { pending: boolean; children: React.ReactNode; tone?: 'default' | 'gold' }) {
  return (
    <button type="submit" disabled={pending} className={BUTTON[tone]}>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  )
}

export function ReplyBox({
  action,
  canReply,
  replyHint,
}: {
  action: (body: string, internal: boolean) => Promise<ActionResult>
  canReply: boolean
  replyHint: string
}) {
  const [body, setBody] = useState('')
  const [internal, setInternal] = useState(!canReply)
  const { pending, result, run } = useAction()
  return (
    <form
      className="space-y-2 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        run(() => action(body, internal), () => setBody(''))
      }}
    >
      <div className="flex gap-1">
        {canReply && (
          <button
            type="button"
            onClick={() => setInternal(false)}
            className={twMerge('rounded-md px-2.5 py-1 text-[12px] font-medium', !internal ? 'bg-adm-blue-bright/15 text-adm-ink' : 'text-adm-muted hover:text-adm-ink')}
          >
            Reply
          </button>
        )}
        <button
          type="button"
          onClick={() => setInternal(true)}
          className={twMerge('rounded-md px-2.5 py-1 text-[12px] font-medium', internal ? 'bg-adm-gold/15 text-adm-gold-text' : 'text-adm-muted hover:text-adm-ink')}
        >
          Internal note
        </button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className={twMerge(textareaCls, 'min-h-[7rem]', internal && 'border-adm-gold/40')}
        placeholder={internal ? 'Only staff see this.' : replyHint}
        maxLength={10000}
      />
      <div className="flex items-center gap-2">
        <Submit pending={pending} tone={internal ? 'default' : 'gold'}>
          {internal ? 'Add note' : 'Send reply'}
        </Submit>
        <Result result={result} />
      </div>
    </form>
  )
}

export function ResolutionBox({ initial, action }: { initial: string; action: (text: string) => Promise<ActionResult> }) {
  const [text, setText] = useState(initial)
  const { pending, result, run } = useAction()
  return (
    <form
      className="space-y-2 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        run(() => action(text))
      }}
    >
      <textarea value={text} onChange={(e) => setText(e.target.value)} className={textareaCls} placeholder="What was wrong and what fixed it. Dealers see this once it's resolved." />
      <div className="flex items-center gap-2">
        <Submit pending={pending}>Save</Submit>
        <Result result={result} />
      </div>
    </form>
  )
}

export function EvalCaseForm({
  action,
  defaults,
}: {
  action: (input: { assistant: string; question: string; facts: string; behavior: string; notes: string }) => Promise<ActionResult>
  defaults: { assistant: string; question: string }
}) {
  const [assistant, setAssistant] = useState(defaults.assistant)
  const [question, setQuestion] = useState(defaults.question)
  const [facts, setFacts] = useState('')
  const [behavior, setBehavior] = useState('answer')
  const [notes, setNotes] = useState('')
  const { pending, result, run } = useAction()
  return (
    <form
      className="grid gap-2 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        run(() => action({ assistant, question, facts, behavior, notes }), () => {
          setFacts('')
          setNotes('')
        })
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className={labelCls}>
          <span>Assistant</span>
          <select value={assistant} onChange={(e) => setAssistant(e.target.value)} className={inputCls}>
            <option value="customer">Customer (site)</option>
            <option value="dealer">Dealer (Pro Hub)</option>
            <option value="staff">Staff (admin)</option>
          </select>
        </label>
        <label className={labelCls}>
          <span>It should</span>
          <select value={behavior} onChange={(e) => setBehavior(e.target.value)} className={inputCls}>
            <option value="answer">Answer with the facts</option>
            <option value="decline">Say it doesn’t know / decline</option>
            <option value="handoff">Send them to a person</option>
            <option value="tool">Look it up</option>
          </select>
        </label>
      </div>
      <label className={labelCls}>
        <span>Question</span>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className={textareaCls} required />
      </label>
      <label className={labelCls}>
        <span>Facts a correct answer must include (one per line)</span>
        <textarea value={facts} onChange={(e) => setFacts(e.target.value)} className={textareaCls} placeholder={'50-year transferable warranty\nRegister within 30 days of install'} />
      </label>
      <label className={labelCls}>
        <span>Notes (optional)</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
      </label>
      <div className="flex items-center gap-2">
        <Submit pending={pending}>Save test case</Submit>
        <Result result={result} />
      </div>
    </form>
  )
}

export function KnowledgeNoteForm({
  action,
  initial,
  submitLabel = 'Add knowledge',
}: {
  action: (input: { title: string; body: string; audience: string }) => Promise<ActionResult>
  initial?: { title: string; body: string; audience: string }
  submitLabel?: string
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [audience, setAudience] = useState(initial?.audience ?? 'all')
  const { pending, result, run } = useAction()
  return (
    <form
      className="grid gap-2 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        run(() => action({ title, body, audience }), () => {
          if (!initial) {
            setTitle('')
            setBody('')
          }
        })
      }}
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
        <label className={labelCls}>
          <span>Topic</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Minimum temperature to apply" required />
        </label>
        <label className={labelCls}>
          <span>Who it’s for</span>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className={inputCls}>
            <option value="all">Everyone</option>
            <option value="dealer">Dealers & staff only</option>
          </select>
        </label>
      </div>
      <label className={labelCls}>
        <span>The facts, written the way you’d tell a customer</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} className={twMerge(textareaCls, 'min-h-[6rem]')} required />
      </label>
      <div className="flex items-center gap-2">
        <Submit pending={pending}>{submitLabel}</Submit>
        <Result result={result} />
      </div>
    </form>
  )
}

export function StaffFeedbackForm({ action }: { action: (kind: string, subject: string, body: string) => Promise<ActionResult> }) {
  const [kind, setKind] = useState('general_feedback')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const { pending, result, run } = useAction()
  return (
    <form
      className="grid gap-2 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        run(() => action(kind, subject, body), () => {
          setSubject('')
          setBody('')
        })
      }}
    >
      <div className="flex gap-1">
        {[
          ['general_feedback', 'Feedback or knowledge'],
          ['feature_request', 'Feature request'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setKind(key)}
            className={twMerge('rounded-md px-2.5 py-1 text-[12px] font-medium', kind === key ? 'bg-adm-blue-bright/15 text-adm-ink' : 'text-adm-muted hover:text-adm-ink')}
          >
            {label}
          </button>
        ))}
      </div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} placeholder="Short title (optional)" maxLength={150} />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className={twMerge(textareaCls, 'min-h-[5rem]')}
        placeholder={kind === 'feature_request' ? 'What should the admin or the assistant be able to do?' : 'Something the assistant should know, or anything that isn’t working right.'}
        required
      />
      <div className="flex items-center gap-2">
        <Submit pending={pending}>Send</Submit>
        <Result result={result} />
      </div>
    </form>
  )
}

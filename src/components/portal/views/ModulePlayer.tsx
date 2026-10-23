'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  HelpCircle,
  Image as ImageIcon,
  LayoutGrid,
  PartyPopper,
  PlayCircle,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import {
  PORTAL_MODULES,
  getPortalModule,
  lessonKey,
  moduleMinutes,
  moduleProgress,
  nextLesson,
  type Lesson,
  type LessonResource,
  type PortalModule,
} from '@/lib/portal/modules'
import { EASE_OUT_EXPO } from '@/components/motion'
import { useHydrated } from '@/lib/portal/client-store'
import { usePortal } from '../PortalContext'
import { VideoFrame } from '../VideoFrame'
import { Panel, ProgressRing, portalButton, portalGhostButton } from '../ui'

const KIND_META: Record<Lesson['kind'], { label: string; icon: LucideIcon }> = {
  video: { label: 'Video', icon: PlayCircle },
  assets: { label: 'Assets', icon: LayoutGrid },
  checklist: { label: 'Checklist', icon: ClipboardCheck },
  quiz: { label: 'Quick check', icon: HelpCircle },
}

const RESOURCE_ICONS: Record<LessonResource['type'], LucideIcon> = {
  pdf: FileText,
  page: ExternalLink,
  video: Video,
  images: ImageIcon,
  folder: FolderOpen,
}

export function ModulePlayer({ slug, initialLesson }: { slug: string; initialLesson?: string }) {
  const mod = getPortalModule(slug) as PortalModule
  const { completed, setLesson } = usePortal()
  const [activeId, setActiveId] = useState<string>(() => initialLesson ?? nextLesson(mod, completed).id)
  const [celebrate, setCelebrate] = useState(false)
  const hydrated = useHydrated()
  const positioned = useRef(false)

  // Without a deep link (?lesson=), reopen the first unfinished lesson once
  // saved progress from this browser is available.
  useEffect(() => {
    if (!hydrated || positioned.current || initialLesson) return
    positioned.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with client-only storage
    setActiveId(nextLesson(mod, completed).id)
  }, [hydrated, mod, completed, initialLesson])

  const index = mod.lessons.findIndex((l) => l.id === activeId)
  const lesson = mod.lessons[Math.max(0, index)]
  const progress = moduleProgress(mod, completed)
  const nextMod = PORTAL_MODULES.find((m) => m.number === mod.number + 1)
  const isDone = (l: Lesson) => completed.has(lessonKey(mod.slug, l.id))

  const select = (id: string) => {
    setActiveId(id)
    const url = new URL(window.location.href)
    url.searchParams.set('lesson', id)
    window.history.replaceState(null, '', url)
    if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const complete = () => {
    const key = lessonKey(mod.slug, lesson.id)
    const wasModuleDone = progress.done === progress.total
    setLesson(key, true)
    const willBeDone = mod.lessons.every((l) => l.id === lesson.id || isDone(l))
    if (willBeDone && !wasModuleDone) {
      setCelebrate(true)
      return
    }
    const unfinished = (l: Lesson) => l.id !== lesson.id && !isDone(l)
    const next =
      mod.lessons.slice(index + 1).find(unfinished) ?? mod.lessons.find(unfinished) ?? mod.lessons[index + 1]
    if (next) select(next.id)
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-blue-100/50">
        <Link href="/portal/modules/" className="hover:text-white">
          Accelerator Program
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white/80">Module {mod.number}</span>
      </nav>

      {/* Module header */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        className="relative mb-6 overflow-hidden rounded-3xl border border-white/[0.07] md:mb-8"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mod.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00152b] via-[#00152b]/90 to-[#00152b]/40" />
        <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-center md:p-8">
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">{mod.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100/65 md:text-base">{mod.summary}</p>
            <p className="mt-3 text-xs text-blue-100/50">
              Module {mod.number} of {PORTAL_MODULES.length} · {mod.lessons.length} lessons · ~{moduleMinutes(mod)} min ·{' '}
              <Link href={mod.publicHref} className="underline decoration-white/20 underline-offset-4 hover:text-white">
                public page
              </Link>
            </p>
          </div>
          <ProgressRing pct={progress.pct} size={112} stroke={10}>
            <div>
              <p className="text-2xl font-extrabold tabular-nums font-[family-name:var(--font-display)]">
                {progress.done}/{progress.total}
              </p>
              <p className="text-[10px] text-blue-100/55">lessons</p>
            </div>
          </ProgressRing>
        </div>
      </motion.header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Lesson */}
        <AnimatePresence mode="wait">
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="min-w-0"
          >
            <Panel className="!p-0 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4 md:px-6">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-light">
                    {React.createElement(KIND_META[lesson.kind].icon, { className: 'h-3.5 w-3.5' })}
                    Lesson {index + 1} · {KIND_META[lesson.kind].label} · {lesson.minutes} min
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold md:text-2xl">{lesson.title}</h2>
                </div>
                {isDone(lesson) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent-light">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
                  </span>
                )}
              </div>

              <div className="space-y-6 p-5 md:p-6">
                {lesson.kind === 'video' && (
                  <VideoFrame vimeoId={lesson.vimeoId} youtubeId={lesson.youtubeId} poster={lesson.poster} title={lesson.title} />
                )}

                <p className="text-base leading-relaxed text-blue-50/85">{lesson.summary}</p>

                {lesson.points && (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {lesson.points.map((p, i) => (
                      <motion.li
                        key={p}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06 }}
                        className="flex items-start gap-2.5 rounded-2xl bg-white/[0.04] p-3 text-sm ring-1 ring-white/[0.06]"
                      >
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/20 text-accent-light">
                          <Check className="h-3 w-3" strokeWidth={3.5} />
                        </span>
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                )}

                {lesson.kind === 'checklist' && lesson.checklist && (
                  <Checklist key={lesson.id} items={lesson.checklist} done={isDone(lesson)} onAllDone={complete} />
                )}

                {lesson.kind === 'quiz' && lesson.quiz && (
                  <Quiz key={lesson.id} quiz={lesson.quiz} done={isDone(lesson)} onCorrect={complete} />
                )}

                {lesson.resources && <Resources resources={lesson.resources} big={lesson.kind === 'assets'} />}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-4 md:px-6">
                <button
                  onClick={() => index > 0 && select(mod.lessons[index - 1].id)}
                  disabled={index === 0}
                  className={twMerge(portalGhostButton, 'disabled:pointer-events-none disabled:opacity-30')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  {isDone(lesson) ? (
                    <button onClick={() => setLesson(lessonKey(mod.slug, lesson.id), false)} className="text-xs text-blue-100/50 underline-offset-4 hover:text-white hover:underline">
                      Mark as not done
                    </button>
                  ) : (
                    lesson.kind !== 'quiz' && (
                      <button onClick={complete} className={portalButton}>
                        <Check className="h-4 w-4" />
                        Mark complete
                      </button>
                    )
                  )}
                  {index < mod.lessons.length - 1 ? (
                    <button onClick={() => select(mod.lessons[index + 1].id)} className={portalGhostButton}>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : nextMod ? (
                    <Link href={`/portal/modules/${nextMod.slug}/`} className={portalGhostButton}>
                      Module {nextMod.number}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </Panel>
          </motion.div>
        </AnimatePresence>

        {/* Lesson list */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Panel className="!p-3" delay={0.1}>
            <p className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/45">Lessons</p>
            <LayoutGroup id="lesson-list">
              <ol className="space-y-1">
                {mod.lessons.map((l, i) => {
                  const active = l.id === lesson.id
                  const done = isDone(l)
                  const KindIcon = KIND_META[l.kind].icon
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => select(l.id)}
                        className={twMerge(
                          'relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
                          active ? 'text-white' : 'text-blue-100/70 hover:bg-white/[0.04] hover:text-white'
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="lesson-active"
                            className="absolute inset-0 rounded-2xl bg-white/[0.07] ring-1 ring-white/10"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span
                          className={twMerge(
                            'relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black transition-colors',
                            done ? 'bg-accent text-white' : active ? 'bg-highlight text-primary' : 'bg-white/[0.08]'
                          )}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {done ? (
                              <motion.span key="done" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}>
                                <Check className="h-4 w-4" strokeWidth={3.5} />
                              </motion.span>
                            ) : (
                              <motion.span key="num" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                {i + 1}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                        <span className="relative min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{l.title}</span>
                          <span className="flex items-center gap-1 text-[11px] text-blue-100/45">
                            <KindIcon className="h-3 w-3" />
                            {KIND_META[l.kind].label} · {l.minutes} min
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </LayoutGroup>
          </Panel>

          <Panel className="mt-4 !p-4" delay={0.15}>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-highlight">Outcome</p>
            <p className="mt-1.5 text-sm text-blue-50/80">{mod.outcome}</p>
          </Panel>
        </aside>
      </div>

      <AnimatePresence>
        {celebrate && <Celebration mod={mod} nextMod={nextMod} onClose={() => setCelebrate(false)} />}
      </AnimatePresence>
    </>
  )
}

function Resources({ resources, big }: { resources: LessonResource[]; big: boolean }) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/45">Resources</p>
      <div className={twMerge('grid gap-2.5', big ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3')}>
        {resources.map((r, i) => {
          const Icon = RESOURCE_ICONS[r.type]
          const external = r.href.startsWith('http')
          return (
            <motion.a
              key={r.href}
              href={r.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={twMerge(
                'group flex items-center gap-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:ring-accent/30',
                big ? 'p-4' : 'p-3'
              )}
            >
              <span className={twMerge('grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white', big ? 'h-11 w-11' : 'h-9 w-9')}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{r.label}</span>
                <span className="block text-[11px] uppercase tracking-wider text-blue-100/45">{r.note ?? r.type}</span>
              </span>
              {r.type === 'pdf' ? (
                <Download className="h-4 w-4 shrink-0 text-blue-100/40 transition group-hover:text-accent-light" />
              ) : (
                <ArrowRight className="h-4 w-4 shrink-0 text-blue-100/40 transition group-hover:translate-x-1 group-hover:text-accent-light" />
              )}
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}

function Checklist({ items, done, onAllDone }: { items: string[]; done: boolean; onAllDone: () => void }) {
  const [ticked, setTicked] = useState<boolean[]>(() => items.map(() => done))
  const count = ticked.filter(Boolean).length

  const toggle = (i: number) => {
    const next = ticked.map((t, j) => (j === i ? !t : t))
    setTicked(next)
    if (!done && next.every(Boolean)) window.setTimeout(onAllDone, 450)
  }

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/45">
        Checklist
        <span className="tabular-nums normal-case tracking-normal">
          {count}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={item}>
            <button
              onClick={() => toggle(i)}
              className={twMerge(
                'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm ring-1 transition-all',
                ticked[i] ? 'bg-accent/10 ring-accent/30 text-blue-50' : 'bg-white/[0.04] ring-white/[0.07] hover:bg-white/[0.07]'
              )}
            >
              <span
                className={twMerge(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-colors',
                  ticked[i] ? 'border-accent bg-accent' : 'border-white/25'
                )}
              >
                <AnimatePresence>
                  {ticked[i] && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className={twMerge('transition', ticked[i] && 'line-through decoration-accent/60')}>{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Quiz({
  quiz,
  done,
  onCorrect,
}: {
  quiz: NonNullable<Lesson['quiz']>
  done: boolean
  onCorrect: () => void
}) {
  const [picked, setPicked] = useState<number | null>(done ? quiz.answer : null)
  const correct = picked === quiz.answer

  const pick = (i: number) => {
    if (picked === quiz.answer) return
    setPicked(i)
    if (i === quiz.answer && !done) window.setTimeout(onCorrect, 900)
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-secondary/25 to-transparent p-5 ring-1 ring-white/10">
      <p className="text-lg font-bold">{quiz.question}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {quiz.options.map((o, i) => {
          const isPicked = picked === i
          const right = isPicked && i === quiz.answer
          const wrong = isPicked && i !== quiz.answer
          return (
            <motion.button
              key={o}
              onClick={() => pick(i)}
              animate={wrong ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className={twMerge(
                'flex items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold ring-1 transition-colors',
                right
                  ? 'bg-accent/25 ring-accent text-white'
                  : wrong
                    ? 'bg-red-500/15 ring-red-400/50 text-red-100'
                    : 'bg-white/[0.05] ring-white/10 hover:bg-white/[0.09]'
              )}
            >
              {o}
              {right && <CheckCircle2 className="h-4 w-4 text-accent-light" />}
              {wrong && <X className="h-4 w-4 text-red-300" />}
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {picked !== null && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={twMerge('mt-4 text-sm', correct ? 'text-accent-light' : 'text-blue-100/70')}
          >
            {correct ? `Correct — ${quiz.explain}` : 'Not quite — give it another try.'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Celebration({ mod, nextMod, onClose }: { mod: PortalModule; nextMod?: PortalModule; onClose: () => void }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const angle = (i / 36) * Math.PI * 2
        const dist = 140 + ((i * 37) % 120)
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 40,
          rotate: (i * 47) % 360,
          color: ['#F9EA1C', '#6DC015', '#1A7BC4', '#ffffff'][i % 4],
          delay: (i % 6) * 0.02,
        }
      }),
    []
  )

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-5 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative w-full max-w-md overflow-visible rounded-3xl bg-gradient-to-b from-[#03305e] to-[#001a35] p-8 text-center ring-1 ring-white/15 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute left-1/2 top-16">
          {pieces.map((p, i) => (
            <motion.span
              key={i}
              className="absolute h-2.5 w-1.5 rounded-sm"
              style={{ background: p.color }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y + 120, opacity: 0, rotate: p.rotate + 360 }}
              transition={{ duration: 1.6, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
            />
          ))}
        </div>
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-highlight to-accent-light text-primary shadow-glow-highlight"
        >
          <PartyPopper className="h-8 w-8" />
        </motion.span>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-highlight">Module {mod.number} complete</p>
        <h2 className="mt-2 text-2xl font-extrabold">{mod.title}</h2>
        <p className="mt-2 text-sm text-blue-100/65">{mod.outcome}</p>
        <div className="mt-6 flex flex-col gap-2">
          {nextMod ? (
            <Link href={`/portal/modules/${nextMod.slug}/`} className={twMerge(portalButton, 'w-full')}>
              Start Module {nextMod.number}: {nextMod.eyebrow}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link href="/portal/modules/" className={twMerge(portalButton, 'w-full')}>
              See your program
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <button onClick={onClose} className="text-sm text-blue-100/55 hover:text-white">
            Stay here
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

'use client'

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react'
import type { AcceleratorProgram, PortalModule } from '@/lib/portal/modules'

/**
 * The training program in the contractor portal, and which lessons this
 * person has finished. Progress lives in this browser's localStorage, one
 * list per Pro Hub account (`cs-portal:progress:<proUserId>`). Storage can be
 * missing or blocked (private windows, previews), so every access is guarded
 * and the program still works, just without remembering.
 */

const EVENT = 'cs-portal-progress'

/** Stand-in when storage is blocked: progress lasts until the page closes. */
const memory = new Map<string, string | null>()

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    memory.set(key, value)
  }
  try {
    window.dispatchEvent(new Event(EVENT))
  } catch {
    // ignore
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(EVENT, callback)
  }
}

const noopSubscribe = () => () => {}

/** False during server rendering and hydration, true once saved progress can be read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

function parse(raw: string | null): ReadonlySet<string> {
  if (!raw) return new Set()
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set()
  } catch {
    return new Set()
  }
}

interface TrainingContextValue {
  program: AcceleratorProgram
  modules: PortalModule[]
  /** Lesson keys (`module-slug/lesson-id`) this person has finished. */
  completed: ReadonlySet<string>
  setLesson: (lesson: string, done: boolean) => void
  resetProgress: () => void
}

const TrainingContext = createContext<TrainingContextValue | null>(null)

export function TrainingProvider({
  proUserId,
  program,
  modules,
  children,
}: {
  proUserId: string
  program: AcceleratorProgram
  modules: PortalModule[]
  children: React.ReactNode
}) {
  const key = `cs-portal:progress:${proUserId}`
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  )
  const completed = useMemo(() => parse(raw), [raw])

  const setLesson = useCallback(
    (lesson: string, done: boolean) => {
      const next = new Set(parse(read(key)))
      if (done) next.add(lesson)
      else next.delete(lesson)
      write(key, JSON.stringify([...next]))
    },
    [key],
  )
  const resetProgress = useCallback(() => write(key, null), [key])

  const value = useMemo(() => ({ program, modules, completed, setLesson, resetProgress }), [program, modules, completed, setLesson, resetProgress])
  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>
}

export function useTraining(): TrainingContextValue {
  const ctx = useContext(TrainingContext)
  if (!ctx) throw new Error('useTraining must be used inside <TrainingProvider>')
  return ctx
}

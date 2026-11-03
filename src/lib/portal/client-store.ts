'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { PartnerBrand, PortalAccount } from './accounts'

/**
 * Demo persistence for the Pro Portal: lesson progress and white-label
 * settings live in localStorage per demo account, seeded from the account.
 * Swap these hooks for API calls when the portal moves to real auth.
 */

const EVENT = 'cs-portal-store'

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // storage unavailable (private mode) — the demo still works in memory
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(EVENT, callback)
  }
}

function useStoredString(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null
  )
}

const noopSubscribe = () => () => {}

/** False during SSR and hydration, true once client storage values are in use. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

// ── Lesson progress ──

export function useLessonProgress(account: Pick<PortalAccount, 'id' | 'completedLessons'>) {
  const key = `cs-portal:progress:${account.id}`
  const raw = useStoredString(key)

  const completed = useMemo<ReadonlySet<string>>(() => {
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return new Set(parsed.map(String))
      } catch {
        // fall through to the seed
      }
    }
    return new Set(account.completedLessons)
  }, [raw, account.completedLessons])

  const setLesson = useCallback(
    (lesson: string, done: boolean) => {
      const next = new Set(completed)
      if (done) next.add(lesson)
      else next.delete(lesson)
      write(key, JSON.stringify([...next]))
    },
    [completed, key]
  )

  const reset = useCallback(() => write(key, null), [key])

  return { completed, setLesson, reset }
}

// ── White-label brand ──

export function useBrand(account: Pick<PortalAccount, 'id' | 'brand'>) {
  const key = `cs-portal:brand:${account.id}`
  const raw = useStoredString(key)

  const brand = useMemo<PartnerBrand>(() => {
    if (raw) {
      try {
        return { ...account.brand, ...JSON.parse(raw) }
      } catch {
        // fall through to the seed
      }
    }
    return account.brand
  }, [raw, account.brand])

  const update = useCallback(
    (patch: Partial<PartnerBrand>) => write(key, JSON.stringify({ ...brand, ...patch })),
    [brand, key]
  )

  const reset = useCallback(() => write(key, null), [key])

  return { brand, update, reset }
}

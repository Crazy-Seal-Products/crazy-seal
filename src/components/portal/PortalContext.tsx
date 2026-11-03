'use client'

import React, { createContext, useContext } from 'react'
import type { PartnerBrand, PortalAccount } from '@/lib/portal/accounts'
import { useBrand, useLessonProgress } from '@/lib/portal/client-store'

interface PortalContextValue {
  account: PortalAccount
  completed: ReadonlySet<string>
  setLesson: (lesson: string, done: boolean) => void
  resetProgress: () => void
  brand: PartnerBrand
  updateBrand: (patch: Partial<PartnerBrand>) => void
  resetBrand: () => void
}

const PortalCtx = createContext<PortalContextValue | null>(null)

export function PortalProvider({ account, children }: { account: PortalAccount; children: React.ReactNode }) {
  const { completed, setLesson, reset: resetProgress } = useLessonProgress(account)
  const { brand, update: updateBrand, reset: resetBrand } = useBrand(account)
  return (
    <PortalCtx.Provider value={{ account, completed, setLesson, resetProgress, brand, updateBrand, resetBrand }}>
      {children}
    </PortalCtx.Provider>
  )
}

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalCtx)
  if (!ctx) throw new Error('usePortal must be used inside <PortalProvider>')
  return ctx
}

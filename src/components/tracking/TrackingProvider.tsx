'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useJourneyTracking, type UseJourneyTrackingReturn } from '@/hooks/useJourneyTracking'

const TrackingContext = createContext<UseJourneyTrackingReturn | null>(null)

interface TrackingProviderProps {
  children: ReactNode
}

export function TrackingProvider({ children }: TrackingProviderProps) {
  const tracking = useJourneyTracking()

  return (
    <TrackingContext.Provider value={tracking}>
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking(): UseJourneyTrackingReturn {
  const context = useContext(TrackingContext)

  if (!context) {
    return {
      isInitialized: false,
      visitorId: null,
      sessionId: null,
      isNewVisitor: false,
      isNewSession: false,
      utm: {},
      firstTouchUTM: {},
      trackEvent: async () => {},
      identify: async () => ({ success: false }),
      getAttribution: () => ({}),
      refreshSession: () => {}
    }
  }

  return context
}

export default TrackingProvider

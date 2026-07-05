'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  initializeSession,
  getCurrentSession,
  trackSession,
  trackPageView,
  trackEvent,
  identifyVisitor,
  refreshSession,
  isDoNotTrack,
  getStoredUTM,
  getFirstTouchUTM,
  type UTMParams,
} from '@/lib/tracking/client'

export interface JourneyTrackingState {
  isInitialized: boolean
  visitorId: string | null
  sessionId: string | null
  isNewVisitor: boolean
  isNewSession: boolean
  utm: UTMParams
  firstTouchUTM: UTMParams & { landing_page?: string; referrer?: string }
}

export interface JourneyTrackingActions {
  trackEvent: (eventType: string, eventData?: Record<string, unknown>) => Promise<void>
  identify: (data: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
  }) => Promise<{ success: boolean }>
  getAttribution: () => {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_content?: string
    utm_term?: string
    referrer?: string
    landing_page?: string
    session_id?: string
    visitor_id?: string
  }
  refreshSession: () => void
}

export type UseJourneyTrackingReturn = JourneyTrackingState & JourneyTrackingActions

export function useJourneyTracking(): UseJourneyTrackingReturn {
  const pathname = usePathname()
  const pageViewCount = useRef(0)
  const isInitializing = useRef(false)
  const lastTrackedPath = useRef<string | null>(null)

  const [state, setState] = useState<JourneyTrackingState>({
    isInitialized: false,
    visitorId: null,
    sessionId: null,
    isNewVisitor: false,
    isNewSession: false,
    utm: {},
    firstTouchUTM: {}
  })

  useEffect(() => {
    if (state.isInitialized || isInitializing.current) return
    if (isDoNotTrack()) {
      setState(prev => ({ ...prev, isInitialized: true }))
      return
    }

    isInitializing.current = true

    const init = async () => {
      try {
        const sessionData = initializeSession()
        const firstTouchUTM = getFirstTouchUTM()

        await trackSession({
          visitorId: sessionData.visitorId,
          sessionId: sessionData.sessionId,
          isNewVisitor: sessionData.isNewVisitor,
          isNewSession: sessionData.isNewSession,
          landingPage: sessionData.landingPage,
          referrer: sessionData.referrer,
          utm: sessionData.utm,
          clickIds: sessionData.clickIds,
          adClickData: sessionData.adClickData,
          urlParams: sessionData.urlParams,
          device: sessionData.device
        })

        setState({
          isInitialized: true,
          visitorId: sessionData.visitorId,
          sessionId: sessionData.sessionId,
          isNewVisitor: sessionData.isNewVisitor,
          isNewSession: sessionData.isNewSession,
          utm: sessionData.utm,
          firstTouchUTM
        })

        pageViewCount.current = 1
        lastTrackedPath.current = sessionData.landingPage

        await trackPageView({
          sessionId: sessionData.sessionId,
          visitorId: sessionData.visitorId,
          pagePath: sessionData.landingPage,
          pageTitle: typeof document !== 'undefined' ? document.title : '',
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          viewOrder: 1
        })
      } catch (error) {
        console.error('[Tracking] Initialization error:', error)
        setState(prev => ({ ...prev, isInitialized: true }))
      }
    }

    init()
  }, [state.isInitialized])

  useEffect(() => {
    if (!state.isInitialized || !state.visitorId || !state.sessionId) return
    if (lastTrackedPath.current === pathname) return

    lastTrackedPath.current = pathname
    pageViewCount.current += 1

    trackPageView({
      sessionId: state.sessionId,
      visitorId: state.visitorId,
      pagePath: pathname,
      pageTitle: typeof document !== 'undefined' ? document.title : '',
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      viewOrder: pageViewCount.current
    }).catch(error => {
      console.error('[Tracking] PageView error:', error)
    })

    refreshSession()
  }, [pathname, state.isInitialized, state.visitorId, state.sessionId])

  const handleTrackEvent = useCallback(async (
    eventType: string,
    eventData?: Record<string, unknown>
  ): Promise<void> => {
    if (!state.visitorId || !state.sessionId) return

    await trackEvent({
      visitorId: state.visitorId,
      sessionId: state.sessionId,
      eventType,
      eventData,
      pagePath: pathname
    })

    refreshSession()
  }, [state.visitorId, state.sessionId, pathname])

  const handleIdentify = useCallback(async (data: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
  }): Promise<{ success: boolean }> => {
    if (!state.visitorId || !state.sessionId) return { success: false }

    const result = await identifyVisitor({
      visitorId: state.visitorId,
      sessionId: state.sessionId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone
    })

    if (result.success) {
      await trackEvent({
        visitorId: state.visitorId,
        sessionId: state.sessionId,
        eventType: 'email_captured',
        eventData: { email: data.email },
        pagePath: pathname
      })
    }

    return result
  }, [state.visitorId, state.sessionId, pathname])

  const getAttribution = useCallback(() => {
    const storedUTM = getStoredUTM()
    const firstTouch = getFirstTouchUTM()
    const { visitorId, sessionId } = getCurrentSession()

    return {
      utm_source: storedUTM.utm_source || firstTouch.utm_source,
      utm_medium: storedUTM.utm_medium || firstTouch.utm_medium,
      utm_campaign: storedUTM.utm_campaign || firstTouch.utm_campaign,
      utm_content: storedUTM.utm_content || firstTouch.utm_content,
      utm_term: storedUTM.utm_term || firstTouch.utm_term,
      referrer: firstTouch.referrer,
      landing_page: firstTouch.landing_page,
      session_id: sessionId || undefined,
      visitor_id: visitorId || undefined
    }
  }, [])

  return {
    isInitialized: state.isInitialized,
    visitorId: state.visitorId,
    sessionId: state.sessionId,
    isNewVisitor: state.isNewVisitor,
    isNewSession: state.isNewSession,
    utm: state.utm,
    firstTouchUTM: state.firstTouchUTM,
    trackEvent: handleTrackEvent,
    identify: handleIdentify,
    getAttribution,
    refreshSession
  }
}

export default useJourneyTracking

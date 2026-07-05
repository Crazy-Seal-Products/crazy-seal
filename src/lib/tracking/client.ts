'use client'

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export interface ClickIds {
  gclid?: string
  fbclid?: string
  msclkid?: string
  ttclid?: string
  li_fat_id?: string
  gbraid?: string
  wbraid?: string
}

export interface AdClickData {
  matchtype?: string
  network?: string
  creative?: string
  placement?: string
  adposition?: string
  targetid?: string
  loc_physical?: string
  campaign_id?: string
  adset_id?: string
  adset_name?: string
  ad_id?: string
  ad_name?: string
  site_source?: string
  fb_placement?: string
  [key: string]: string | undefined
}

export interface SessionData {
  visitorId: string
  sessionId: string
  landingPage: string
  referrer: string
  utm: UTMParams
  clickIds: ClickIds
  adClickData: AdClickData
  urlParams: Record<string, string>
  device: DeviceInfo
  isNewVisitor: boolean
  isNewSession: boolean
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
}

export interface PageViewData {
  sessionId: string
  visitorId: string
  pagePath: string
  pageTitle: string
  pageUrl: string
  viewOrder: number
}

export interface TrackingEventData {
  visitorId: string
  sessionId: string
  eventType: string
  eventData?: Record<string, unknown>
  pagePath?: string
}

export interface IdentifyData {
  visitorId: string
  sessionId: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

const VISITOR_COOKIE = 'rva_visitor_id'
const SESSION_COOKIE = 'rva_session_id'
const UTM_COOKIE = 'rva_utm'
const FIRST_TOUCH_COOKIE = 'rva_first_touch'

const VISITOR_EXPIRY_DAYS = 365
const SESSION_EXPIRY_MINUTES = 30
const UTM_EXPIRY_MINUTES = 30

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=')
    if (cookieName === name) {
      return decodeURIComponent(cookieValue)
    }
  }
  return null
}

export function setCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number
    expires?: Date
    path?: string
    domain?: string
    secure?: boolean
    sameSite?: 'Strict' | 'Lax' | 'None'
  } = {}
): void {
  if (typeof document === 'undefined') return

  const {
    maxAge,
    expires,
    path = '/',
    domain,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'Lax'
  } = options

  let cookieString = `${name}=${encodeURIComponent(value)}`
  if (maxAge !== undefined) cookieString += `; max-age=${maxAge}`
  if (expires) cookieString += `; expires=${expires.toUTCString()}`
  if (path) cookieString += `; path=${path}`
  if (domain) cookieString += `; domain=${domain}`
  if (secure) cookieString += '; secure'
  cookieString += `; samesite=${sameSite}`

  document.cookie = cookieString
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function parseUTMFromURL(): UTMParams {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const utm: UTMParams = {}
  const s = params.get('utm_source')
  const m = params.get('utm_medium')
  const c = params.get('utm_campaign')
  const t = params.get('utm_term')
  const co = params.get('utm_content')
  if (s) utm.utm_source = s
  if (m) utm.utm_medium = m
  if (c) utm.utm_campaign = c
  if (t) utm.utm_term = t
  if (co) utm.utm_content = co
  return utm
}

export function parseClickIdsFromURL(): ClickIds {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const ids: ClickIds = {}
  const gclid = params.get('gclid')
  const fbclid = params.get('fbclid')
  const msclkid = params.get('msclkid')
  const ttclid = params.get('ttclid')
  const liFatId = params.get('li_fat_id')
  const gbraid = params.get('gbraid')
  const wbraid = params.get('wbraid')
  if (gclid) ids.gclid = gclid
  if (fbclid) ids.fbclid = fbclid
  if (msclkid) ids.msclkid = msclkid
  if (ttclid) ids.ttclid = ttclid
  if (liFatId) ids.li_fat_id = liFatId
  if (gbraid) ids.gbraid = gbraid
  if (wbraid) ids.wbraid = wbraid
  return ids
}

export function parseAdClickDataFromURL(): AdClickData {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const data: AdClickData = {}

  const matchtype = params.get('matchtype')
  const network = params.get('network')
  const creative = params.get('creative')
  const placement = params.get('placement')
  const adposition = params.get('adposition')
  const targetid = params.get('targetid')
  const locPhysical = params.get('loc_physical') || params.get('loc_physical_ms')
  if (matchtype) data.matchtype = matchtype
  if (network) data.network = network
  if (creative) data.creative = creative
  if (placement) data.placement = placement
  if (adposition) data.adposition = adposition
  if (targetid) data.targetid = targetid
  if (locPhysical) data.loc_physical = locPhysical

  const campaignId = params.get('campaign_id')
  const adsetId = params.get('adset_id')
  const adsetName = params.get('adset_name')
  const adId = params.get('ad_id')
  const adName = params.get('ad_name')
  const siteSource = params.get('site_source')
  const fbPlacement = params.get('fb_placement')
  if (campaignId) data.campaign_id = campaignId
  if (adsetId) data.adset_id = adsetId
  if (adsetName) data.adset_name = adsetName
  if (adId) data.ad_id = adId
  if (adName) data.ad_name = adName
  if (siteSource) data.site_source = siteSource
  if (fbPlacement) data.fb_placement = fbPlacement

  const adid = params.get('adid')
  if (adid && !data.creative) data.creative = adid

  return data
}

export function hasUTMParams(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return (
    params.has('utm_source') ||
    params.has('gclid') ||
    params.has('fbclid') ||
    params.has('msclkid') ||
    params.has('ttclid') ||
    params.has('li_fat_id') ||
    params.has('gbraid') ||
    params.has('wbraid')
  )
}

export function parseAllURLParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const result: Record<string, string> = {}
  new URLSearchParams(window.location.search).forEach((value, key) => {
    result[key] = value
  })
  return result
}

export function getStoredUTM(): UTMParams {
  const stored = getCookie(UTM_COOKIE)
  if (!stored) return {}
  try { return JSON.parse(stored) } catch { return {} }
}

export function storeUTM(utm: UTMParams): void {
  if (Object.keys(utm).length === 0) return
  setCookie(UTM_COOKIE, JSON.stringify(utm), { maxAge: UTM_EXPIRY_MINUTES * 60 })
}

export function getFirstTouchUTM(): UTMParams & { landing_page?: string; referrer?: string } {
  const stored = getCookie(FIRST_TOUCH_COOKIE)
  if (!stored) return {}
  try { return JSON.parse(stored) } catch { return {} }
}

export function storeFirstTouchUTM(data: UTMParams & { landing_page?: string; referrer?: string }): void {
  if (getCookie(FIRST_TOUCH_COOKIE)) return
  setCookie(FIRST_TOUCH_COOKIE, JSON.stringify(data), { maxAge: VISITOR_EXPIRY_DAYS * 24 * 60 * 60 })
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent.toLowerCase()
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*touch)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/.test(ua)) return 'mobile'
  return 'desktop'
}

export function getBrowser(): string {
  if (typeof navigator === 'undefined') return 'Unknown'
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('SamsungBrowser')) return 'Samsung'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  if (ua.includes('Trident')) return 'IE'
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  return 'Unknown'
}

export function getOS(): string {
  if (typeof navigator === 'undefined') return 'Unknown'
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return 'Unknown'
}

export function getDeviceInfo(): DeviceInfo {
  return { type: getDeviceType(), browser: getBrowser(), os: getOS() }
}

export function getOrCreateVisitorId(): { id: string; isNew: boolean } {
  let visitorId = getCookie(VISITOR_COOKIE)
  let isNew = false
  if (!visitorId) {
    visitorId = generateUUID()
    setCookie(VISITOR_COOKIE, visitorId, { maxAge: VISITOR_EXPIRY_DAYS * 24 * 60 * 60 })
    isNew = true
  }
  return { id: visitorId, isNew }
}

export function getOrCreateSessionId(forceNew: boolean = false): { id: string; isNew: boolean } {
  const existingSessionId = getCookie(SESSION_COOKIE)
  const newUTMParams = hasUTMParams()
  if (!existingSessionId || forceNew || newUTMParams) {
    const sessionId = generateUUID()
    setCookie(SESSION_COOKIE, sessionId, { maxAge: SESSION_EXPIRY_MINUTES * 60 })
    return { id: sessionId, isNew: true }
  }
  setCookie(SESSION_COOKIE, existingSessionId, { maxAge: SESSION_EXPIRY_MINUTES * 60 })
  return { id: existingSessionId, isNew: false }
}

export function refreshSession(): void {
  const sessionId = getCookie(SESSION_COOKIE)
  if (sessionId) {
    setCookie(SESSION_COOKIE, sessionId, { maxAge: SESSION_EXPIRY_MINUTES * 60 })
  }
}

export function getReferrer(): string {
  if (typeof document === 'undefined') return ''
  const referrer = document.referrer
  if (!referrer) return ''
  try {
    const referrerHost = new URL(referrer).hostname
    if (referrerHost === window.location.hostname) return ''
    return referrer
  } catch {
    return referrer
  }
}

const API_BASE = '/api/tracking'

export async function trackSession(data: {
  visitorId: string
  sessionId: string
  isNewVisitor: boolean
  isNewSession: boolean
  landingPage: string
  referrer: string
  utm: UTMParams
  clickIds: ClickIds
  adClickData: AdClickData
  urlParams: Record<string, string>
  device: DeviceInfo
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error('[Tracking] Session error:', error)
    return { success: false, error: 'Network error' }
  }
}

export async function trackPageView(data: PageViewData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error('[Tracking] PageView error:', error)
    return { success: false, error: 'Network error' }
  }
}

export async function trackEvent(data: TrackingEventData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error('[Tracking] Event error:', error)
    return { success: false, error: 'Network error' }
  }
}

export async function identifyVisitor(data: IdentifyData): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const response = await fetch(`${API_BASE}/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (!response.ok) return { success: false, error: result.message }
    return { success: true }
  } catch (error) {
    console.error('[Tracking] Identify error:', error)
    return { success: false, error: 'Network error' }
  }
}

export function initializeSession(): SessionData {
  const { id: visitorId, isNew: isNewVisitor } = getOrCreateVisitorId()
  const { id: sessionId, isNew: isNewSession } = getOrCreateSessionId()
  const landingPage = typeof window !== 'undefined' ? window.location.pathname : '/'
  const referrer = getReferrer()
  const utm = parseUTMFromURL()
  const clickIds = parseClickIdsFromURL()
  const adClickData = parseAdClickDataFromURL()
  const urlParams = parseAllURLParams()
  const device = getDeviceInfo()

  if (Object.keys(utm).length > 0) storeUTM(utm)
  if (isNewVisitor) {
    storeFirstTouchUTM({ ...utm, landing_page: landingPage, referrer })
  }

  return {
    visitorId, sessionId, landingPage, referrer,
    utm, clickIds, adClickData, urlParams, device,
    isNewVisitor, isNewSession
  }
}

export function getCurrentSession(): { visitorId: string | null; sessionId: string | null } {
  return { visitorId: getCookie(VISITOR_COOKIE), sessionId: getCookie(SESSION_COOKIE) }
}

export function isDoNotTrack(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.doNotTrack === '1' ||
    navigator.doNotTrack === 'yes' ||
    (window as unknown as { doNotTrack?: string }).doNotTrack === '1'
}

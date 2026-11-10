'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Loader2, LocateFixed, MapPin, Phone, Send, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { EASE_OUT_EXPO } from '@/components/motion'
import { rankByDistance, type Ranked } from '@/lib/contractors/geo'
import { brandStyle } from '@/lib/contractors/theme'
import { placeLabel, SEGMENT_LABEL, SERVICE_MODE_LABEL, telHref, type PublicContractor, type Segment } from '@/lib/contractors/types'
import { BrandMark } from './BrandMark'
import { ContractorMap, SEGMENT_PIN, type MapPoint } from './ContractorMap'

/**
 * The public contractor finder (/contractor). A small search over the map;
 * until someone searches, the map is the whole page. A ZIP (kept in the URL,
 * so results can be shared) or the visitor's location (?near=me in the URL;
 * the coordinates are never sent anywhere, the distance math runs in the
 * browser) brings up the nearest contractors beside the map, the closest one
 * first and largest. Every pin and card leads to the contractor's page.
 * docs/statecharts/contractor-finder models the search.
 */

const RESULTS = 6
/** Past this, the nearest results get a note that nobody is close. */
const FAR_MILES = 150

type Origin = { lat: number; lng: number; label: string }
type Filter = 'all' | Segment

const miles = (m: number) => (m < 1 ? '<1' : m < 10 ? m.toFixed(1) : Math.round(m).toLocaleString())

export function ContractorFinder({ contractors }: { contractors: PublicContractor[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const zipParam = params.get('zip')?.trim() ?? ''
  // "Near me" is a search in the address bar too (?near=me, never the coordinates), so the
  // menu link, Back and Clear end it the same way they end a ZIP search.
  const nearParam = params.get('near') === 'me'
  const [zip, setZip] = useState(zipParam)
  // The ZIP box follows the address bar, and leaving ?near=me forgets the location.
  const [shownParams, setShownParams] = useState({ zip: zipParam, near: nearParam })
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null)
  if (shownParams.zip !== zipParam || shownParams.near !== nearParam) {
    setShownParams({ zip: zipParam, near: nearParam })
    setZip(zipParam)
    if (!nearParam) setHere(null)
  }
  // Every ZIP's point, kept by ZIP, so an answer for an earlier search can't replace the latest's.
  const [zipPoints, setZipPoints] = useState<Record<string, { lat: number; lng: number }>>({})
  // Lookups still out (one entry per request) and whether the browser is still finding the visitor.
  const [pending, setPending] = useState<string[]>([])
  const [locating, setLocating] = useState(false)
  const busy = pending.length > 0 || locating
  const zipHit = zipParam ? zipPoints[zipParam] : undefined
  // The results are for the search in the address bar, and only once its answer is in.
  const origin = useMemo<Origin | null>(
    () => (nearParam ? (here ? { ...here, label: 'you' } : null) : zipHit ? { ...zipHit, label: zipParam } : null),
    [nearParam, here, zipHit, zipParam],
  )
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [hover, setHover] = useState<string | null>(null)

  // Whether "near me" is still the search when the browser answers.
  const nearRef = useRef(nearParam)
  const locatingRef = useRef(false)
  useEffect(() => {
    nearRef.current = nearParam
  }, [nearParam])

  const lookUp = useCallback(async (value: string) => {
    setPending((p) => [...p, value])
    setError(null)
    try {
      const res = await fetch(`/api/contractors/zip/?zip=${encodeURIComponent(value)}`)
      const json = (await res.json()) as { lat?: number; lng?: number; error?: string }
      if (!res.ok || json.lat === undefined || json.lng === undefined) throw new Error(json.error || 'We couldn’t find that ZIP code.')
      const point = { lat: json.lat, lng: json.lng }
      setZipPoints((all) => ({ ...all, [value]: point }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We couldn’t find that ZIP code.')
    } finally {
      setPending((p) => {
        const i = p.indexOf(value)
        return i < 0 ? p : [...p.slice(0, i), ...p.slice(i + 1)]
      })
    }
  }, [])

  const askForLocation = useCallback(() => {
    if (!navigator.geolocation) return setError('Your browser can’t share a location. Enter your ZIP instead.')
    locatingRef.current = true
    setLocating(true)
    setError(null)
    const done = () => {
      locatingRef.current = false
      setLocating(false)
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        done()
        if (nearRef.current) setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        done()
        if (nearRef.current) setError('We couldn’t get your location. Enter your ZIP instead.')
      },
      { timeout: 10_000, maximumAge: 600_000 },
    )
  }, [])

  // A shared link (?zip=) searches on arrival.
  useEffect(() => {
    if (/^\d{5}$/.test(zipParam)) void lookUp(zipParam)
  }, [zipParam, lookUp])

  // A page opened at ?near=me asks for the location once.
  useEffect(() => {
    if (nearParam && !locatingRef.current) askForLocation()
  }, [nearParam, askForLocation])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = zip.trim()
    if (!/^\d{5}$/.test(value)) return setError('Enter a 5-digit ZIP code.')
    nearRef.current = false
    setHere(null)
    if (value === zipParam) void lookUp(value)
    else router.replace(`${pathname}?zip=${value}`, { scroll: false })
  }

  const locate = () => {
    nearRef.current = true
    setHere(null)
    setZip('')
    if (!locatingRef.current) askForLocation()
    if (!nearParam) router.replace(`${pathname}?near=me`, { scroll: false })
  }

  const clear = () => {
    nearRef.current = false
    setHere(null)
    setZip('')
    setError(null)
    if (zipParam || nearParam) router.replace(pathname, { scroll: false })
  }

  const pool = useMemo(() => (filter === 'all' ? contractors : contractors.filter((c) => c.segment === filter)), [contractors, filter])
  const ranked = useMemo(() => (origin ? rankByDistance(pool, origin).slice(0, RESULTS) : []), [pool, origin])
  const focus = useMemo(() => ranked.map((r) => r.contractor.id), [ranked])
  const points = useMemo<MapPoint[]>(
    () =>
      pool
        .filter((c) => c.lat !== null && c.lng !== null)
        .map((c) => ({ id: c.id, slug: c.slug, name: c.name, place: placeLabel(c), segment: c.segment, lat: c.lat!, lng: c.lng! })),
    [pool],
  )
  const stateCount = useMemo(() => new Set(contractors.flatMap((c) => [c.state, ...c.serviceStates].filter(Boolean))).size, [contractors])

  return (
    <div className="pb-10">
      {/* Search */}
      <section className="mx-auto max-w-2xl px-1 pb-6 pt-4 text-center sm:pb-8 sm:pt-8">
        <p className="inline-flex animate-fade-up items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Certified installers
        </p>
        <h1 className="mt-3 animate-fade-up text-3xl font-extrabold leading-[1.08] tracking-tight text-primary [animation-delay:60ms] sm:text-[2.6rem]">
          Find a contractor near you
        </h1>
        <p className="mx-auto mt-3 max-w-lg animate-fade-up text-base text-gray-600 [animation-delay:120ms] sm:text-lg">
          {contractors.length} certified Crazy Seal installers across {stateCount} states. Enter your ZIP to see who’s closest.
        </p>

        <form
          onSubmit={submit}
          className="mx-auto mt-6 flex max-w-md animate-fade-up items-center gap-1 rounded-full bg-white p-1.5 shadow-lg ring-1 ring-primary/10 transition [animation-delay:180ms] focus-within:ring-2 focus-within:ring-secondary/40"
        >
          <MapPin aria-hidden="true" className="ml-3 h-5 w-5 shrink-0 text-gray-400" />
          <label className="min-w-0 flex-1">
            <span className="sr-only">ZIP code</span>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="Your ZIP code"
              className="h-11 w-full bg-transparent px-2 text-base font-semibold text-gray-900 outline-none placeholder:font-medium placeholder:text-gray-400"
            />
          </label>
          <button
            type="button"
            onClick={locate}
            aria-label="Use my location"
            title="Use my location"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-primary"
          >
            <LocateFixed className="h-5 w-5" />
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Search
          </button>
        </form>

        <div className="mt-3 flex animate-fade-up items-center justify-center gap-1 text-[13px] [animation-delay:240ms]" role="radiogroup" aria-label="Roof type">
          {(['all', 'rv', 'commercial'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={twMerge(
                'rounded-full px-3 py-1 font-semibold transition',
                filter === f ? 'bg-primary/[0.07] text-primary' : 'text-gray-500 hover:text-primary',
              )}
            >
              {f === 'all' ? 'All roofs' : SEGMENT_LABEL[f]}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
      </section>

      {/* The map, with the nearest contractors beside it after a search */}
      <div className={twMerge('grid gap-6', origin && 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]')}>
        {origin && (
          <div className="min-w-0">
            <Results ranked={ranked} origin={origin} hover={hover} onHover={setHover} onClear={clear} />
          </div>
        )}
        <div className="min-w-0">
          <div className={twMerge('relative overflow-hidden rounded-3xl shadow-card ring-1 ring-primary/[0.08]', origin && 'lg:sticky lg:top-24')}>
            <ContractorMap
              points={points}
              origin={origin}
              focus={focus}
              selected={hover}
              className={origin ? 'h-[360px] sm:h-[440px] lg:h-[640px]' : 'h-[62vh] min-h-[420px] max-h-[760px]'}
            />
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur">
              {(['rv', 'commercial'] as const).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: SEGMENT_PIN[s] }} />
                  {SEGMENT_LABEL[s]}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">Pins show each contractor’s area, not their address. Click one to see their page.</p>
        </div>
      </div>
    </div>
  )
}

function Results({
  ranked,
  origin,
  hover,
  onHover,
  onClear,
}: {
  ranked: Ranked<PublicContractor>[]
  origin: Origin
  hover: string | null
  onHover: (id: string | null) => void
  onClear: () => void
}) {
  const [first, ...rest] = ranked
  const far = Boolean(first && first.miles > FAR_MILES)
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight text-primary">Closest to {origin.label === 'you' ? 'you' : origin.label}</h2>
        <button type="button" onClick={onClear} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 transition hover:text-primary">
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      {!first ? (
        <p className="rounded-2xl bg-white p-6 text-gray-600 shadow-card">No contractors of this type yet.</p>
      ) : (
        <AnimatePresence mode="popLayout" initial>
          <motion.div
            key={`${origin.label}-${first.contractor.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
          >
            <Featured r={first} active={hover === first.contractor.id} onHover={onHover} />
          </motion.div>
          {rest.length > 0 && (
            <motion.div key={`${origin.label}-rest`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Also nearby</p>
              <ol className="space-y-2.5">
                {rest.map((r, i) => (
                  <motion.li
                    key={`${origin.label}-${r.contractor.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.05, duration: 0.45, ease: EASE_OUT_EXPO }}
                  >
                    <Compact r={r} active={hover === r.contractor.id} onHover={onHover} />
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {far && (
        <p className="mt-4 text-sm text-gray-600">
          Nobody is close to you yet; these are the nearest. Crazy Seal can still help:{' '}
          <Link href="/contact" className="font-bold text-primary underline-offset-2 hover:underline">
            contact our team
          </Link>
          .
        </p>
      )}
    </div>
  )
}

/** The closest contractor, in their own brand colors. */
function Featured({ r, active, onHover }: { r: Ranked<PublicContractor>; active: boolean; onHover: (id: string | null) => void }) {
  const c = r.contractor
  const meta = [placeLabel(c), c.serviceMode && SERVICE_MODE_LABEL[c.serviceMode]].filter(Boolean).join(' · ')
  const pill = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition'
  return (
    <div
      style={brandStyle(c.brand)}
      onMouseEnter={() => onHover(c.id)}
      onMouseLeave={() => onHover(null)}
      className={twMerge(
        'relative isolate overflow-hidden rounded-3xl bg-(--cb-primary) p-5 text-(--cb-on-primary) shadow-xl transition sm:p-6',
        active && 'ring-4 ring-(--cb-accent)/40',
      )}
    >
      <div aria-hidden="true" className="absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-(--cb-accent) opacity-25 blur-3xl" />
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-70">Closest to you</p>
      <div className="mt-3 flex items-center gap-4">
        <BrandMark name={c.name} logoUrl={c.brand.logoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{c.name}</h3>
          {meta && <p className="truncate text-sm opacity-75">{meta}</p>}
        </div>
        <p className="shrink-0 text-right text-3xl font-extrabold tabular-nums">
          {miles(r.miles)}
          <span className="ml-0.5 text-sm font-bold opacity-60">mi</span>
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/contractor/${c.slug}/`} className={twMerge(pill, 'bg-(--cb-accent) text-(--cb-on-accent) hover:-translate-y-0.5')}>
          View their page <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href={`/contractor/${c.slug}/#contact`} className={twMerge(pill, 'border border-current/25 hover:bg-white/10')}>
          <Send className="h-4 w-4" /> Request a quote
        </Link>
        {c.phone && (
          <a href={telHref(c.phone)} className={twMerge(pill, 'border border-current/25 hover:bg-white/10')}>
            <Phone className="h-4 w-4" /> {c.phone}
          </a>
        )}
      </div>
    </div>
  )
}

function Compact({ r, active, onHover }: { r: Ranked<PublicContractor>; active: boolean; onHover: (id: string | null) => void }) {
  const c = r.contractor
  return (
    <div
      style={brandStyle(c.brand)}
      onMouseEnter={() => onHover(c.id)}
      onMouseLeave={() => onHover(null)}
      className={twMerge(
        'group relative flex items-center gap-3.5 rounded-2xl bg-white p-3.5 shadow-card ring-1 ring-primary/[0.06] transition duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        active && 'ring-2 ring-(--cb-primary)/40',
      )}
    >
      <BrandMark name={c.name} logoUrl={c.brand.logoUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <Link href={`/contractor/${c.slug}/`} className="block truncate font-extrabold tracking-tight text-gray-900 after:absolute after:inset-0 after:content-['']">
          {c.name}
        </Link>
        <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-gray-500">
          <span className="truncate">{placeLabel(c)}</span>
          {c.phone && (
            <a href={telHref(c.phone)} className="relative z-10 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              <Phone className="h-3 w-3" /> {c.phone}
            </a>
          )}
        </p>
      </div>
      <p className="shrink-0 text-right font-extrabold tabular-nums text-gray-900">
        {miles(r.miles)}
        <span className="ml-0.5 text-xs font-bold text-gray-400">mi</span>
      </p>
    </div>
  )
}

'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import './contractor-map.css'
import { useEffect, useRef, useState } from 'react'
import type { FeatureCollection, Point } from 'geojson'
import type { GeoJSONSource, LngLatBoundsLike, Map as MapLibreMap, MapMouseEvent, Marker } from 'maplibre-gl'
import { twMerge } from 'tailwind-merge'
import type { Segment } from '@/lib/contractors/types'

/**
 * The contractor map, shared by the admin (Contractors) and the
 * public finder (/contractor). MapLibre on OpenFreeMap tiles (free, no key,
 * no cookies), like the RV Armor Atlas. Pins sit at each contractor's ZIP
 * center. Hover shows who it is; clicking a pin opens their page.
 */

export interface MapPoint {
  id: string
  slug: string
  name: string
  place: string
  segment: Segment
  lat: number
  lng: number
}

type MapLib = typeof import('maplibre-gl')

const STYLE = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
}
/** Lower 48, the default view. */
const US_BOUNDS: LngLatBoundsLike = [
  [-124.8, 24.4],
  [-66.9, 49.4],
]
export const SEGMENT_PIN: Record<Segment, string> = { rv: '#1a7bc4', commercial: '#5ba411' }
const SRC = 'contractors'
const LAYER = { cluster: 'ct-cluster', count: 'ct-count', halo: 'ct-halo', point: 'ct-point' } as const

function toGeoJSON(points: MapPoint[], focus: Set<string>, selected: string | null): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        place: p.place,
        color: SEGMENT_PIN[p.segment],
        focus: focus.has(p.id),
        selected: p.id === selected,
      },
    })),
  }
}

function addLayers(map: MapLibreMap, data: FeatureCollection<Point>, dark: boolean) {
  if (map.getSource(SRC)) return
  map.addSource(SRC, { type: 'geojson', data, cluster: true, clusterRadius: 38, clusterMaxZoom: 8 })
  map.addLayer({
    id: LAYER.cluster,
    type: 'circle',
    source: SRC,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': dark ? '#f9ea1c' : '#003365',
      'circle-radius': ['step', ['get', 'point_count'], 15, 5, 19, 15, 24],
      'circle-stroke-width': 3,
      'circle-stroke-color': dark ? 'rgba(249,234,28,0.25)' : 'rgba(0,51,101,0.18)',
    },
  })
  map.addLayer({
    id: LAYER.count,
    type: 'symbol',
    source: SRC,
    filter: ['has', 'point_count'],
    layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'], 'text-size': 12, 'text-allow-overlap': true },
    paint: { 'text-color': dark ? '#00152b' : '#ffffff' },
  })
  map.addLayer({
    id: LAYER.halo,
    type: 'circle',
    source: SRC,
    filter: ['all', ['!', ['has', 'point_count']], ['any', ['get', 'focus'], ['get', 'selected']]],
    paint: {
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.22,
      'circle-radius': ['case', ['get', 'selected'], 20, 15],
    },
  })
  map.addLayer({
    id: LAYER.point,
    type: 'circle',
    source: SRC,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': ['case', ['get', 'selected'], 10, ['get', 'focus'], 8.5, 6.5],
      'circle-stroke-width': 2.5,
      'circle-stroke-color': dark ? '#0b1220' : '#ffffff',
    },
  })
}

function hoverCard(name: string, place: string): HTMLElement {
  const card = document.createElement('div')
  card.className = 'ct-tip'
  const title = document.createElement('strong')
  title.textContent = name
  const sub = document.createElement('span')
  sub.textContent = place
  const cta = document.createElement('em')
  cta.textContent = 'Open their page →'
  card.append(title, sub, cta)
  return card
}

function originMarker(lib: MapLib, at: { lat: number; lng: number }): Marker {
  const el = document.createElement('div')
  el.className = 'ct-origin'
  el.setAttribute('aria-label', 'Your search')
  return new lib.Marker({ element: el }).setLngLat([at.lng, at.lat])
}

export function ContractorMap({
  points,
  origin = null,
  focus = [],
  selected = null,
  newTab = false,
  theme = 'light',
  className,
}: {
  points: MapPoint[]
  /** The visitor's search point, drawn as a pulsing dot. */
  origin?: { lat: number; lng: number } | null
  /** Contractors to frame with the origin (the nearest results). */
  focus?: string[]
  /** One contractor to emphasize, e.g. the row under the pointer. */
  selected?: string | null
  /** Open contractor pages in a new tab (the admin). */
  newTab?: boolean
  /** "admin" follows the admin's light or dark theme. */
  theme?: 'light' | 'admin'
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const libRef = useRef<MapLib | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const latest = useRef({ points, focus, selected, newTab })
  latest.current = { points, focus, selected, newTab }
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create the map once.
  useEffect(() => {
    let disposed = false
    let map: MapLibreMap | null = null
    let resize: ResizeObserver | null = null
    let themeWatch: MutationObserver | null = null
    ;(async () => {
      const lib = await import('maplibre-gl')
      const container = containerRef.current
      if (disposed || !container) return
      libRef.current = lib
      const adminRoot = theme === 'admin' ? container.closest('.cs-admin') : null
      const isDark = () => adminRoot?.getAttribute('data-theme') !== 'light' && Boolean(adminRoot)
      let dark = isDark()
      map = new lib.Map({
        container,
        style: dark ? STYLE.dark : STYLE.light,
        bounds: US_BOUNDS,
        fitBoundsOptions: { padding: 24 },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: false,
        cooperativeGestures: theme === 'light',
        minZoom: 2,
        maxZoom: 14,
        renderWorldCopies: false,
      })
      map.touchZoomRotate.disableRotation()
      map.keyboard.disableRotation()
      map.addControl(new lib.NavigationControl({ showCompass: false }), 'top-right')
      map.addControl(new lib.AttributionControl({ compact: true }), 'bottom-right')
      const m = map
      const data = () => toGeoJSON(latest.current.points, new Set(latest.current.focus), latest.current.selected)
      // Layers go on when the style is parsed, not at 'load', so pins show while tiles stream in.
      m.on('style.load', () => {
        addLayers(m, data(), dark)
        setReady(true)
      })
      m.on('error', (e) => {
        if (!m.loaded() && e.error?.message) setError(e.error.message)
      })
      // The dark base style names a few POI icons it doesn't ship; draw nothing for them.
      m.on('styleimagemissing', (e) => {
        if (!m.hasImage(e.id)) m.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) })
      })

      const popup = new lib.Popup({ closeButton: false, closeOnClick: false, offset: 12, maxWidth: '260px', className: 'ct-popup' })
      let frame = 0
      m.on('mousemove', (e: MapMouseEvent) => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          if (!m.getLayer(LAYER.point)) return
          const hit = m.queryRenderedFeatures(e.point, { layers: [LAYER.point, LAYER.cluster] })[0]
          m.getCanvas().style.cursor = hit ? 'pointer' : ''
          if (hit && hit.layer.id === LAYER.point) {
            popup
              .setLngLat((hit.geometry as Point).coordinates as [number, number])
              .setDOMContent(hoverCard(String(hit.properties.name), String(hit.properties.place)))
              .addTo(m)
          } else popup.remove()
        })
      })
      m.on('mouseout', () => popup.remove())
      m.on('movestart', () => popup.remove())
      m.on('click', (e: MapMouseEvent) => {
        if (!m.getLayer(LAYER.point)) return
        const hit = m.queryRenderedFeatures(e.point, { layers: [LAYER.point, LAYER.cluster] })[0]
        if (!hit) return
        if (hit.layer.id === LAYER.cluster) {
          ;(m.getSource(SRC) as GeoJSONSource).getClusterExpansionZoom(hit.properties.cluster_id).then((zoom) => {
            m.easeTo({ center: (hit.geometry as Point).coordinates as [number, number], zoom: Math.min(zoom + 0.5, 12), duration: 700 })
          })
          return
        }
        const href = `/contractor/${hit.properties.slug}/`
        if (latest.current.newTab) window.open(href, '_blank', 'noopener')
        else window.location.assign(href)
      })

      resize = new ResizeObserver(() => m.resize())
      resize.observe(container)
      if (adminRoot) {
        themeWatch = new MutationObserver(() => {
          if (isDark() === dark) return
          dark = isDark()
          setReady(false)
          m.setStyle(dark ? STYLE.dark : STYLE.light)
        })
        themeWatch.observe(adminRoot, { attributes: true, attributeFilter: ['data-theme'] })
      }
      mapRef.current = m
    })().catch((err) => setError(err instanceof Error ? err.message : String(err)))
    return () => {
      disposed = true
      resize?.disconnect()
      themeWatch?.disconnect()
      markerRef.current?.remove()
      map?.remove()
      mapRef.current = null
    }
  }, [theme])

  // Keep the pins in step with the data.
  useEffect(() => {
    const source = mapRef.current?.getSource(SRC) as GeoJSONSource | undefined
    source?.setData(toGeoJSON(points, new Set(focus), selected))
  }, [ready, points, focus, selected])

  // Frame the search: the origin plus the nearest contractors. Clearing the
  // search goes back to the whole country.
  const searchFramed = useRef(false)
  useEffect(() => {
    const map = mapRef.current
    const lib = libRef.current
    if (!ready || !map || !lib) return
    // The page's layout changes with the search, so measure the map before framing it.
    map.resize()
    markerRef.current?.remove()
    markerRef.current = null
    if (!origin) {
      if (searchFramed.current) map.fitBounds(US_BOUNDS, { padding: 24, duration: 900 })
      searchFramed.current = false
      return
    }
    markerRef.current = originMarker(lib, origin).addTo(map)
    const framed = points.filter((p) => focus.includes(p.id))
    const bounds = new lib.LngLatBounds([origin.lng, origin.lat], [origin.lng, origin.lat])
    for (const p of framed) bounds.extend([p.lng, p.lat])
    map.fitBounds(bounds, { padding: 64, maxZoom: 9, duration: 900 })
    searchFramed.current = true
  }, [ready, origin, focus, points])

  return (
    <div className={twMerge('relative overflow-hidden', className)}>
      {/* Sized with h-full: MapLibre's stylesheet makes the map element position: relative. */}
      <div ref={containerRef} className="h-full w-full" />
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-slate-100 p-6 text-center text-sm text-slate-600">
          The map couldn’t load. The base map comes from tiles.openfreemap.org; check the connection and reload.
        </div>
      )}
    </div>
  )
}

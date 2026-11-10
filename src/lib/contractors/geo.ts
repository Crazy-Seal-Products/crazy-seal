import type { PublicContractor } from './types'

/** Miles between two points (haversine). */
export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 3958.8 * 2 * Math.asin(Math.sqrt(h))
}

export interface Ranked<T> {
  contractor: T
  miles: number
}

/** Contractors with a pin, nearest to `origin` first. */
export function rankByDistance<T extends PublicContractor>(contractors: T[], origin: { lat: number; lng: number }): Ranked<T>[] {
  return contractors
    .filter((c) => c.lat !== null && c.lng !== null)
    .map((c) => ({ contractor: c, miles: milesBetween(origin, { lat: c.lat!, lng: c.lng! }) }))
    .sort((a, b) => a.miles - b.miles)
}

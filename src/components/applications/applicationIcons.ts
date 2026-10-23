import { createElement } from 'react'
import {
  Armchair,
  Building2,
  Bus,
  Caravan,
  Container,
  Factory,
  Hammer,
  House,
  Package,
  Sailboat,
  Sun,
  Tent,
  Tractor,
  Truck,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import type { ApplicationFamily } from '@/lib/applications/config'

/** Decorative icon per niche application slug (cards, chips, directory). */
export const APPLICATION_ICONS: Record<string, LucideIcon> = {
  'pop-up-campers': Tent,
  'truck-campers': Caravan,
  barns: Tractor,
  'boat-houses': Sailboat,
  'outdoor-rooms': Armchair,
  'porch-roofs': House,
  sheds: Hammer,
  sunrooms: Sun,
  'tiny-homes': House,
  industrial: Factory,
  'metal-buildings': Warehouse,
  'self-storage': Package,
  'box-trucks': Truck,
  'shipping-containers': Container,
  'tractor-trailers': Truck,
}

/** Decorative icon per application family (hub cards). */
export const FAMILY_ICONS: Record<ApplicationFamily, LucideIcon> = {
  rv: Caravan,
  residential: House,
  commercial: Building2,
  transportation: Bus,
}

/** Renders the icon for an application slug (falls back to a house). */
export function ApplicationIcon({ slug, className }: { slug: string; className?: string }) {
  return createElement(APPLICATION_ICONS[slug] ?? House, { className, 'aria-hidden': true })
}

/** Renders the icon for an application family. */
export function FamilyIcon({ family, className }: { family: ApplicationFamily; className?: string }) {
  return createElement(FAMILY_ICONS[family], { className, 'aria-hidden': true })
}

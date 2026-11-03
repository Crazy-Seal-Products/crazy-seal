import { FileCheck, Megaphone, Package, PlayCircle, Presentation, Wrench, type LucideIcon } from 'lucide-react'
import type { ModuleIcon } from '@/lib/portal/modules'

/** The module icons dealers see in the Pro Portal, with names for the picker. */
export const MODULE_ICON_META: Record<ModuleIcon, { icon: LucideIcon; label: string }> = {
  PlayCircle: { icon: PlayCircle, label: 'Play' },
  Megaphone: { icon: Megaphone, label: 'Megaphone' },
  Presentation: { icon: Presentation, label: 'Presentation' },
  Package: { icon: Package, label: 'Package' },
  Wrench: { icon: Wrench, label: 'Wrench' },
  FileCheck: { icon: FileCheck, label: 'Document' },
}

/** Opens the demo dealer's portal at a module (or the program page). */
export function previewHref(slug?: string) {
  return `/portal/demo/summit/?next=/portal/modules/${slug ? `${slug}/` : ''}`
}

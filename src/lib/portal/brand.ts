/**
 * A partner's white-label brand, for the brand previews on the public
 * Professionals page (src/components/portal/BrandPreview.tsx and the
 * showcase). Plain module.
 */

export interface PartnerBrand {
  companyName: string
  tagline: string
  phone: string
  website: string
  primary: string
  accent: string
  logoDataUrl?: string
  template: 'bold' | 'clean' | 'split'
  coBrand: boolean
}

/** "SR" for "Summit Roofing". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

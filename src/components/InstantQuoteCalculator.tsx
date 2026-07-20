'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Calculator, Phone, ShoppingCart } from 'lucide-react'
import { LinkButton, Select, Input } from '@/lib/design-system'

type ApplicationType = 'commercial' | 'residential' | 'rv' | 'transportation'
type InstallMethod = 'over-existing' | 'direct-to-deck'
type Layers = 'double' | 'single'

interface KitTier {
  range: string
  maxSqft: number
  price: number
  url: string
}

const SHOP = '/store'

const SINGLE_LAYER: KitTier[] = [
  { range: '0-100 SQ FT', maxSqft: 100, price: 520, url: `${SHOP}/single-layer-kit?variant=15320363401265` },
  { range: '100-200 SQ FT', maxSqft: 200, price: 745, url: `${SHOP}/single-layer-kit?variant=15688892776497` },
  { range: '200-300 SQ FT', maxSqft: 300, price: 970, url: `${SHOP}/single-layer-kit?variant=15320363466801` },
  { range: '300-400 SQ FT', maxSqft: 400, price: 1220, url: `${SHOP}/single-layer-kit?variant=31407911305286` },
  { range: '400-500 SQ FT', maxSqft: 500, price: 1445, url: `${SHOP}/single-layer-kit?variant=15320363532337` },
]

const DOUBLE_LAYER: KitTier[] = [
  { range: '0-100 SQ FT', maxSqft: 100, price: 745, url: `${SHOP}/double-layer-kit?variant=15320853250097` },
  { range: '100-200 SQ FT', maxSqft: 200, price: 1195, url: `${SHOP}/double-layer-kit?variant=15688903295025` },
  { range: '200-300 SQ FT', maxSqft: 300, price: 1645, url: `${SHOP}/double-layer-kit?variant=15320853315633` },
  { range: '300-400 SQ FT', maxSqft: 400, price: 2120, url: `${SHOP}/double-layer-kit?variant=31407930114118` },
  { range: '400-500 SQ FT', maxSqft: 500, price: 2570, url: `${SHOP}/double-layer-kit?variant=15320853381169` },
]

const DIRECT_TO_DECK: KitTier[] = [
  { range: '0-75 SQ FT', maxSqft: 75, price: 876, url: `${SHOP}/direct-to-deck-kit?variant=15320860721201` },
  { range: '75-150 SQ FT', maxSqft: 150, price: 1552, url: `${SHOP}/direct-to-deck-kit?variant=15688912764977` },
  { range: '150-225 SQ FT', maxSqft: 225, price: 2115, url: `${SHOP}/direct-to-deck-kit?variant=15320860786737` },
  { range: '225-300 SQ FT', maxSqft: 300, price: 2991, url: `${SHOP}/direct-to-deck-kit?variant=15320860852273` },
  { range: '300-375 SQ FT', maxSqft: 375, price: 3642, url: `${SHOP}/direct-to-deck-kit?variant=15320860917809` },
]

// RV length buckets map straight to kit tiers (matches the WP tool)
const RV_OVER_EXISTING = [
  { value: '0-12', label: '0 FT - 12 FT', tierIndex: 0 },
  { value: '13-25', label: '13 FT - 25 FT', tierIndex: 1 },
  { value: '26-37', label: '26 FT - 37 FT', tierIndex: 2 },
  { value: '38-45', label: '38 FT - 45 FT', tierIndex: 3 },
]

const RV_DIRECT_TO_DECK = [
  { value: '0-9', label: '0 FT - 9 FT', tierIndex: 0 },
  { value: '10-19', label: '10 FT - 19 FT', tierIndex: 1 },
  { value: '20-29', label: '20 FT - 29 FT', tierIndex: 2 },
  { value: '29-38', label: '29 FT - 38 FT', tierIndex: 3 },
  { value: '39-45', label: '39 FT - 45 FT', tierIndex: 4 },
]

// Custom kit material formulas + unit prices from the WP calculator
const PRICE_PER_GALLON_SEAL = 225
const PRICE_PER_GALLON_PATCH = 225
const PRICE_PER_TUBE_CAULK = 25
const PRICE_PER_GALLON_CLEAN = 45

function usd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function InstantQuoteCalculator() {
  const [applicationType, setApplicationType] = useState<ApplicationType | ''>('')
  const [installMethod, setInstallMethod] = useState<InstallMethod | ''>('')
  const [rvLength, setRvLength] = useState('')
  const [sqft, setSqft] = useState('')
  const [seams, setSeams] = useState('')
  const [layers, setLayers] = useState<Layers>('double')

  const isRv = applicationType === 'rv' || applicationType === 'transportation'
  const isDeck = installMethod === 'direct-to-deck'
  const sqftNum = parseInt(sqft, 10) || 0
  const seamsNum = parseInt(seams, 10) || 0

  const kit = useMemo((): KitTier | null => {
    if (!applicationType || !installMethod) return null
    const table = isDeck ? DIRECT_TO_DECK : layers === 'single' ? SINGLE_LAYER : DOUBLE_LAYER
    if (isRv) {
      const buckets = isDeck ? RV_DIRECT_TO_DECK : RV_OVER_EXISTING
      const bucket = buckets.find(b => b.value === rvLength)
      return bucket ? table[bucket.tierIndex] ?? null : null
    }
    if (!sqftNum) return null
    return table.find(t => sqftNum <= t.maxSqft) ?? null
  }, [applicationType, installMethod, isDeck, isRv, layers, rvLength, sqftNum])

  const custom = useMemo(() => {
    if (!sqftNum) return null
    const sealGallons = Math.ceil((sqftNum / 100) * (layers === 'double' ? 2 : 1))
    const patchGallons = Math.ceil(seamsNum / 70)
    const caulkTubes = Math.ceil(sqftNum / 400)
    const cleanGallons = Math.ceil(sqftNum / 1000)
    const price =
      sealGallons * PRICE_PER_GALLON_SEAL +
      patchGallons * PRICE_PER_GALLON_PATCH +
      caulkTubes * PRICE_PER_TUBE_CAULK +
      cleanGallons * PRICE_PER_GALLON_CLEAN
    return { sealGallons, patchGallons, caulkTubes, cleanGallons, price }
  }, [layers, seamsNum, sqftNum])

  const needsCustomKit = !isRv && sqftNum > (isDeck ? 375 : 500)

  return (
    <div className="rounded-2xl bg-white border border-gray-200/80 shadow-sm p-5 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary">Instant Quote Tool</h2>
          <p className="text-sm text-gray-500">A price and kit recommendation in 10 seconds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Select
          label="What best describes your application type?"
          placeholder="Please Select"
          value={applicationType}
          onChange={(e) => {
            setApplicationType(e.target.value as ApplicationType)
            setRvLength('')
          }}
          options={[
            { value: 'rv', label: 'RV' },
            { value: 'commercial', label: 'Commercial Flat Roof' },
            { value: 'residential', label: 'Residential Flat Roof' },
            { value: 'transportation', label: 'Transportation' },
          ]}
        />

        <Select
          label="How will the kit be applied?"
          placeholder="Please Select"
          value={installMethod}
          onChange={(e) => {
            setInstallMethod(e.target.value as InstallMethod)
            setRvLength('')
          }}
          options={[
            { value: 'over-existing', label: 'Over existing substrate' },
            { value: 'direct-to-deck', label: 'Direct to wood decking' },
          ]}
        />

        {isRv && installMethod && (
          <Select
            label={applicationType === 'rv' ? 'How long is your RV?' : 'How long is your vehicle roof?'}
            placeholder="Please Select"
            value={rvLength}
            onChange={(e) => setRvLength(e.target.value)}
            options={(isDeck ? RV_DIRECT_TO_DECK : RV_OVER_EXISTING).map(b => ({
              value: b.value,
              label: b.label,
            }))}
          />
        )}

        {!isRv && applicationType && (
          <Input
            label="Project square footage"
            type="number"
            min={0}
            placeholder="e.g. 250"
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
          />
        )}

        {!isDeck && applicationType && installMethod && (
          <Select
            label="Choose number of layers"
            value={layers}
            onChange={(e) => setLayers(e.target.value as Layers)}
            options={[
              { value: 'double', label: 'Double Layer Kit (Recommended)' },
              { value: 'single', label: 'Single Layer Kit' },
            ]}
          />
        )}

        {!isRv && applicationType && (
          <Input
            label="Approximate linear footage of seams (optional)"
            type="number"
            min={0}
            placeholder="e.g. 5 seams x 50 FT = 250"
            value={seams}
            onChange={(e) => setSeams(e.target.value)}
          />
        )}
      </div>

      {/* Result */}
      {kit && !needsCustomKit && (
        <div className="mt-6 rounded-xl bg-primary text-white p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-highlight mb-2">
            Kit Recommendation & Pricing
          </p>
          <p className="text-2xl sm:text-3xl font-bold mb-1">
            {kit.range} {isDeck ? 'Direct to Deck' : layers === 'single' ? 'Single Layer' : 'Double Layer'} Kit
          </p>
          <p className="text-xl text-white/80 mb-4">{usd(kit.price)}</p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href={kit.url} variant="accent" size="md" external>
              <ShoppingCart className="w-4 h-4" />
              Shop This Kit Now
            </LinkButton>
            <LinkButton href="/contact" variant="outline-white" size="md">
              Work With a Specialist
            </LinkButton>
          </div>
        </div>
      )}

      {needsCustomKit && custom && (
        <div className="mt-6 rounded-xl bg-primary text-white p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-highlight mb-2">
            Custom Kit Estimate
          </p>
          <p className="text-2xl sm:text-3xl font-bold mb-3">{usd(custom.price)}</p>
          <ul className="text-white/80 text-sm space-y-1 mb-4">
            <li>{custom.sealGallons} gallons of Crazy Seal ({layers === 'double' ? 'double' : 'single'} layer)</li>
            {custom.patchGallons > 0 && <li>{custom.patchGallons} gallons of Crazy Patch (seams)</li>}
            <li>{custom.caulkTubes} tubes of Crazy Caulk</li>
            <li>{custom.cleanGallons} gallons of Crazy Clean</li>
          </ul>
          <p className="text-white/60 text-sm mb-4">
            Projects this size are built as custom kits. Use these material
            guidelines on the Build Your Own Kit page, or talk to a specialist
            about volume pricing.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/store#products" variant="accent" size="md">
              Build Your Custom Kit
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <Phone className="w-4 h-4" />
              (800) 963-0131
            </a>
          </div>
        </div>
      )}

      {!kit && !needsCustomKit && (
        <p className="mt-6 text-sm text-gray-400 text-center">
          Answer the questions above to see your kit recommendation and price.
        </p>
      )}
    </div>
  )
}

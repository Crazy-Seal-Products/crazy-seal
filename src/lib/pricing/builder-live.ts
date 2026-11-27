import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { storeOrQuoteHref } from '@/lib/store-mode'

/**
 * Whether the public quote builder is live (pricing_settings.public_builder_live,
 * Admin > Pricing). Read by the root layout on every page, so it's cached:
 * savePricingSettings revalidates BUILDER_LIVE_TAG when the switch changes,
 * and the short revalidate catches edits made straight in the database.
 * Server only.
 */

export const BUILDER_LIVE_TAG = 'public-builder-live'

const readBuilderLive = unstable_cache(
  async (): Promise<boolean> => {
    const { data, error } = await createAdminClient()
      .from('pricing_settings')
      .select('public_builder_live')
      .eq('id', true)
      .maybeSingle<{ public_builder_live: boolean | null }>()
    // Throw rather than return false, so a failed read isn't cached.
    if (error) throw new Error(error.message)
    return data?.public_builder_live === true
  },
  ['public-builder-live-v1'],
  { revalidate: 300, tags: [BUILDER_LIVE_TAG] },
)

/** True once the public builder is live. Fails closed: any error reads as off (the store stays). */
export async function isPublicBuilderLive(): Promise<boolean> {
  try {
    return await readBuilderLive()
  } catch (err) {
    console.error('[builder-live] read failed; keeping the store', err)
    return false
  }
}

/** For server components: a mapper that sends store links to /quote/ while the builder is live. */
export async function getStoreHref(): Promise<(href: string) => string> {
  const live = await isPublicBuilderLive()
  return (href) => storeOrQuoteHref(href, live)
}

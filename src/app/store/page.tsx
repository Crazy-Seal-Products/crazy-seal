import { redirect } from 'next/navigation'
import { isPublicBuilderLive } from '@/lib/pricing/builder-live'
import { QUOTE_HREF } from '@/lib/store-mode'

/** Catalog index unified into /kit-builder (main shop), or the quote builder once it's live. */
export default async function StorePage() {
  redirect((await isPublicBuilderLive()) ? QUOTE_HREF : '/kit-builder')
}

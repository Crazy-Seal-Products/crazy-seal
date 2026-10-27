'use server'

import { revalidatePath } from 'next/cache'
import { requirePortalAdmin } from './auth'
import { refreshFromShopify, type RefreshResult } from './refresh'

export async function syncShopifyNow(): Promise<RefreshResult> {
  await requirePortalAdmin()
  const result = await refreshFromShopify()
  revalidatePath('/portal/admin', 'layout')
  return result
}

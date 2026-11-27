'use client'

import React, { createContext, useCallback, useContext } from 'react'
import Link from 'next/link'
import { LinkButton } from '@/lib/design-system'
import { storeOrQuoteHref } from '@/lib/store-mode'

/**
 * The public-builder switch for client components. The root layout reads it
 * on the server (isPublicBuilderLive) and GlobalLayout provides it here, so
 * the first paint already shows the right links.
 */

const BuilderLiveContext = createContext(false)

export function StoreModeProvider({ builderLive, children }: { builderLive: boolean; children: React.ReactNode }) {
  return <BuilderLiveContext.Provider value={builderLive}>{children}</BuilderLiveContext.Provider>
}

/** True once the public quote builder is live (the store is switched off). */
export function useBuilderLive(): boolean {
  return useContext(BuilderLiveContext)
}

/** A mapper that sends store links to /quote/ while the builder is live. */
export function useStoreHref(): (href: string) => string {
  const live = useBuilderLive()
  return useCallback((href: string) => storeOrQuoteHref(href, live), [live])
}

/** LinkButton whose store links go to the quote builder once it's live. Usable from server components. */
export function StoreLinkButton(props: React.ComponentProps<typeof LinkButton>) {
  const shop = useStoreHref()
  return <LinkButton {...props} href={shop(props.href)} />
}

/** next/link whose store links go to the quote builder once it's live. Usable from server components. */
export function StoreLink({ href, ...rest }: Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const shop = useStoreHref()
  return <Link {...rest} href={shop(href)} />
}

/** A plain <a> whose store links go to the quote builder once it's live. Usable from server components. */
export function StoreAnchor({ href, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const shop = useStoreHref()
  return <a {...rest} href={shop(href)} />
}

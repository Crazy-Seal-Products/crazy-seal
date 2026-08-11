import { redirect } from 'next/navigation'

/** Catalog index unified into /kit-builder (main shop). */
export default function StorePage() {
  redirect('/kit-builder')
}

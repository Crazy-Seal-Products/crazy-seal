import { redirect } from 'next/navigation'

/** Matches "Crazy Seal dealer" search intent — the dealer story lives at /professionals. */
export default function DealersPage() {
  redirect('/professionals')
}

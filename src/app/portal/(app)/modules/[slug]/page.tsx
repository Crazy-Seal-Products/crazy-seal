import { permanentRedirect } from 'next/navigation'

/** Old demo portal address; training modules moved to /portal/training/<slug>/ */
export default async function OldModuleAddress({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  permanentRedirect(`/portal/training/${encodeURIComponent(slug)}/`)
}

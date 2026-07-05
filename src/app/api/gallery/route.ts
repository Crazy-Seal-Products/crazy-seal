import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const limit = parseInt(searchParams.get('limit') || '0') || undefined
  const type = searchParams.get('type') as 'Standard' | 'Direct To Deck' | null
  const featured = searchParams.get('featured')

  let query = supabase
    .from('gallery_photos')
    .select('id, filename, original_name, cdn_url, width, height, installation_type, featured, display_order')
    .order('display_order', { ascending: true })

  if (type) query = query.eq('installation_type', type)
  if (featured === 'true') query = query.eq('featured', true)
  if (limit) query = query.limit(limit)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const allowed = ['installation_type', 'featured', 'display_order']
  const filtered: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key]
  }

  const { data, error } = await supabase
    .from('gallery_photos')
    .update(filtered)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { order } = body as { order: { id: string; display_order: number }[] }

  if (!order || !Array.isArray(order)) {
    return NextResponse.json({ error: 'order array is required' }, { status: 400 })
  }

  const errors: string[] = []
  for (const item of order) {
    const { error } = await supabase
      .from('gallery_photos')
      .update({ display_order: item.display_order })
      .eq('id', item.id)
    if (error) errors.push(error.message)
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

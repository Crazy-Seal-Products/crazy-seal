import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const technician_id = searchParams.get('technician_id')

    const supabase = createAdminClient()

    const { data: courses, error: coursesError } = await supabase
      .from('lms_courses')
      .select(`
        id, title, slug, description, thumbnail_url, sort_order,
        lms_modules (
          id, title, description, sort_order,
          lms_lessons (
            id, title, description, content_type, duration_minutes, sort_order, is_active
          )
        )
      `)
      .eq('is_active', true)
      .order('sort_order')

    if (coursesError) {
      return NextResponse.json({ error: coursesError.message }, { status: 500 })
    }

    let progress: Record<string, string> = {}

    if (technician_id) {
      const { data: progressData } = await supabase
        .from('technician_lesson_progress')
        .select('lesson_id, status')
        .eq('technician_id', technician_id)

      if (progressData) {
        progress = Object.fromEntries(
          progressData.map((p) => [p.lesson_id, p.status])
        )
      }
    }

    const sorted = courses?.map((course) => ({
      ...course,
      lms_modules: (course.lms_modules as Array<Record<string, unknown>>)
        ?.sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a.sort_order as number) - (b.sort_order as number))
        .map((mod) => ({
          ...mod,
          lms_lessons: (mod.lms_lessons as Array<Record<string, unknown>>)
            ?.filter((l: Record<string, unknown>) => l.is_active)
            .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a.sort_order as number) - (b.sort_order as number)),
        })),
    }))

    return NextResponse.json({ courses: sorted, progress })
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Lesson {
  id: string
  title: string
  duration_minutes: number | null
}

interface Module {
  id: string
  title: string
  lms_lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  lms_modules: Module[]
}

export default function CoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const verifyRes = await fetch('/api/lms/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth_user_id: user.id }),
    })
    const { technician } = await verifyRes.json()
    if (!technician) return

    const coursesRes = await fetch(`/api/lms/courses?technician_id=${technician.id}`)
    const { courses: data, progress: prog } = await coursesRes.json()

    setCourses(data || [])
    setProgress(prog || {})
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-sm text-gray-500 mt-1">All available installation training courses.</p>
      </div>

      <div className="space-y-4">
        {courses.map((course) => {
          const allLessons = course.lms_modules.flatMap((m) => m.lms_lessons)
          const total = allLessons.length
          const completed = allLessons.filter((l) => progress[l.id] === 'completed').length
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0
          const totalMinutes = allLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)

          return (
            <Link
              key={course.id}
              href={`/lms/courses/${course.slug}`}
              className="group flex items-center gap-5 bg-white rounded-xl border border-gray-200 hover:border-[#003365]/30 hover:shadow-sm p-5 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#003365] to-[#125F97] flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#003365] transition-colors">{course.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{course.description}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {total} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#5BA411]" /> {completed} done
                  </span>
                  {totalMinutes > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {totalMinutes} min
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-lg font-bold text-[#003365]">{pct}%</span>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#5BA411] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#003365] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          )
        })}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No courses available</h3>
          <p className="text-xs text-gray-500">Courses will appear here once they are published.</p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { BookOpen, CheckCircle, Clock, PlayCircle, ArrowRight } from 'lucide-react'
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
  thumbnail_url: string | null
  lms_modules: Module[]
}

export default function LmsDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [technicianName, setTechnicianName] = useState('')

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

    setTechnicianName(technician.full_name)

    const coursesRes = await fetch(`/api/lms/courses?technician_id=${technician.id}`)
    const { courses: coursesData, progress: progressData } = await coursesRes.json()

    setCourses(coursesData || [])
    setProgress(progressData || {})
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const getCourseStats = (course: Course) => {
    const allLessons = course.lms_modules.flatMap((m) => m.lms_lessons)
    const total = allLessons.length
    const completed = allLessons.filter((l) => progress[l.id] === 'completed').length
    const inProgress = allLessons.filter((l) => progress[l.id] === 'in_progress').length
    const totalMinutes = allLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, inProgress, totalMinutes, pct }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalLessons = courses.reduce((sum, c) => sum + c.lms_modules.flatMap((m) => m.lms_lessons).length, 0)
  const completedLessons = courses.reduce((sum, c) => sum + c.lms_modules.flatMap((m) => m.lms_lessons).filter((l) => progress[l.id] === 'completed').length, 0)
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {technicianName ? `Welcome back, ${technicianName.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track your training progress across all installation courses.</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Overall Progress</h2>
            <p className="text-xs text-gray-500 mt-0.5">{completedLessons} of {totalLessons} lessons completed</p>
          </div>
          <span className="text-2xl font-bold text-[#003365]">{overallPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5BA411] rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => {
          const stats = getCourseStats(course)
          const courseIcon = course.slug === 'direct-to-deck'
            ? '01'
            : course.slug === 'over-membrane'
              ? '02'
              : '03'

          return (
            <Link
              key={course.id}
              href={`/lms/courses/${course.slug}`}
              className="group bg-white rounded-2xl border border-gray-200 hover:border-[#003365]/30 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Course Header */}
              <div className="bg-gradient-to-br from-[#003365] to-[#125F97] p-5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{courseIcon}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-white font-semibold mt-3 text-sm leading-snug">{course.title}</h3>
              </div>

              {/* Course Body */}
              <div className="p-5">
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{course.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {stats.total} lessons
                  </span>
                  {stats.totalMinutes > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {stats.totalMinutes} min
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-700">{stats.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5BA411] rounded-full transition-all duration-500"
                      style={{ width: `${stats.pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[#5BA411]" />
                      {stats.completed} done
                    </span>
                    {stats.inProgress > 0 && (
                      <span className="flex items-center gap-1">
                        <PlayCircle className="w-3 h-3 text-[#125F97]" />
                        {stats.inProgress} in progress
                      </span>
                    )}
                  </div>
                </div>
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

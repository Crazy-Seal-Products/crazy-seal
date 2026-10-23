'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PROJECT_CATEGORIES, type Project } from '@/lib/projects'
import { ProjectCard } from '@/components/RealProjectsSection'

type ProjectCardRow = Pick<
  Project,
  'slug' | 'project_number' | 'title' | 'category' | 'location' | 'cover_photo' | 'customer_type'
>

export function ProjectsGallery({
  projects,
  initialCategory,
}: {
  projects: ProjectCardRow[]
  initialCategory?: string
}) {
  const [category, setCategory] = useState<string | null>(
    initialCategory && PROJECT_CATEGORIES.some((c) => c.slug === initialCategory)
      ? initialCategory
      : null
  )
  // Only animate the grid after the visitor changes the filter; the first
  // paint is handled by the site-wide scroll reveal.
  const [filterChanges, setFilterChanges] = useState(0)

  const choose = (next: string | null) => {
    if (next === category) return
    setCategory(next)
    setFilterChanges((n) => n + 1)
  }

  const filtered = category ? projects.filter((p) => p.category === category) : projects
  const counts = new Map<string, number>()
  for (const p of projects) {
    if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1)
  }

  return (
    <>
      {/* Category filter */}
      <div className="mb-8 flex justify-center">
        <div className="flex flex-wrap justify-center gap-1 rounded-3xl sm:rounded-full bg-slate-100/80 p-1.5 ring-1 ring-primary/[0.06]">
          <FilterPill
            label="All Projects"
            count={projects.length}
            active={category === null}
            onClick={() => choose(null)}
          />
          {PROJECT_CATEGORIES.filter((c) => counts.get(c.slug)).map((c) => (
            <FilterPill
              key={c.slug}
              label={c.label}
              count={counts.get(c.slug) ?? 0}
              active={category === c.slug}
              onClick={() => choose(c.slug)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        key={`${category ?? 'all'}-${filterChanges}`}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        {filtered.map((p, i) => (
          <div
            key={p.slug}
            className={filterChanges > 0 ? 'animate-fade-up' : undefined}
            style={filterChanges > 0 ? { animationDelay: `${Math.min(i, 8) * 55}ms` } : undefined}
          >
            <ProjectCard project={p} className="h-full" />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-16">
          No projects in this category yet. Check back soon!
        </p>
      )}
    </>
  )
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
        active ? 'text-white' : 'text-gray-600 hover:text-primary'
      }`}
    >
      {active && (
        <motion.span
          layoutId="projects-filter-pill"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="absolute inset-0 rounded-full bg-gradient-to-b from-primary-light to-primary shadow-glow-primary"
        />
      )}
      <span className="relative">
        {label}{' '}
        <span className={active ? 'text-white/70' : 'text-gray-400'}>({count})</span>
      </span>
    </button>
  )
}

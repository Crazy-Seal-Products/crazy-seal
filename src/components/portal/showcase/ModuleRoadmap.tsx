'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Clock, Layers } from 'lucide-react'
import { PORTAL_MODULES, moduleMinutes } from '@/lib/portal/modules'
import { EASE_OUT_EXPO } from '@/components/motion'
import { MODULE_ICONS } from '../ui'

/** Six program modules on a path that draws itself as you scroll. */
export function ModuleRoadmap() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] })
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div ref={ref} className="relative">
      {/* Rail: vertical beside the cards on phones, horizontal through the number nodes from lg up */}
      <div aria-hidden="true" className="absolute bottom-0 left-5 top-0 w-1 -translate-x-1/2 rounded-full bg-primary/10 lg:hidden">
        <motion.div className="w-full rounded-full bg-gradient-to-b from-accent to-highlight" style={{ height: reduce ? '100%' : fill }} />
      </div>
      <div aria-hidden="true" className="absolute left-[8%] right-[8%] top-5 hidden h-1 -translate-y-1/2 rounded-full bg-primary/10 lg:block">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-highlight" style={{ width: reduce ? '100%' : fill }} />
      </div>

      <ol className="relative grid gap-5 pl-12 lg:grid-cols-6 lg:gap-4 lg:pl-0">
        {PORTAL_MODULES.map((m, i) => {
          const Icon = MODULE_ICONS[m.icon]
          return (
            <motion.li
              key={m.slug}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: EASE_OUT_EXPO }}
              className="relative flex flex-col"
            >
              {/* Number node on the rail */}
              <span className="absolute -left-12 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-black text-primary shadow-lg ring-4 ring-accent/30 lg:static lg:mx-auto lg:mb-4">
                {m.number}
              </span>
              <div className="group flex flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl">
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.thumbnail}
                    alt={`Module ${m.number}: ${m.title}`}
                    loading="lazy"
                    className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-primary shadow">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-extrabold leading-snug text-primary">{m.title}</h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-gray-500">{m.summary}</p>
                  <p className="mt-3 flex items-center gap-3 border-t border-primary/[0.06] pt-3 text-[11px] font-semibold text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-accent-dark" />
                      {m.lessons.length} lessons
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-accent-dark" />
                      {moduleMinutes(m)} min
                    </span>
                  </p>
                </div>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

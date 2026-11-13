import React from 'react'
import { DayPicker } from './DayPicker'
import { Segmented } from './ui'

/**
 * A page's date filter: the range buttons, plus the day picker while the
 * Daily option is on. Switching range drops the picked day.
 */
export function RangePicker({
  options,
  value,
  day,
  today,
  min,
  base,
  params,
  param = 'range',
  dailyKey = 'day',
}: {
  options: readonly { key: string; label: string }[]
  value: string
  /** The day shown when Daily is on, YYYY-MM-DD. */
  day: string
  today: string
  min?: string | null
  base: string
  /** The page's other params, without `day`. */
  params: Record<string, string | undefined>
  param?: string
  /** The option key that means Daily. */
  dailyKey?: string
}) {
  return (
    <>
      <Segmented options={options} value={value} param={param} base={base} params={{ ...params, day: undefined }} />
      {value === dailyKey && <DayPicker day={day} today={today} min={min} base={base} params={{ ...params, [param]: value }} />}
    </>
  )
}

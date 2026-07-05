'use client'
import React, { useId } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const sizeStyles = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
} as const

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  size?: keyof typeof sizeStyles
  options: SelectOption[]
  placeholder?: string
}

export function Select({
  label,
  error,
  size = 'md',
  options,
  placeholder,
  id,
  className,
  ...props
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? `select-${autoId}`
  const hasError = Boolean(error)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={twMerge(
          clsx(
            'w-full rounded-lg border bg-[#F9FAFB] transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#003365] focus:ring-offset-0',
            sizeStyles[size],
            hasError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400'
          ),
          className
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${selectId}-error` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1.5 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

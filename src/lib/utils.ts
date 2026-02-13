import { OUTPUT_FORMATS } from '@/constants'
import { AIUsage } from '@/db/schema'
import { AIFeature } from '@/db/utils'
import { OutputFormat, PlanLimits } from '@/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFileSize = (text: string): string => {
  if (!text) return '0 B'

  const bytes = new Blob([text]).size

  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const formatCurrency = (amount: number): string => {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const formatDate = (date: Date) => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export const getTodayISO = (): string => {
  return formatLocalDate(new Date())
}

/**
 * Get current month in ISO format (YYYY-MM-01)
 */
export const getCurrentMonthISO = (): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

export interface FormatLimitResult {
  used: number
  limit: number
  remaining: number
  percentage: number
}

export const formatLimit = (
  planConfig: PlanLimits,
  todayUsage: AIUsage,
  type: AIFeature,
): FormatLimitResult => {
  const assistLimit = Math.max(0, planConfig[`${type}_day`])
  const used = Math.max(0, todayUsage[type] ?? 0)

  const remaining = Math.max(0, assistLimit - used)
  const percentage =
    assistLimit > 0 ? Math.min(100, (used / assistLimit) * 100) : 0

  return { used, limit: assistLimit, remaining, percentage }
}

export const isValidTheme = (theme: string) => {
  return ['light', 'dark', 'system'].includes(theme)
}

export const validateAIServerFnInput = (data: {
  input: string
  format: OutputFormat
}) => {
  if (!OUTPUT_FORMATS.includes(data.format)) {
    throw new Error('Invalid output format.')
  }
  const input = data.input.trim()
  if (input.length === 0) {
    throw new Error('Input is required.')
  }
  return { ...data, input }
}

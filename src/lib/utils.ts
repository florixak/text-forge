import { OUTPUT_FORMATS } from '@/constants'
import { AIMonthlyUsage, AIUsage } from '@/db/schema'
import { DashboardUsage } from '@/routes/dashboard'
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

export const formatPercentage = (value: number): string => {
  if (isNaN(value) || !isFinite(value)) return '0%'
  if (value < 0.01) return '<0.01%'
  if (value > 99.99) return '>99.99%'
  return `${value.toFixed(2)}%`
}

export interface FormatLimitResult {
  today: DashboardUsage['today']
  month: DashboardUsage['month']
}

export const formatTokenLimit = (
  todayUsage: AIUsage,
  monthlyUsage: AIMonthlyUsage,
  planConfig: PlanLimits,
): FormatLimitResult => {
  const todayUsed = Math.max(0, todayUsage.total_tokens ?? 0)
  const monthlyUsed = Math.max(0, monthlyUsage.total_tokens ?? 0)

  const today = {
    used: todayUsed,
    limit: planConfig.token_limit_day,
    remaining: Math.max(0, planConfig.token_limit_day - todayUsed),
    percentage:
      planConfig.token_limit_day > 0
        ? Math.min(100, (todayUsed / planConfig.token_limit_day) * 100)
        : 0,
  }

  const month = {
    used: monthlyUsed,
    limit: planConfig.token_limit_month,
    remaining: Math.max(0, planConfig.token_limit_month - monthlyUsed),
    percentage:
      planConfig.token_limit_month > 0
        ? Math.min(100, (monthlyUsed / planConfig.token_limit_month) * 100)
        : 0,
  }

  return {
    today,
    month,
  }
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

export const formatBigNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 10000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

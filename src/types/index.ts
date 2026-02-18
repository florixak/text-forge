import { INPUT_FORMATS, OUTPUT_FORMATS } from '@/constants'
import { User } from '@/db/schema'

export type ActionType = 'convert' | 'structure' | 'generate'

export type Plan = 'free' | 'pro'

export type InputFormat = (typeof INPUT_FORMATS)[number]
export type OutputFormat = (typeof OUTPUT_FORMATS)[number]

export interface HistoryItem {
  id: string
  type: ActionType
  inputFormat: InputFormat | 'Prompt'
  outputFormat: OutputFormat
  createdAt: Date
}

export interface DashboardUser extends Pick<
  User,
  'name' | 'plan' | 'enabled' | 'emailVerified' | 'email' | 'createdAt'
> {}

export interface UserPlan {
  loggedIn: boolean
  plan: Plan
  subscription?: {
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: Date
    status: string
  } | null
}

export interface PlanLimits {
  price: number
  description: string

  token_limit_month: number
  token_limit_day: number
  requests_day: number

  support: 'community' | 'priority'
  history_limit: number
  max_input_length: number
  features: string[]

  models: {
    openai: string[]
    google: string[]
  }
}

export interface FormatLimitResult {
  today: DashboardUsage['today']
  month: DashboardUsage['month']
}

export interface DashboardData {
  user: DashboardUser
  usage: {
    today: FormatLimitResult['today']
    month: FormatLimitResult['month']
  }
  featureUsages: {
    assist_ai: number
    structure_ai: number
    generate_ai: number
  }
}

export interface DashboardUsage {
  today: {
    used: number
    limit: number
    remaining: number
    percentage: number
  }
  month: {
    used: number
    limit: number
    remaining: number
    percentage: number
  }
}

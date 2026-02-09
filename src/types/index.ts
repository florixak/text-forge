import { inputFormats, outputFormats } from '@/constants'
import { User } from '@/db/schema'

export type ActionType = 'convert' | 'structure' | 'generate'

export type Plan = 'free' | 'pro'

export type InputFormat = (typeof inputFormats)[number]
export type OutputFormat = (typeof outputFormats)[number]

export interface HistoryItem {
  id: string
  type: ActionType
  inputFormat: InputFormat | 'Prompt'
  outputFormat: OutputFormat
  createdAt: Date
}

export interface DashboardUser extends Pick<
  User,
  'name' | 'plan' | 'enabled' | 'emailVerified'
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

export type PlanLimits = {
  price: number
  description: string

  assist_ai_day: number
  structure_ai_day: number
  generate_ai_day: number

  support: 'community' | 'priority'
  max_input_length: number
  features: string[]
}

import { InputFormat, OutputFormat } from '@/constants'
import { User } from '@/db/schema'

export type ActionType = 'convert' | 'structure' | 'generate'

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

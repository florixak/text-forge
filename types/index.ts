import { InputFormat, OutputFormat } from '@/constants'

export interface HistoryItem {
  id: string
  type: 'convert' | 'structure' | 'generate'
  inputFormat: InputFormat | 'Prompt'
  outputFormat: OutputFormat
  createdAt: Date
}

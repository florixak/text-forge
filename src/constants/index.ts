import { Plan, PlanLimits } from '@/types'

const QUERY_KEYS = {
  usageToday: ['usage', 'today'] as const,
  userPlan: ['userPlan'] as const,
  history: (day?: string, action?: string) => ['history', day, action] as const,
}

const navLinks: {
  name: string
  href: string
}[] = [
  { name: 'Home', href: '/' },
  { name: 'AI Structuring', href: '/ai-structuring' },
  { name: 'Plans', href: '/plans' },
  { name: 'History', href: '/history' },
]

const inputFormats = [
  'Auto-detect',
  'JSON',
  'CSV',
  'YAML',
  'Markdown',
  'HTML',
  'Text',
  'XML',
] as const

const outputFormats = [
  'JSON',
  'CSV',
  'YAML',
  'Markdown',
  'HTML',
  'Text',
  'XML',
] as const

const planLimits: Record<Plan, PlanLimits> = {
  free: {
    price: 0,
    description: 'Basic plan for personal use',
    assist_ai_day: 20,
    structure_ai_day: 15,
    generate_ai_day: 10,
    support: 'community',
    max_input_length: 1000,
    features: [
      '20 AI assist calls per day',
      '15 AI structuring calls per day',
      '10 AI generations per day',
      '20 history record limit',
      'Community support',
      'Max input length: 1000 characters',
    ],
  },
  pro: {
    price: 9.99,
    description: 'For professionals and small teams',
    assist_ai_day: 100,
    structure_ai_day: 75,
    generate_ai_day: 50,
    support: 'priority',
    max_input_length: 10000,
    features: [
      '100 AI assist calls per day',
      '75 AI structuring calls per day',
      '50 AI generations per day',
      'Unlimited history records',
      'Priority support',
      'Max input length: 10,000 characters',
    ],
  },
} as const

const MAX_INPUT_LENGTH = planLimits.free.max_input_length

export {
  navLinks,
  inputFormats,
  outputFormats,
  planLimits,
  MAX_INPUT_LENGTH,
  QUERY_KEYS,
}

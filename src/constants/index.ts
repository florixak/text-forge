import { Plan, PlanLimits } from '@/types'

const QUERY_KEYS = {
  usageToday: ['usage', 'today'] as const,
  userPlan: ['userPlan'] as const,
  history: (day?: string, action?: string) => ['history', day, action] as const,
}

const NAV_LINKS: {
  name: string
  href: string
}[] = [
  { name: 'Home', href: '/' },
  { name: 'AI Structuring', href: '/ai-structuring' },
  { name: 'Plans', href: '/plans' },
  { name: 'History', href: '/history' },
]

const INPUT_FORMATS = [
  'Auto-detect',
  'JSON',
  'CSV',
  'YAML',
  'Markdown',
  'HTML',
  'Text',
  'XML',
] as const

const OUTPUT_FORMATS = [
  'JSON',
  'CSV',
  'YAML',
  'Markdown',
  'HTML',
  'Text',
  'XML',
] as const

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    price: 0,
    description: 'Basic plan for personal use',
    assist_ai_day: 10,
    structure_ai_day: 5,
    generate_ai_day: 5,
    support: 'community',
    max_input_length: 2000,
    history_limit: 30,
    models: {
      openai: [process.env.OPENAI_FREE_MODEL || 'gpt-3.5-turbo'],
      google: [process.env.GEMINI_FREE_MODEL || 'gemini-2.5-flash-lite'],
    },
    features: [
      '10 AI assist calls per day',
      '5 AI structuring calls per day',
      '5 AI generations per day',
      '30 history record limit',
      'Community support',
      `Models ${process.env.OPENAI_FREE_MODEL || 'gpt-3.5-turbo'} and ${process.env.GEMINI_FREE_MODEL || 'gemini-2.5-flash-lite'}`,
      'Max input length: 2,000 characters',
    ],
  },
  pro: {
    price: 9.99,
    description: 'For professionals and small teams',
    assist_ai_day: 100,
    structure_ai_day: 50,
    generate_ai_day: 30,
    support: 'priority',
    max_input_length: 10000,
    history_limit: 10000,
    models: {
      openai: [process.env.OPENAI_PRO_MODEL || 'gpt-4.1-nano'],
      google: [process.env.GEMINI_PRO_MODEL || 'gemini-2.5-flash-lite'],
    },
    features: [
      '100 AI assist calls per day',
      '50 AI structuring calls per day',
      '30 AI generations per day',
      'Unlimited history records',
      'Priority support',
      `Models ${process.env.OPENAI_PRO_MODEL || 'gpt-4.1-nano'} and ${process.env.GEMINI_PRO_MODEL || 'gemini-2.5-flash-lite'}`,
      'Max input length: 10,000 characters',
    ],
  },
} as const

export { NAV_LINKS, INPUT_FORMATS, OUTPUT_FORMATS, PLAN_LIMITS, QUERY_KEYS }

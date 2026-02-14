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
    token_limit_month: 40000,
    token_limit_day: 5000,
    requests_day: 20,
    support: 'community',
    max_input_length: 2000,
    history_limit: 30,
    models: {
      openai: [process.env.VITE_OPENAI_FREE_MODEL || 'gpt-3.5-turbo'],
      google: [process.env.VITE_GEMINI_FREE_MODEL || 'gemini-2.5-flash-lite'],
    },
    features: [
      '40,000 tokens/month and 5,000 tokens/day limit',
      '30 history record limit',
      'Community support',
      `Models ${process.env.VITE_OPENAI_FREE_MODEL || 'gpt-3.5-turbo'} and ${process.env.VITE_GEMINI_FREE_MODEL || 'gemini-2.5-flash-lite'}`,
      'Max input length: 2,000 characters',
    ],
  },
  pro: {
    price: 9.99,
    description: 'For professionals and small teams',
    token_limit_month: 250000,
    token_limit_day: 10000,
    requests_day: 250,
    support: 'priority',
    max_input_length: 10000,
    history_limit: 10000,
    models: {
      openai: [process.env.VITE_OPENAI_PRO_MODEL || 'gpt-4.1-nano'],
      google: [process.env.VITE_GEMINI_PRO_MODEL || 'gemini-2.5-flash-lite'],
    },
    features: [
      '250,000 tokens/month and 10,000 tokens/day limit',
      'Unlimited history records',
      'Priority support',
      `Models ${process.env.VITE_OPENAI_PRO_MODEL || 'gpt-4.1-nano'} and ${process.env.VITE_GEMINI_PRO_MODEL || 'gemini-2.5-flash-lite'}`,
      'Max input length: 10,000 characters',
    ],
  },
} as const

export { NAV_LINKS, INPUT_FORMATS, OUTPUT_FORMATS, PLAN_LIMITS, QUERY_KEYS }

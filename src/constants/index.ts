interface NavLink {
  name: string
  href: string
}

export type InputFormat = (typeof inputFormats)[number]

const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'AI Structuring', href: '/ai-structuring' },
  { name: 'Plans', href: '/plans' },
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

export type PlanLimits = {
  price: number
  description: string
  ai_generations_day: number
  ai_assist_calls: number
  support: 'community' | 'priority'
}

export type Plan = 'free' | 'pro'

const planLimits: Record<Plan, PlanLimits> = {
  free: {
    price: 0,
    description: 'Basic plan for personal use',
    ai_generations_day: 5,
    ai_assist_calls: 10,
    support: 'community',
  },
  pro: {
    price: 15,
    description: 'For professionals and small teams',
    ai_generations_day: 100,
    ai_assist_calls: 500,
    support: 'priority',
  },
} as const

export { navLinks, inputFormats, outputFormats, planLimits }

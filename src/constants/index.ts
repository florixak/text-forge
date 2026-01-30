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

  assist_ai_day: number
  structure_ai_day: number
  generate_ai_day: number

  support: 'community' | 'priority'
}

export type Plan = 'free' | 'pro'

const planLimits: Record<Plan, PlanLimits> = {
  free: {
    price: 0,
    description: 'Basic plan for personal use',
    assist_ai_day: 20,
    structure_ai_day: 20,
    generate_ai_day: 20,
    support: 'community',
  },
  pro: {
    price: 15,
    description: 'For professionals and small teams',
    assist_ai_day: 500,
    structure_ai_day: 100,
    generate_ai_day: 100,
    support: 'priority',
  },
} as const

const MAX_INPUT_LENGTH = 5000

export { navLinks, inputFormats, outputFormats, planLimits, MAX_INPUT_LENGTH }

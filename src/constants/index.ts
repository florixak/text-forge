interface NavLink {
  name: string
  href: string
}

export type InputType = (typeof inputTypes)[number]

const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'AI Tools', href: '/ai-tools' },
]

const inputTypes = [
  'Auto-detect',
  'JSON',
  'CSV',
  'YAML',
  'Markdown',
  'HTML',
  'Text',
  'XML',
] as const

const outputTypes = [
  'JSON',
  'CSV',
  'YAML',
  'Markdown',
  'HTML',
  'Text',
  'XML',
] as const

const planLimits = {
  free: {
    ai_generations_day: 5,
    ai_assist_calls: 10,
    storage_mb: 50,
    support: 'community',
    features: ['basic-formatting'],
  },
  pro: {
    ai_generations_day: 100,
    ai_assist_calls: 500,
    storage_mb: 1000,
    support: 'priority',
    features: ['basic-formatting', 'advanced-ai', 'priority-support'],
  },
} as const

export { navLinks, inputTypes, outputTypes, planLimits }

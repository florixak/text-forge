interface NavLink {
  name: string
  href: string
}

const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'AI Tools', href: '/ai-tools' },
]

const inputTypes = [
  'Auto-detect',
  'JSON',
  'CSV / Excel',
  'YAML',
  'Markdown',
  'HTML',
] as const

const outputTypes = ['JSON', 'CSV / Excel', 'YAML', 'Markdown', 'HTML'] as const

export { navLinks, inputTypes, outputTypes }

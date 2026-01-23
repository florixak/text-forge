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

export { navLinks, inputTypes, outputTypes }

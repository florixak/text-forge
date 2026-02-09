import AIGenerate from '@/components/ai-generate'
import AIStructure from '@/components/ai-structure'
import { OUTPUT_FORMATS } from '@/constants'

import { authMiddleware } from '@/lib/middleware'
import { OutputFormat } from '@/types'
import { createFileRoute, Link } from '@tanstack/react-router'
import * as z from 'zod'

const aiStructuringSchema = z
  .object({
    selected: z
      .enum(['structure', 'generate'])
      .default('structure')
      .catch('structure'),
    to: z.enum(OUTPUT_FORMATS).default('JSON').catch('JSON'),
  })
  .catch({ selected: 'structure', to: 'JSON' })

export const Route = createFileRoute('/ai-structuring')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
  validateSearch: aiStructuringSchema,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { selected, to } = Route.useSearch()

  const handleFormatChange = (format: OutputFormat) => {
    navigate({
      search: (prev) => ({
        ...prev,
        to: format,
      }),
    })
  }

  const Component =
    selected === 'structure' ? (
      <AIStructure selectedFormat={to} setSelectedFormat={handleFormatChange} />
    ) : (
      <AIGenerate selectedFormat={to} setSelectedFormat={handleFormatChange} />
    )

  const activeClass = 'border-primary border-b-2'

  return (
    <section className="min-h-screen bg-background max-w-5xl mx-auto w-full flex flex-col gap-8 p-4 mt-20">
      <div
        className="w-full flex-center flex-row gap-6"
        role="tablist"
        aria-label="AI structuring tabs"
      >
        <Link
          to="/ai-structuring"
          search={(prev) => ({ ...prev, selected: 'structure' })}
          className={`${selected === 'structure' ? activeClass : ''}`}
          role="tab"
          aria-selected={selected === 'structure'}
          tabIndex={selected === 'structure' ? 0 : -1}
          aria-current={selected === 'structure' ? 'page' : undefined}
          aria-controls="tabpanel-structure"
          id="tab-structure"
        >
          AI Structure
        </Link>
        <Link
          to="/ai-structuring"
          search={(prev) => ({ ...prev, selected: 'generate' })}
          className={`${selected === 'generate' ? activeClass : ''}`}
          role="tab"
          aria-selected={selected === 'generate'}
          tabIndex={selected === 'generate' ? 0 : -1}
          aria-current={selected === 'generate' ? 'page' : undefined}
          aria-controls="tabpanel-generate"
          id="tab-generate"
        >
          AI Generate
        </Link>
      </div>
      <div
        className="max-w-5xl w-full"
        id={
          selected === 'structure' ? 'tabpanel-structure' : 'tabpanel-generate'
        }
        role="tabpanel"
        aria-labelledby={
          selected === 'structure' ? 'tab-structure' : 'tab-generate'
        }
      >
        {Component}
      </div>
    </section>
  )
}

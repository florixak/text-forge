import AIGenerate from '@/components/ai-generate'
import AIStructure from '@/components/ai-structure'
import { authMiddleware } from '@/lib/middleware'
import { createFileRoute, Link } from '@tanstack/react-router'
import z from 'zod'

const aiStructuringSchema = z.object({
  selected: z.enum(['structure', 'generate']).default('structure'),
})

export const Route = createFileRoute('/ai-structuring')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
  validateSearch: aiStructuringSchema,
})

function RouteComponent() {
  const { selected } = Route.useSearch()

  const Component = selected === 'structure' ? <AIStructure /> : <AIGenerate />

  const activeClass = 'border-primary border-b-2'

  return (
    <section className="min-h-screen max-w-5xl mx-auto w-full flex flex-col gap-8 p-4 mt-20">
      <div
        className="w-full flex-center flex-row gap-6"
        role="tablist"
        aria-label="AI structuring tabs"
      >
        <Link
          to="/ai-structuring"
          search={{ selected: 'structure' }}
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
          search={{ selected: 'generate' }}
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

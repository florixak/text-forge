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
      <div className="w-full flex-center flex-row gap-6">
        <Link
          to="/ai-structuring"
          search={{ selected: 'structure' }}
          className={`${selected === 'structure' ? activeClass : ''}`}
        >
          AI Structure
        </Link>
        <Link
          to="/ai-structuring"
          search={{ selected: 'generate' }}
          className={`${selected === 'generate' ? activeClass : ''}`}
        >
          AI Generate
        </Link>
      </div>
      <div className="max-w-5xl w-full">{Component}</div>
    </section>
  )
}

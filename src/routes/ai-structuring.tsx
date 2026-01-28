import AIGenerate from '@/components/ai-generate'
import AIStructure from '@/components/ai-structure'
import { createFileRoute, Link } from '@tanstack/react-router'
import z from 'zod'

const aiStructuringSchema = z.object({
  selected: z.enum(['structure', 'generate']).default('structure'),
})

export const Route = createFileRoute('/ai-structuring')({
  component: RouteComponent,
  validateSearch: aiStructuringSchema,
})

function RouteComponent() {
  const { selected } = Route.useSearch()

  const Component = selected === 'structure' ? <AIStructure /> : <AIGenerate />

  return (
    <section className="min-h-screen flex-center flex-col gap-8 p-4">
      <div className="flex flex-row items-center gap-2">
        <Link to="/ai-structuring" search={{ selected: 'structure' }}>
          AI Structure
        </Link>

        <Link to="/ai-structuring" search={{ selected: 'generate' }}>
          AI Generate
        </Link>
      </div>
      <div className="max-w-5xl w-full">{Component}</div>
    </section>
  )
}

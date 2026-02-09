import HistoryFilter from '@/components/history-filter'
import HistoryList from '@/components/history-list'
import { db } from '@/db'
import { historyUsage } from '@/db/schema'
import { authMiddleware } from '@/lib/middleware'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import type { HistoryItem } from '@/types'
import * as z from 'zod'
import { createHistoryQueryOptions } from '@/hooks/query-options'
import { useSuspenseQuery } from '@tanstack/react-query'

const historySearchSchema = z.object({
  day: z.string().optional(),
  action: z.enum(['convert', 'structure', 'generate']).optional(),
})

export const getUserHistoryFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(historySearchSchema)
  .handler(async ({ context, data }): Promise<{ history: HistoryItem[] }> => {
    const { session } = context
    if (!session) {
      throw new Response('Unauthorized', { status: 401 })
    }

    const { day, action } = data

    const conditions = [eq(historyUsage.userId, session.user.id)]

    if (action) {
      conditions.push(eq(historyUsage.action, action))
    }

    if (day) {
      const startOfDay = new Date(day)
      startOfDay.setUTCHours(0, 0, 0, 0)
      const endOfDay = new Date(day)
      endOfDay.setUTCHours(23, 59, 59, 999)

      conditions.push(
        gte(historyUsage.createdAt, startOfDay),
        lte(historyUsage.createdAt, endOfDay),
      )
    }

    const history = await db
      .select({
        id: historyUsage.id,
        type: historyUsage.action,
        inputFormat: historyUsage.from,
        outputFormat: historyUsage.to,
        createdAt: historyUsage.createdAt,
      })
      .from(historyUsage)
      .where(and(...conditions))
      .orderBy(desc(historyUsage.createdAt))
      .limit(20)

    return { history }
  })

export const Route = createFileRoute('/history')({
  component: RouteComponent,
  validateSearch: historySearchSchema,
  server: {
    middleware: [authMiddleware],
  },
  loaderDeps: ({ search }) => ({ day: search.day, action: search.action }),
  loader: async ({ context, deps }) => {
    return context.queryClient.ensureQueryData(createHistoryQueryOptions(deps))
  },
})

function RouteComponent() {
  const { day, action } = Route.useSearch()
  const {
    data: { history },
  } = useSuspenseQuery(createHistoryQueryOptions({ day, action }))

  return (
    <section className="min-h-screen bg-background flex items-center justify-start flex-col gap-8 p-4 mt-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Your activity history</h2>
        <p className="max-w-xl text-muted-foreground">
          Review your recent activities, including conversions, structures, and
          generations.
        </p>
      </div>
      <div className="max-w-4xl w-full flex flex-col gap-4">
        <HistoryFilter />
        <HistoryList history={history} />
      </div>
    </section>
  )
}

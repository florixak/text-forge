import HistoryFilter from '@/components/history/history-filter'
import HistoryList from '@/components/history/history-list'
import LoadingIndicator from '@/components/state/loading-indicator'
import { PLAN_LIMITS } from '@/constants'
import { db } from '@/db'
import { historyUsage } from '@/db/schema'
import { createHistoryQueryOptions } from '@/hooks/query-options'
import { authMiddleware } from '@/lib/middleware'
import type { HistoryItem } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, count, desc, eq, gte, lte } from 'drizzle-orm'
import * as z from 'zod'

const historySearchSchema = z.object({
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (val) => {
        const d = new Date(val)
        return !isNaN(d.getTime()) && val === d.toISOString().slice(0, 10)
      },
      { message: 'Invalid date' },
    )
    .optional(),
  action: z.enum(['convert', 'structure', 'generate']).optional(),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  count: z
    .string()
    .regex(/^\d+$/)
    .optional()
    .default('10')
    .refine(
      (val) => {
        const num = Number(val)
        return num > 0 && num <= 100
      },
      { message: 'Count must be between 1 and 100' },
    ),
})

export const getUserHistoryFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(historySearchSchema)
  .handler(
    async ({
      context,
      data,
    }): Promise<{ history: HistoryItem[]; total: number }> => {
      const { session } = context
      if (!session) {
        throw new Response('Unauthorized', { status: 401 })
      }

      const { day, action, page, count: countStr } = data
      const userPlan = session.user.plan || 'free'
      const planLimit = PLAN_LIMITS[userPlan]?.history_limit || 100

      const conditions = [eq(historyUsage.userId, session.user.id)]

      if (action) {
        conditions.push(eq(historyUsage.action, action))
      }

      if (day) {
        const parsed = new Date(day)
        if (isNaN(parsed.getTime())) {
          throw new Response('Invalid date format', { status: 400 })
        }
        const startOfDay = new Date(parsed)
        startOfDay.setUTCHours(0, 0, 0, 0)
        const endOfDay = new Date(parsed)
        endOfDay.setUTCHours(23, 59, 59, 999)

        conditions.push(
          gte(historyUsage.createdAt, startOfDay),
          lte(historyUsage.createdAt, endOfDay),
        )
      }

      const totalResult = await db
        .select({ total: count() })
        .from(historyUsage)
        .where(and(...conditions))

      const actualTotal = totalResult[0]?.total ?? 0
      const total = Math.min(actualTotal, planLimit)

      const pageNum = Number(page) || 1
      const countNum = Number(countStr) || 10
      const offset = (pageNum - 1) * countNum

      if (offset >= planLimit) {
        return { history: [], total }
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
        .offset(offset)
        .limit(Math.min(countNum, planLimit - offset))

      return { history, total }
    },
  )

export const Route = createFileRoute('/history')({
  component: RouteComponent,
  validateSearch: historySearchSchema,
  server: {
    middleware: [authMiddleware],
  },
  pendingComponent: () => <LoadingIndicator text="Loading history..." />,
  loaderDeps: ({ search }) => ({
    day: search.day,
    action: search.action,
    page: search.page,
    count: search.count,
  }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(createHistoryQueryOptions(deps))
  },
})

function RouteComponent() {
  const { day, action, page, count } = Route.useSearch()
  const {
    data: { history, total },
  } = useSuspenseQuery(createHistoryQueryOptions({ day, action, page, count }))

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
        <HistoryList
          history={history}
          paging={{ page: Number(page), count: Number(count), total }}
        />
      </div>
    </section>
  )
}

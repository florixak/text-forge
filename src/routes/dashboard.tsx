import DashboardFooter from '@/components/dashboard/dashboard-footer'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardQuickActions from '@/components/dashboard/dashboard-quick-actions'
import DashboardUsageInfo from '@/components/dashboard/dashboard-usage-info'
import { PLAN_LIMITS } from '@/constants'

import { db } from '@/db'
import { aiUsage } from '@/db/schema'
import { createUsageQueryOptions } from '@/hooks/query-options'
import { authMiddleware } from '@/lib/middleware'
import { formatLimit, FormatLimitResult } from '@/lib/utils'
import { DashboardUser } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'

export interface DashboardData {
  user: DashboardUser
  usage: {
    words: number
    last_used: number | null
    assist: FormatLimitResult
    structure: FormatLimitResult
    generate: FormatLimitResult
  }
}

export const getTodayUsage = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user } = context.session || {}

    if (!user) {
      throw redirect({ to: '/signin' })
    }

    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const todayUsage = await db
        .select()
        .from(aiUsage)
        .where(and(eq(aiUsage.userId, user.id), eq(aiUsage.day, today)))
        .limit(1)

      const planKey = user.plan
      const planConfig = PLAN_LIMITS[planKey]
      if (!planConfig) {
        throw new Error('Invalid plan configuration')
      }
      const lastUsedDate = todayUsage[0]?.last_used
        ? new Date(todayUsage[0].last_used)
        : null
      const last_used = lastUsedDate
        ? Math.max(
            0,
            Math.floor(
              (now.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60),
            ),
          )
        : null

      const words = todayUsage[0]?.words ?? 0

      const assistLimit = formatLimit(
        planConfig,
        todayUsage[0] || {},
        'assist_ai',
      )
      const structureLimit = formatLimit(
        planConfig,
        todayUsage[0] || {},
        'structure_ai',
      )
      const generateLimit = formatLimit(
        planConfig,
        todayUsage[0] || {},
        'generate_ai',
      )

      const usage: DashboardData['usage'] = {
        words,
        last_used,
        assist: assistLimit,
        structure: structureLimit,
        generate: generateLimit,
      }

      return {
        user,
        usage,
      }
    } catch (error) {
      throw new Error('Failed to fetch usage data')
    }
  })

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
  errorComponent: () => <div>Failed to load dashboard</div>,
  pendingComponent: () => <div>Loading dashboard...</div>,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(createUsageQueryOptions())
  },
})

function RouteComponent() {
  const {
    data: { user, usage },
  } = useSuspenseQuery(createUsageQueryOptions())
  return (
    <section className="max-w-3xl mx-auto min-h-screen bg-background flex flex-col items-start justify-center gap-8 my-8">
      <DashboardHeader data={{ user, usage }} />

      <DashboardQuickActions />

      <DashboardUsageInfo data={{ user, usage }} />

      <DashboardFooter />
    </section>
  )
}

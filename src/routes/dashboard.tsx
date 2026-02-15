import DashboardFooter from '@/components/dashboard/dashboard-footer'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardQuickActions from '@/components/dashboard/dashboard-quick-actions'
import DashboardUsageInfo from '@/components/dashboard/dashboard-usage-info'
import LoadingIndicator from '@/components/state/loading-indicator'
import { PLAN_LIMITS } from '@/constants'

import { db } from '@/db'
import { aiMonthlyUsage, aiUsage } from '@/db/schema'
import { createUsageQueryOptions } from '@/hooks/query-options'
import { authMiddleware } from '@/lib/middleware'
import { formatTokenLimit, getCurrentMonthISO, getTodayISO } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'

export const getTodayUsage = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user } = context.session || {}

    if (!user) {
      throw redirect({ to: '/signin' })
    }

    try {
      const today = getTodayISO()
      const month = getCurrentMonthISO()
      const [todayUsage, monthlyUsage, allUsage] = await Promise.all([
        db
          .select()
          .from(aiUsage)
          .where(and(eq(aiUsage.userId, user.id), eq(aiUsage.day, today)))
          .limit(1),
        db
          .select()
          .from(aiMonthlyUsage)
          .where(
            and(
              eq(aiMonthlyUsage.userId, user.id),
              eq(aiMonthlyUsage.month, month),
            ),
          )
          .limit(1),
        db
          .select({
            assist_ai: sql<number>`COALESCE(SUM(${aiUsage.assist_ai}), 0)`,
            structure_ai: sql<number>`COALESCE(SUM(${aiUsage.structure_ai}), 0)`,
            generate_ai: sql<number>`COALESCE(SUM(${aiUsage.generate_ai}), 0)`,
          })
          .from(aiUsage)
          .where(eq(aiUsage.userId, user.id)),
      ])

      const planKey = user.plan
      const planConfig = PLAN_LIMITS[planKey]
      if (!planConfig) {
        throw new Error('Invalid plan configuration')
      }

      const usage = formatTokenLimit(
        todayUsage[0] ?? {
          total_tokens: 0,
        },
        monthlyUsage[0] ?? {
          total_tokens: 0,
        },
        planConfig,
      )

      const featureUsages = {
        assist_ai: allUsage[0]?.assist_ai ?? 0,
        structure_ai: allUsage[0]?.structure_ai ?? 0,
        generate_ai: allUsage[0]?.generate_ai ?? 0,
      }

      return {
        user,
        usage,
        featureUsages,
      }
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to load usage data')
    }
  })

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
  pendingComponent: () => <LoadingIndicator text="Loading dashboard..." />,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(createUsageQueryOptions())
  },
  head: () => {
    const baseUrl = new URL(
      process.env.VITE_BASE_URL || 'http://localhost:3000',
    )
    const canonicalUrl = new URL('/dashboard', baseUrl).toString()
    const ogImageUrl = new URL('/og-image.png', baseUrl).toString()

    const appTitle = 'Dashboard - TextForge'
    const appDescription =
      'Your TextForge dashboard provides insights into your AI usage, quick access to tools, and an overview of your account. Manage your AI interactions and stay informed about your usage limits.'

    return {
      meta: [
        {
          title: appTitle,
        },
        {
          name: 'description',
          content: appDescription,
        },
        { property: 'og:title', content: appTitle },
        {
          property: 'og:description',
          content: appDescription,
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:image', content: ogImageUrl },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: appTitle },
        {
          name: 'twitter:description',
          content: appDescription,
        },
        { name: 'twitter:image', content: ogImageUrl },

        { name: 'robots', content: 'noindex, nofollow' },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
    }
  },
})

function RouteComponent() {
  const {
    data: { user, usage, featureUsages },
  } = useSuspenseQuery(createUsageQueryOptions())
  return (
    <section className="max-w-4xl mx-auto min-h-screen bg-background flex flex-col items-start justify-center gap-8 my-8 px-4">
      <DashboardHeader data={{ user, usage, featureUsages }} />

      <DashboardQuickActions />

      <DashboardUsageInfo data={{ user, usage, featureUsages }} />

      <DashboardFooter />
    </section>
  )
}

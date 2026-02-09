import PlanCard from '@/components/plan-card'
import PlanFeatureTable from '@/components/plan-feature-table'
import { planLimits } from '@/constants'
import { createPlanQueryOptions } from '@/hooks/query-options'
import { authOptionalMiddleware } from '@/lib/middleware'
import { getUserSubscription } from '@/lib/stripe'
import { Plan, PlanLimits, UserPlan } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import * as z from 'zod'

const planSchema = z
  .object({
    plan: z.enum(['free', 'pro']).catch('free'),
  })
  .catch({ plan: 'free' })

export const getUserPlan = createServerFn()
  .middleware([authOptionalMiddleware])
  .handler(async ({ context }): Promise<UserPlan> => {
    const { user } = context.session || {}
    if (!user) {
      return { loggedIn: false, plan: 'free' }
    }

    let subscriptionInfo: UserPlan['subscription'] = null
    try {
      const sub = await getUserSubscription()
      if (sub) {
        subscriptionInfo = {
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          currentPeriodEnd: sub.currentPeriodEnd,
          status: sub.status,
        }
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error)
    }

    return {
      loggedIn: true,
      plan: user.plan as Plan,
      subscription: subscriptionInfo,
    }
  })

export const Route = createFileRoute('/plans')({
  component: RouteComponent,
  validateSearch: planSchema,
  errorComponent: () => <div>Failed to load plans.</div>,
  pendingComponent: () => <div>Loading plans...</div>,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(createPlanQueryOptions())
  },
})

function RouteComponent() {
  const { plan: selected } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: userPlan } = useSuspenseQuery(createPlanQueryOptions())

  const plans = Array.from(Object.entries(planLimits)) as [Plan, PlanLimits][]

  const handleSelectPlan = (plan: Plan) => {
    navigate({
      search: (prev) => ({
        ...prev,
        plan,
      }),
    })
  }

  return (
    <section className="min-h-screen bg-background flex-center font-bold flex-col gap-8 p-4 mt-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl">Choose the right plan for your workflow</h2>
        <p className="max-w-xl text-muted-foreground font-normal">
          Simple and transparent pricing. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {plans.map(([plan, limits]) => (
          <PlanCard
            key={plan}
            plan={plan}
            limits={limits}
            selected={selected}
            onSelect={handleSelectPlan}
            userPlan={userPlan}
          />
        ))}
      </div>
      <div className="w-full max-w-3xl mt-8">
        <h3 className="mb-4 text-lg font-semibold">Feature Comparison</h3>
        <div className="overflow-x-auto rounded-xl shadow-sm bg-card border border-border">
          <PlanFeatureTable plans={plans} selected={selected} />
        </div>
      </div>
    </section>
  )
}

import PlanCard from '@/components/plan-card'
import PlanFeatureTable from '@/components/plan-feature-table'
import { Plan, PlanLimits, planLimits } from '@/constants'
import { authOptionalMiddleware } from '@/lib/middleware'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'

export interface UserPlan {
  loggedIn: boolean
  plan: Plan
}

const getUserPlan = createServerFn()
  .middleware([authOptionalMiddleware])
  .handler(async ({ context }): Promise<UserPlan> => {
    const { user } = context.session || {}
    if (!user) {
      return { loggedIn: false, plan: 'free' }
    }

    return { loggedIn: true, plan: user.plan as Plan }
  })

export const Route = createFileRoute('/plans')({
  component: RouteComponent,
  errorComponent: () => <div>Failed to load plans.</div>,
  pendingComponent: () => <div>Loading plans...</div>,
  loader: async () => {
    const userPlan = await getUserPlan()
    return { userPlan }
  },
})

function RouteComponent() {
  const { userPlan } = Route.useLoaderData()
  const [selected, setSelected] = useState<Plan>(userPlan.plan)
  const plans = Array.from(Object.entries(planLimits)) as [Plan, PlanLimits][]

  const handleSelectPlan = (plan: Plan) => {
    setSelected(plan)
  }

  return (
    <section className="min-h-screen bg-background flex-center font-bold flex-col gap-8 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl">Choose the right plan for your workflow</h2>
        <p className="max-w-xl text-muted-foreground">
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

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plan, planLimits } from '@/constants'
import { authOptionalMiddleware } from '@/lib/middleware'
import { formatCurrency } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'

const getUserPlan = createServerFn()
  .middleware([authOptionalMiddleware])
  .handler(
    async ({
      context,
    }): Promise<{
      loggedIn: boolean
      plan: Plan
    }> => {
      const { user } = context.session || {}
      if (!user) {
        return { loggedIn: false, plan: 'free' }
      }

      return { loggedIn: true, plan: user.plan as Plan }
    },
  )

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
  const plans = Array.from(Object.entries(planLimits)) as [
    Plan,
    (typeof planLimits)[Plan],
  ][]

  const handleSelectPlan = (plan: Plan) => {
    setSelected(plan)
  }

  return (
    <section className="min-h-screen flex-center font-bold flex-col gap-8 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl">Choose the right plan for your workflow</h2>
        <p className="max-w-xl text-muted-foreground">
          Simple and transparent pricing. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {plans.map(([plan, limits]) => (
          <Card
            key={plan}
            onClick={() => handleSelectPlan(plan)}
            role="button"
            tabIndex={0}
            onKeyDown={() => handleSelectPlan(plan)}
            className={`relative w-sm ${selected === plan ? 'border-2 border-primary' : ''}`}
          >
            <CardHeader>
              <h3 className="text-lg capitalize text-primary">{plan}</h3>
              <p className="text-3xl">
                {formatCurrency(limits.price)}
                <span className="text-base text-muted-foreground">/month</span>
              </p>
              <p className="font-medium text-muted-foreground">
                {limits.description}
              </p>
              <Button className="mt-4 w-full" disabled={userPlan.plan === plan}>
                {userPlan.loggedIn
                  ? plan === userPlan.plan
                    ? 'Current Plan'
                    : `Choose ${plan} plan`
                  : 'Sign in to choose plan'}
              </Button>
            </CardHeader>
            <Separator />
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm font-medium">
                <li>{limits.ai_generations_day} AI generations per day</li>
                <li>{limits.ai_assist_calls} AI assist calls</li>
                <li>Support: {limits.support}</li>
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="w-full max-w-3xl mt-8">
        <h3 className="mb-4 text-lg font-semibold">Feature Comparison</h3>
        <div className="overflow-x-auto rounded-xl shadow-sm bg-card border border-border">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card-foreground/5 px-6 py-4 text-left font-semibold text-muted-foreground rounded-tl-xl">
                  Feature
                </th>
                {plans.map(([plan]) => (
                  <th
                    key={plan}
                    className="px-6 py-4 text-center font-semibold capitalize bg-card-foreground/5"
                  >
                    {plan}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-6 py-4 font-medium text-muted-foreground bg-card-foreground/5">
                  AI Generations per Day
                </td>
                {plans.map(([plan, limits]) => (
                  <td
                    key={plan}
                    className={`px-6 py-4 text-center ${selected === plan ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {limits.ai_generations_day}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="px-6 py-4 font-medium text-muted-foreground bg-card-foreground/5">
                  AI Assist Calls
                </td>
                {plans.map(([plan, limits]) => (
                  <td
                    key={plan}
                    className={`px-6 py-4 text-center ${selected === plan ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {limits.ai_assist_calls}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="px-6 py-4 font-medium text-muted-foreground bg-card-foreground/5 rounded-bl-xl">
                  Support
                </td>
                {plans.map(([plan, limits], idx) => (
                  <td
                    key={plan}
                    className={`px-6 py-4 text-center capitalize ${selected === plan ? 'text-primary' : 'text-muted-foreground'} ${idx === plans.length - 1 ? ' rounded-br-xl' : ''}`}
                  >
                    {limits.support}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

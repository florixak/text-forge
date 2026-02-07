import { Plan, PlanLimits } from '@/constants'
import { createCheckoutSession } from '@/lib/stripe'
import { formatCurrency } from '@/lib/utils'
import { UserPlan } from '@/routes/plans'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Separator } from './ui/separator'

interface PlanCardProps {
  plan: Plan
  limits: PlanLimits
  selected: Plan
  onSelect: (plan: Plan) => void
  userPlan: UserPlan
}

const PlanCard = ({
  plan,
  limits,
  selected,
  onSelect,
  userPlan,
}: PlanCardProps) => {
  const { mutate } = useMutation({
    mutationFn: () => createCheckoutSession(),
    onError: (error) => {
      console.error('Error creating checkout session:', error)
      toast.error('Failed to create checkout session. Please try again.')
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('No checkout URL returned. Please try again.')
      }
    },
  })

  const handleSelectPlan = (plan: Plan) => {
    onSelect(plan)
  }

  return (
    <Card
      key={plan}
      onClick={() => handleSelectPlan(plan)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelectPlan(plan)
        }
      }}
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
        <Button
          className="mt-4 w-full"
          disabled={userPlan.plan === plan && userPlan.loggedIn}
          onClick={async (e) => {
            e.stopPropagation()
            if (!userPlan.loggedIn) {
              toast.error('Please sign in to choose a plan.')
              return
            }
            if (userPlan.plan === plan) {
              toast('You are already on this plan.')
              return
            }
            mutate()
          }}
        >
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
          {limits.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default PlanCard

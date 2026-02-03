import { Plan, PlanLimits } from '@/constants'
import { formatCurrency } from '@/lib/utils'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Separator } from './ui/separator'
import { UserPlan } from '@/routes/plans'

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

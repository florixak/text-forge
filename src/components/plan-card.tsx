import { Plan, PlanLimits } from '@/constants'
import {
  createCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
} from '@/lib/stripe'
import { formatCurrency, formatDate } from '@/lib/utils'
import { UserPlan } from '@/routes/plans'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Separator } from './ui/separator'
import PlanDialog from './plan-dialog'
import { useState } from 'react'

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
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: createCheckoutSessionMutate, isPending: isUpgrading } =
    useMutation({
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

  const { mutate: cancelSubscriptionMutate, isPending: isCanceling } =
    useMutation({
      mutationFn: () => cancelSubscription(),
      onError: () => {
        toast.error('Failed to downgrade to free plan. Please try again.')
      },
      onSuccess: () => {
        setIsPlanDialogOpen(false)
        toast.success(
          'Subscription canceled. You will be downgraded to the free plan at the end of your current billing period.',
        )
        queryClient.invalidateQueries({ queryKey: ['userPlan'] })
      },
    })

  const { mutate: reactivateSubscriptionMutate, isPending: isReactivating } =
    useMutation({
      mutationFn: () => reactivateSubscription(),
      onError: () => {
        toast.error('Failed to reactivate subscription. Please try again.')
      },
      onSuccess: () => {
        toast.success('Subscription reactivated successfully.')
        queryClient.invalidateQueries({ queryKey: ['userPlan'] })
      },
    })

  const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!userPlan.loggedIn) {
      toast.error('Please sign in to downgrade your plan.')
      return
    }
    if (
      userPlan.plan === 'free' ||
      (userPlan.plan === 'pro' && userPlan.subscription?.cancelAtPeriodEnd)
    ) {
      toast('You are already on the free plan.')
      return
    }
    setIsPlanDialogOpen(true)
  }

  const handleConfirmCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    cancelSubscriptionMutate()
  }

  const handleUpgrade = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!userPlan.loggedIn) {
      toast.error('Please sign in to upgrade your plan.')
      return
    }
    if (userPlan.plan === 'pro') {
      toast('You are already on the pro plan.')
      return
    }
    createCheckoutSessionMutate()
  }

  const handleReactivate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!userPlan.loggedIn) {
      toast.error('Please sign in to reactivate your subscription.')
      return
    }
    if (userPlan.plan === 'free') {
      toast('You are already on the free plan.')
      return
    }
    if (userPlan.plan === 'pro' && !userPlan.subscription?.cancelAtPeriodEnd) {
      toast('Your subscription is already active.')
      return
    }
    reactivateSubscriptionMutate()
  }

  const handleSelectPlan = (plan: Plan) => {
    onSelect(plan)
  }

  const isCurrentPlan = userPlan.plan === plan && userPlan.loggedIn
  const isCanceledPro =
    plan === 'pro' &&
    userPlan.plan === 'pro' &&
    userPlan.subscription?.cancelAtPeriodEnd

  const getButtonText = () => {
    if (!userPlan.loggedIn) return 'Sign in to choose plan'
    if (plan === 'free') {
      if (userPlan.plan === 'free') return 'Current Plan'
      return 'Cancel Subscription'
    }
    if (plan === 'pro') {
      if (userPlan.plan === 'pro') {
        if (isCanceledPro) return 'Reactivate Subscription'
        return 'Current Plan'
      }
      return 'Upgrade to Pro'
    }
    return 'Choose Plan'
  }

  return (
    <>
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
            disabled={
              (isCurrentPlan && !isCanceledPro) ||
              isUpgrading ||
              isCanceling ||
              isReactivating
            }
            onClick={
              plan === 'pro'
                ? isCanceledPro
                  ? handleReactivate
                  : handleUpgrade
                : handleCancelClick
            }
          >
            {isUpgrading || isCanceling || isReactivating
              ? 'Processing...'
              : getButtonText()}
          </Button>
          {plan === 'pro' &&
            userPlan.plan === 'pro' &&
            userPlan.subscription && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-normal">
                  {isCanceledPro ? (
                    <>
                      Ends on{' '}
                      {formatDate(userPlan.subscription.currentPeriodEnd)}
                    </>
                  ) : (
                    <>
                      Renews on{' '}
                      {formatDate(userPlan.subscription.currentPeriodEnd)}
                    </>
                  )}
                </p>
              </div>
            )}
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
      <PlanDialog
        open={isPlanDialogOpen}
        userPlan={userPlan}
        canceling={isCanceling}
        onCancelSubscription={handleConfirmCancel}
        onClose={() => setIsPlanDialogOpen(false)}
      />
    </>
  )
}

export default PlanCard

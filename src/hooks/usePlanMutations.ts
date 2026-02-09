import { QUERY_KEYS } from '@/constants'
import {
  cancelSubscription,
  createCheckoutSession,
  reactivateSubscription,
} from '@/lib/stripe'
import { UserPlan } from '@/routes/plans'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UsePlanMutationsOptions {
  onCancelSuccess?: () => void
  onReactivateSuccess?: () => void
}

const usePlanMutations = (callbacks: UsePlanMutationsOptions = {}) => {
  const queryClient = useQueryClient()

  const checkout = useMutation({
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

  const handleSubscriptionUpdate = (message: string) => {
    toast.success(message)
    queryClient.setQueryData(
      QUERY_KEYS.userPlan,
      (oldData: UserPlan | undefined) => {
        if (!oldData || !oldData.loggedIn) return oldData
        return {
          ...oldData,
          subscription: {
            ...oldData.subscription,
            cancelAtPeriodEnd: !(
              oldData.subscription?.cancelAtPeriodEnd ?? false
            ),
          },
        }
      },
    )
  }

  const cancel = useMutation({
    mutationFn: () => cancelSubscription(),
    onError: () => {
      toast.error('Failed to downgrade to free plan. Please try again.')
    },
    onSuccess: () => {
      callbacks?.onCancelSuccess?.()
      handleSubscriptionUpdate(
        'Subscription will be canceled at the end of the billing period.',
      )
    },
  })

  const reactivate = useMutation({
    mutationFn: () => reactivateSubscription(),
    onError: () => {
      toast.error('Failed to reactivate subscription. Please try again.')
    },
    onSuccess: () => {
      callbacks?.onReactivateSuccess?.()
      handleSubscriptionUpdate('Subscription reactivated successfully.')
    },
  })

  return {
    checkout,
    cancel,
    reactivate,
  }
}

export default usePlanMutations

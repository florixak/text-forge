import { QUERY_KEYS } from '@/constants'
import {
  cancelSubscriptionFn,
  createCheckoutSessionFn,
  reactivateSubscriptionFn,
} from '@/lib/stripe'
import { UserPlan } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'

interface UsePlanMutationsOptions {
  onCancelSuccess?: () => void
  onReactivateSuccess?: () => void
}

const usePlanMutations = (callbacks: UsePlanMutationsOptions = {}) => {
  const queryClient = useQueryClient()

  const createCheckoutSession = useServerFn(createCheckoutSessionFn)
  const cancelSubscription = useServerFn(cancelSubscriptionFn)
  const reactivateSubscription = useServerFn(reactivateSubscriptionFn)

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

  const handleSubscriptionUpdate = (
    message: string,
    cancelAtPeriodEnd: boolean,
  ) => {
    toast.success(message)
    queryClient.setQueryData(
      QUERY_KEYS.userPlan,
      (oldData: UserPlan | undefined) => {
        if (!oldData || !oldData.loggedIn || !oldData.subscription)
          return oldData
        return {
          ...oldData,
          subscription: {
            ...oldData.subscription,
            cancelAtPeriodEnd,
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
        true,
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
      handleSubscriptionUpdate('Subscription reactivated successfully.', false)
    },
  })

  return {
    checkout,
    cancel,
    reactivate,
  }
}

export default usePlanMutations

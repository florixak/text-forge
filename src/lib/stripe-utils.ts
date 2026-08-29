import Stripe from 'stripe'

export const getSubscriptionItem = (subscription: Stripe.Subscription) => {
  if (subscription.items.data.length === 0) {
    throw new Error(`Subscription ${subscription.id} has no items`)
  }

  return subscription.items.data[0]
}

export const formatPeriodStartEnd = (subscription: Stripe.Subscription) => {
  const subscriptionItem = getSubscriptionItem(subscription)
  const currentPeriodStartTs = subscriptionItem.current_period_start
  const currentPeriodEndTs = subscriptionItem.current_period_end

  return {
    currentPeriodStart: new Date(currentPeriodStartTs * 1000),
    currentPeriodEnd: new Date(currentPeriodEndTs * 1000),
  }
}

const VALID_STATUSES = [
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
] as const

type SubscriptionStatus = (typeof VALID_STATUSES)[number]

export const toSubscriptionStatus = (status: string): SubscriptionStatus => {
  if (VALID_STATUSES.includes(status as SubscriptionStatus)) {
    return status as SubscriptionStatus
  }
  console.warn(
    `Unknown subscription status: ${status}, defaulting to 'incomplete'`,
  )
  return 'incomplete'
}

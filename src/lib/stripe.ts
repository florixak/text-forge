import { db } from '@/db'
import { stripeCustomerCache, subscription } from '@/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { authMiddleware } from './middleware'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export const getOrCreateStripeCustomer = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user: authUser } = context.session

    const cached = await db
      .select()
      .from(stripeCustomerCache)
      .where(eq(stripeCustomerCache.userId, authUser.id))
      .limit(1)

    if (cached.length > 0) {
      return cached[0].stripeCustomerId
    }

    const customer = await stripe.customers.create({
      email: authUser.email,
      name: authUser.name,
      metadata: {
        userId: authUser.id,
      },
    })

    try {
      await db.insert(stripeCustomerCache).values({
        userId: authUser.id,
        stripeCustomerId: customer.id,
      })
    } catch (error) {
      const cached = await db
        .select()
        .from(stripeCustomerCache)
        .where(eq(stripeCustomerCache.userId, authUser.id))
        .limit(1)

      if (cached.length > 0) {
        return cached[0].stripeCustomerId
      }
      throw error
    }

    return customer.id
  })

export const createCheckoutSession = createServerFn()
  .middleware([authMiddleware])
  .handler(async (ctx) => {
    const customerId = await getOrCreateStripeCustomer()

    const priceId = process.env.STRIPE_PRO_PRICE_ID
    if (!priceId) {
      throw new Error('STRIPE_PRO_PRICE_ID is not configured')
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/plans`,
      metadata: {
        userId: ctx.context.session.user.id,
      },
      subscription_data: {
        metadata: {
          userId: ctx.context.session.user.id,
        },
      },
    })

    if (!session.url) {
      throw new Error('Failed to create checkout session')
    }

    return { url: session.url }
  })

export const cancelSubscription = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session.user.id

    const subs = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))

    if (subs.length === 0) {
      throw new Error('No subscription found for user')
    }

    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        await stripe.subscriptions.update(sub.stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      }),
    )
    const failures = results.filter((r) => r.status === 'rejected')
    if (failures.length === subs.length) {
      throw new Error('Failed to cancel all subscriptions')
    }
    return {
      success: true,
      message:
        failures.length > 0
          ? 'Some subscriptions could not be canceled'
          : 'Subscription canceled and downgraded to free plan',
    }
  })

export const reactivateSubscription = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session.user.id

    const subs = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .limit(1)

    if (subs.length === 0) {
      throw new Error('No subscription found for user')
    }

    const sub = subs[0]

    try {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: false,
      })
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      throw new Error('Failed to reactivate subscription')
    }

    return {
      success: true,
      message: 'Subscription reactivated and will remain on pro plan',
    }
  })

export const getUserSubscription = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session.user.id

    const subs = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .limit(1)

    if (subs.length === 0) {
      return null
    }

    return subs[0]
  })

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
  if (VALID_STATUSES.includes(status as any)) {
    return status as SubscriptionStatus
  }
  console.warn(
    `Unknown subscription status: ${status}, defaulting to 'incomplete'`,
  )
  return 'incomplete'
}

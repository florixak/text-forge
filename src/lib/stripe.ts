import { db } from '@/db'
import { stripeCustomerCache, subscription } from '@/db/schema'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { authMiddleware } from './middleware'

export {
  formatPeriodStartEnd,
  getSubscriptionItem,
  toSubscriptionStatus,
} from './stripe-utils'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey, { apiVersion: '2026-01-28.clover' })
}

const stripe = getStripe()

export const getOrCreateStripeCustomerFn = createServerFn()
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

export const createCheckoutSessionFn = createServerFn()
  .middleware([authMiddleware])
  .handler(async (ctx) => {
    const customerId = await getOrCreateStripeCustomerFn()

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

export const cancelSubscriptionFn = createServerFn()
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

export const reactivateSubscriptionFn = createServerFn()
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

export const getUserSubscriptionFn = createServerFn()
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

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

    await db.insert(stripeCustomerCache).values({
      userId: authUser.id,
      stripeCustomerId: customer.id,
    })

    return customer.id
  })

export const createCheckoutSession = createServerFn()
  .middleware([authMiddleware])
  .handler(async (ctx) => {
    const customerId = await getOrCreateStripeCustomer()

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/plans`,
      metadata: {
        userId: ctx.context.session.user.id,
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

    const cancelPromises = subs.map(async (sub) => {
      try {
        await stripe.subscriptions.update(sub.stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      } catch (error) {
        console.error(
          `Failed to cancel subscription ${sub.stripeSubscriptionId}:`,
          error,
        )
      }
    })

    await Promise.all(cancelPromises)

    return {
      success: true,
      message: 'Subscription canceled and downgraded to free plan',
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

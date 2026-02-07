import { createServerFn } from '@tanstack/react-start'
import Stripe from 'stripe'
import { authMiddleware } from './middleware'
import { db } from '@/db'
import { stripeCustomerCache } from '@/db/schema'
import { eq } from 'drizzle-orm'

const BASE_URL = process.env.VITE_BASE_URL || 'http://localhost:3000'

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

    return { url: session.url }
  })

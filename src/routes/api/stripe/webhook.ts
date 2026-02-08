import { db } from '@/db'
import { subscription, user } from '@/db/schema'
import { sendEmail } from '@/lib/email'
import { formatPeriodStartEnd, getSubscriptionItem } from '@/lib/stripe'
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error(
    'STRIPE_WEBHOOK_SECRET is not defined in environment variables',
  )
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
})

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST,
    },
  },
})

async function POST({ request }: { request: Request }) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = session.subscription as string
          const customerId = session.customer as string
          const userId = session.metadata?.userId

          if (!userId) {
            console.error('No userId in checkout session metadata')
            break
          }

          const existing = await db
            .select()
            .from(subscription)
            .where(eq(subscription.stripeSubscriptionId, subscriptionId))
            .limit(1)

          if (existing.length > 0) {
            console.log(
              `Subscription ${subscriptionId} already exists, skipping creation`,
            )
            break
          }

          const stripeSubscription =
            await stripe.subscriptions.retrieve(subscriptionId)

          if (stripeSubscription.items.data.length === 0) {
            console.error(
              `Subscription ${stripeSubscription.id} has no items, skipping creation`,
            )
            break
          }
          const subscriptionItem = getSubscriptionItem(stripeSubscription)
          const { currentPeriodStart, currentPeriodEnd } =
            formatPeriodStartEnd(stripeSubscription)

          await db.transaction(async (tx) => {
            await tx.insert(subscription).values({
              userId,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              stripePriceId: subscriptionItem.price.id,
              status: stripeSubscription.status as any,
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            })

            await tx
              .update(user)
              .set({ plan: 'pro' })
              .where(eq(user.id, userId))
          })

          console.log(`Subscription created for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object as Stripe.Subscription
        let userId = stripeSubscription.metadata?.userId

        if (stripeSubscription.items.data.length === 0) {
          console.error(
            `Subscription ${stripeSubscription.id} has no items, skipping update`,
          )
          break
        }

        const subscriptionItem = getSubscriptionItem(stripeSubscription)
        const { currentPeriodStart, currentPeriodEnd } =
          formatPeriodStartEnd(stripeSubscription)

        await db.transaction(async (tx) => {
          const existingSub = await tx
            .select()
            .from(subscription)
            .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))
            .limit(1)

          if (existingSub.length === 0) {
            console.warn(
              `Subscription ${stripeSubscription.id} not found in database, skipping update handling`,
            )
            return
          }

          await tx
            .update(subscription)
            .set({
              status: stripeSubscription.status as any,
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              stripePriceId: subscriptionItem.price.id,
            })
            .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))

          if (!userId && existingSub.length > 0) {
            userId = existingSub[0].userId
          }

          if (userId) {
            const isActive = ['active', 'trialing'].includes(
              stripeSubscription.status,
            )
            console.log(
              `Updating user ${userId} plan to ${isActive ? 'pro' : 'free'}`,
            )
            await tx
              .update(user)
              .set({ plan: isActive ? 'pro' : 'free' })
              .where(eq(user.id, userId))
          } else {
            console.warn(
              `Could not find userId for subscription ${stripeSubscription.id}`,
            )
          }
        })

        console.log(
          `Subscription ${stripeSubscription.id} updated to ${stripeSubscription.status}`,
        )
        break
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object as Stripe.Subscription
        let userId = stripeSubscription.metadata?.userId

        await db.transaction(async (tx) => {
          const existingSub = await tx
            .select()
            .from(subscription)
            .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))
            .limit(1)

          if (existingSub.length === 0) {
            console.warn(
              `Subscription ${stripeSubscription.id} not found in database, skipping deletion handling`,
            )
            return
          }

          if (!userId) {
            userId = existingSub[0].userId
          }

          await tx
            .update(subscription)
            .set({ status: 'canceled' })
            .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))

          if (userId) {
            await tx
              .update(user)
              .set({ plan: 'free' })
              .where(eq(user.id, userId))
            console.log(`User ${userId} downgraded to free plan`)
          } else {
            console.warn(
              `Could not find userId for subscription ${stripeSubscription.id}`,
            )
          }
        })

        console.log(`Subscription ${stripeSubscription.id} canceled`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer_email) {
          console.error(
            `Invoice ${invoice.id} has no customer email, cannot send payment success email`,
          )
          break
        }
        try {
          await sendEmail({
            to: invoice.customer_email,
            subject: 'Payment Successful',
            html: `<p>Dear customer,</p>
          <p>Thank you for your payment! Your subscription is now active. If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br/>The Team</p>`,
          })
        } catch (error) {
          console.error('Failed to send payment success email:', error)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer_email) {
          console.error(
            `Invoice ${invoice.id} has no customer email, cannot send payment failure email`,
          )
          break
        }
        try {
          await sendEmail({
            to: invoice.customer_email,
            subject: 'Payment Failed',
            html: `<p>Dear customer,</p>
            <p>We regret to inform you that your recent payment for the subscription has failed. Please update your payment information to avoid interruption of your service.</p>
            <p>Thank you for your understanding.</p>`,
          })
        } catch (error) {
          console.error('Failed to send payment failure email:', error)
        }

        break
      }
    }

    return json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

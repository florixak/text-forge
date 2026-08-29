import Stripe from 'stripe'
import { describe, expect, it } from 'vitest'
import {
  formatPeriodStartEnd,
  getSubscriptionItem,
  toSubscriptionStatus,
} from './stripe-utils'

describe('getSubscriptionItem', () => {
  it('should get the subscription item', () => {
    const subscription = {
      items: {
        data: [{ id: '123' }],
      },
    } as unknown as Stripe.Subscription
    const subscriptionItem = getSubscriptionItem(subscription)
    expect(subscriptionItem).toEqual({ id: '123' })
  })

  it('should throw if the subscription has no items', () => {
    const subscription = {
      id: 'sub_123',
      items: { data: [] },
    } as unknown as Stripe.Subscription
    expect(() => getSubscriptionItem(subscription)).toThrow(
      'Subscription sub_123 has no items',
    )
  })
})

describe('formatPeriodStartEnd', () => {
  it('should convert unix period timestamps to Dates', () => {
    const subscription = {
      id: 'sub_123',
      items: {
        data: [
          {
            current_period_start: 1_700_000_000,
            current_period_end: 1_700_086_400,
          },
        ],
      },
    } as unknown as Stripe.Subscription

    const result = formatPeriodStartEnd(subscription)

    expect(result.currentPeriodStart).toEqual(new Date(1_700_000_000 * 1000))
    expect(result.currentPeriodEnd).toEqual(new Date(1_700_086_400 * 1000))
  })
})

describe('toSubscriptionStatus', () => {
  it.each([
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
  ] as const)('returns %s unchanged', (status) => {
    expect(toSubscriptionStatus(status)).toBe(status)
  })

  it('defaults unknown statuses to incomplete', () => {
    expect(toSubscriptionStatus('not-a-status')).toBe('incomplete')
  })
})

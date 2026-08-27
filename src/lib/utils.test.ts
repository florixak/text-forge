import { describe, expect, it } from 'vitest'
import {
  formatBigNumber,
  formatPercentage,
  formatTokenLimit,
  getFileSize,
  validateAIServerFnInput,
} from './utils'
import type { PlanLimits } from '@/types'
import { PLAN_LIMITS } from '@/constants'

const plan = (overrides: Partial<PlanLimits> = {}): PlanLimits => ({
  ...PLAN_LIMITS.free,
  ...overrides,
})

describe('Utils', () => {
  describe('getFileSize', () => {
    it('returns the file size in B', () => {
      const result = getFileSize('A')
      expect(result).toBe('1 B')
    })

    it('returns the file size in KB', () => {
      const result = getFileSize('A'.repeat(1024))
      expect(result).toBe('1.00 KB')
    })

    it('returns the file size in MB', () => {
      const result = getFileSize('A'.repeat(1024 * 1024))
      expect(result).toBe('1.00 MB')
    })
  })

  describe('formatPercentage', () => {
    it('returns the percentage in the format 10.00%', () => {
      const result = formatPercentage(10.0)
      expect(result).toBe('10.00%')
    })

    it('returns the percentage in the format <0.01%', () => {
      const result = formatPercentage(0.005)
      expect(result).toBe('<0.01%')
    })

    it('returns the percentage in the format >99.99%', () => {
      const result = formatPercentage(99.995)
      expect(result).toBe('>99.99%')
    })

    it('returns the percentage in the format 0%', () => {
      const result = formatPercentage(0)
      expect(result).toBe('0%')
    })

    it('returns 0% for NaN and Infinity', () => {
      expect(formatPercentage(NaN)).toBe('0%')
      expect(formatPercentage(Infinity)).toBe('0%')
    })
  })

  describe('formatTokenLimit', () => {
    it('computes used, remaining, and percentage for normal usage', () => {
      const free = PLAN_LIMITS.free
      const result = formatTokenLimit(
        { total_tokens: 1000 },
        { total_tokens: 10000 },
        free,
      )

      expect(result.today).toEqual({
        used: 1000,
        limit: free.token_limit_day,
        remaining: free.token_limit_day - 1000,
        percentage: (1000 / free.token_limit_day) * 100,
      })
      expect(result.month).toEqual({
        used: 10000,
        limit: free.token_limit_month,
        remaining: free.token_limit_month - 10000,
        percentage: (10000 / free.token_limit_month) * 100,
      })
    })

    it('clamps remaining at 0 and percentage at 100 when usage exceeds the limit', () => {
      const free = PLAN_LIMITS.free
      const result = formatTokenLimit(
        { total_tokens: 999_999 },
        { total_tokens: 999_999 },
        free,
      )

      expect(result.today.remaining).toBe(0)
      expect(result.today.percentage).toBe(100)
      expect(result.today.used).toBe(999_999)
      expect(result.month.remaining).toBe(0)
      expect(result.month.percentage).toBe(100)
    })

    it('treats negative token counts as 0', () => {
      const result = formatTokenLimit(
        { total_tokens: -50 },
        { total_tokens: -10 },
        PLAN_LIMITS.free,
      )

      expect(result.today.used).toBe(0)
      expect(result.today.remaining).toBe(PLAN_LIMITS.free.token_limit_day)
      expect(result.today.percentage).toBe(0)
      expect(result.month.used).toBe(0)
      expect(result.month.remaining).toBe(PLAN_LIMITS.free.token_limit_month)
      expect(result.month.percentage).toBe(0)
    })

    it('returns 0 percentage when the plan limit is 0', () => {
      const result = formatTokenLimit(
        { total_tokens: 100 },
        { total_tokens: 100 },
        plan({ token_limit_day: 0, token_limit_month: 0 }),
      )

      expect(result.today.percentage).toBe(0)
      expect(result.today.remaining).toBe(0)
      expect(result.month.percentage).toBe(0)
      expect(result.month.remaining).toBe(0)
    })
  })

  describe('validateAIServerFnInput', () => {
    it('trims the input and returns the input if it is valid', () => {
      const result = validateAIServerFnInput({
        input: ' Hello, world!  \n\n',
        format: 'JSON',
      })
      expect(result).toEqual({ input: 'Hello, world!', format: 'JSON' })
    })

    it('throws when the input is only whitespace', () => {
      expect(() =>
        validateAIServerFnInput({ input: '   \n', format: 'JSON' }),
      ).toThrow('Input is required.')
    })

    it('throws for an unknown format', () => {
      expect(() =>
        validateAIServerFnInput({
          input: 'ok',
          format: 'not-a-format' as never,
        }),
      ).toThrow('Invalid output format.')
    })
  })

  describe('formatBigNumber', () => {
    it('returns the number in the format 10K', () => {
      const result = formatBigNumber(10000)
      expect(result).toBe('10.0K')
    })

    it('returns the number in the format 100K', () => {
      const result = formatBigNumber(100000)
      expect(result).toBe('100.0K')
    })

    it('returns the number in the format 1M', () => {
      const result = formatBigNumber(1000000)
      expect(result).toBe('1.0M')
    })

    it('returns the raw number below 10,000', () => {
      expect(formatBigNumber(9999)).toBe('9999')
    })
  })
})

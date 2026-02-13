import { and, eq, sql } from 'drizzle-orm'
import { aiMonthlyUsage, aiUsage, User } from './schema'
import { PLAN_LIMITS } from '@/constants'
import { db } from '.'
import { AIResult } from '@/lib/ai'
import { getCurrentMonthISO, getTodayISO } from '@/lib/utils'

interface ReserveQuotaResult {
  success?: boolean
  error?: string
}

export type AIFeature = 'assist_ai' | 'structure_ai' | 'generate_ai'

export const reserveQuota = async (
  userId: User['id'],
  plan: User['plan'],
  feature: AIFeature,
): Promise<ReserveQuotaResult> => {
  const today = getTodayISO()
  const month = getCurrentMonthISO()
  const userPlanLimit = PLAN_LIMITS[plan]

  const result = await db.transaction(async (tx) => {
    await tx
      .insert(aiUsage)
      .values({
        userId,
        day: today,
        total_tokens: 0,
        input_tokens: 0,
        output_tokens: 0,
        requests: 0,
        assist_ai: 0,
        structure_ai: 0,
        generate_ai: 0,
        words: 0,
      })
      .onConflictDoNothing()

    await tx
      .insert(aiMonthlyUsage)
      .values({
        userId: userId,
        month,
        total_tokens: 0,
        input_tokens: 0,
        output_tokens: 0,
        requests: 0,
        words: 0,
      })
      .onConflictDoNothing()

    const updateResult = await tx
      .update(aiUsage)
      .set({
        requests: sql`${aiUsage.requests} + 1`,
        [feature]: sql`${aiUsage[feature]} + 1`,
      })
      .where(
        and(
          eq(aiUsage.userId, userId),
          eq(aiUsage.day, today),
          sql`${aiUsage.requests} < ${userPlanLimit.requests_day}`,
          sql`${aiUsage.total_tokens} < ${userPlanLimit.token_limit_day}`,
        ),
      )

    if (!updateResult.rowCount || updateResult.rowCount === 0) {
      const [dailyUsage] = await tx
        .select()
        .from(aiUsage)
        .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, today)))
        .limit(1)

      if (!dailyUsage) {
        return { error: 'Failed to fetch usage data.' }
      }

      if (dailyUsage.requests >= userPlanLimit.requests_day) {
        return { error: 'Daily request limit reached.' }
      }

      if (dailyUsage.total_tokens >= userPlanLimit.token_limit_day) {
        return { error: 'Daily token limit reached.' }
      }

      return { error: 'Failed to reserve quota.' }
    }

    const [monthlyUsage] = await tx
      .select()
      .from(aiMonthlyUsage)
      .where(
        and(eq(aiMonthlyUsage.userId, userId), eq(aiMonthlyUsage.month, month)),
      )
      .limit(1)

    if (!monthlyUsage) {
      return { error: 'Failed to fetch monthly usage data.' }
    }

    if (
      !monthlyUsage ||
      monthlyUsage.total_tokens >= userPlanLimit.token_limit_month
    ) {
      await tx
        .update(aiUsage)
        .set({
          requests: sql`${aiUsage.requests} - 1`,
          [feature]: sql`${aiUsage[feature]} - 1`,
        })
        .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, today)))

      return {
        error: !monthlyUsage
          ? 'Failed to fetch monthly usage data.'
          : 'Monthly token limit reached. Upgrade your plan.',
      }
    }

    return { success: true }
  })

  return result
}

export const trackTokenUsage = async (
  userId: User['id'],
  aiResult: AIResult,
): Promise<void> => {
  const today = getTodayISO()
  const month = getCurrentMonthISO()

  await db.transaction(async (tx) => {
    const dailyResult = await tx
      .update(aiUsage)
      .set({
        output_tokens: sql`${aiUsage.output_tokens} + ${aiResult.usage?.outputTokens || 0}`,
        input_tokens: sql`${aiUsage.input_tokens} + ${aiResult.usage?.inputTokens || 0}`,
        total_tokens: sql`${aiUsage.total_tokens} + ${aiResult.usage?.totalTokens || 0}`,
      })
      .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, today)))

    const monthlyResult = await tx
      .update(aiMonthlyUsage)
      .set({
        output_tokens: sql`${aiMonthlyUsage.output_tokens} + ${aiResult.usage?.outputTokens || 0}`,
        input_tokens: sql`${aiMonthlyUsage.input_tokens} + ${aiResult.usage?.inputTokens || 0}`,
        total_tokens: sql`${aiMonthlyUsage.total_tokens} + ${aiResult.usage?.totalTokens || 0}`,
        requests: sql`${aiMonthlyUsage.requests} + 1`,
      })
      .where(
        and(eq(aiMonthlyUsage.userId, userId), eq(aiMonthlyUsage.month, month)),
      )

    if (!dailyResult.rowCount || dailyResult.rowCount === 0) {
      throw new Error('Failed to track daily token usage.')
    }

    if (!monthlyResult.rowCount || monthlyResult.rowCount === 0) {
      throw new Error('Failed to track monthly token usage.')
    }
  })
}

export const rollbackQuota = async (
  userId: User['id'],
  feature: AIFeature,
): Promise<{ success: boolean; error?: string }> => {
  const today = getTodayISO()

  const rollbackResult = await db
    .update(aiUsage)
    .set({
      requests: sql`GREATEST(0, ${aiUsage.requests} - 1)`,
      [feature]: sql`GREATEST(0, ${aiUsage[feature]} - 1)`,
    })
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, today)))

  if (!rollbackResult.rowCount || rollbackResult.rowCount === 0) {
    return { success: false, error: 'Failed to rollback quota.' }
  }

  return { success: true }
}

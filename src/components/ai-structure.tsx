import { OUTPUT_FORMATS, PLAN_LIMITS } from '@/constants'
import { db } from '@/db'
import { aiMonthlyUsage, aiUsage, historyUsage } from '@/db/schema'
import { authClient } from '@/lib/auth-client'
import { structureData } from '@/lib/openai-ai'
import { authMiddleware } from '@/lib/middleware'
import { validateAIServerFnInput } from '@/lib/utils'
import { OutputFormat } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import FormatSelect from './format-select'
import Output from './output'
import { TextareaWithCounter } from './textarea-with-counter'
import { Button } from './ui/button'
import { Label } from './ui/label'
import InlineError from './state/inline-error'

const structureTextFn = createServerFn({ method: 'POST' })
  .inputValidator(validateAIServerFnInput)
  .middleware([authMiddleware])
  .handler(
    async ({
      data,
      context,
    }): Promise<{
      success: boolean
      output: string
      error: string | null
      compression?: { ratio: number; strategy: string }
    }> => {
      const { input, format } = data
      const { session } = context

      if (!session) {
        throw redirect({ to: '/signin' })
      }

      try {
        const today = new Date().toISOString().split('T')[0]
        const userPlanLimit = PLAN_LIMITS[session.user.plan]

        if (!userPlanLimit) {
          return {
            output: '',
            success: false,
            error:
              'Your current plan does not support AI features. Please upgrade your plan to use this feature.',
          }
        }

        if (input.length > userPlanLimit.max_input_length) {
          return {
            output: '',
            success: false,
            error: `AI can handle up to ${userPlanLimit.max_input_length} characters. ${session.user.plan === 'free' ? 'Upgrade your plan for larger inputs.' : 'Please shorten your input.'}`,
          }
        }

        const quotaReserved = await db.transaction(async (tx) => {
          await tx
            .insert(aiUsage)
            .values({
              userId: session.user.id,
              day: today,
              assist_ai: 0,
              structure_ai: 0,
              generate_ai: 0,
              words: 0,
            })
            .onConflictDoNothing()

          await tx
            .insert(aiMonthlyUsage)
            .values({
              userId: session.user.id,
              month: today.slice(0, 7) + '-01',
              total_tokens: 0,
              input_tokens: 0,
              output_tokens: 0,
              requests: 0,
              words: 0,
            })
            .onConflictDoNothing()

          const [dailyUsage] = await tx
            .select()
            .from(aiUsage)
            .where(
              and(eq(aiUsage.userId, session.user.id), eq(aiUsage.day, today)),
            )
            .limit(1)

          const [monthlyUsage] = await tx
            .select()
            .from(aiMonthlyUsage)
            .where(
              and(
                eq(aiMonthlyUsage.userId, session.user.id),
                eq(aiMonthlyUsage.month, today.slice(0, 7) + '-01'),
              ),
            )
            .limit(1)

          if (
            !dailyUsage ||
            dailyUsage.requests >= userPlanLimit.requests_day
          ) {
            return { error: 'Daily request limit reached.' }
          }

          if (
            !dailyUsage ||
            dailyUsage.total_tokens >= userPlanLimit.token_limit_day
          ) {
            return { error: 'Daily token limit reached.' }
          }

          if (
            !monthlyUsage ||
            monthlyUsage.total_tokens >= userPlanLimit.token_limit_month
          ) {
            return { error: 'Monthly token limit reached.' }
          }

          const updateResult = await tx
            .update(aiUsage)
            .set({
              requests: sql`${aiUsage.requests} + 1`,
              structure_ai: sql`${aiUsage.structure_ai} + 1`,
            })
            .where(
              and(eq(aiUsage.userId, session.user.id), eq(aiUsage.day, today)),
            )

          if (!updateResult.rowCount || updateResult.rowCount === 0) {
            return { error: 'Failed to reserve quota.' }
          }

          return { success: true }
        })

        if (quotaReserved.error) {
          return {
            output: '',
            success: false,
            error: quotaReserved.error,
          }
        }

        if (!quotaReserved.success) {
          return {
            output: '',
            success: false,
            error:
              'You have reached your AI usage limit. Please upgrade your plan to continue using this feature.',
          }
        }
        try {
          const result = await structureData(input, format, session.user.plan)

          if (
            result.processing?.metadata.isCompressed &&
            process.env.NODE_ENV === 'development'
          ) {
            console.log(
              `[Token Opt] Compressed input: ${(result.processing.compressionRatio * 100).toFixed(1)}%`,
            )
          }

          await db.transaction(async (tx) => {
            await tx
              .update(aiUsage)
              .set({
                output_tokens: sql`${aiUsage.output_tokens} + ${result.usage?.outputTokens || 0}`,
                input_tokens: sql`${aiUsage.input_tokens} + ${result.usage?.inputTokens || 0}`,
                total_tokens: sql`${aiUsage.total_tokens} + ${result.usage?.totalTokens || 0}`,
              })
              .where(
                and(
                  eq(aiUsage.userId, session.user.id),
                  eq(aiUsage.day, today),
                ),
              )

            await tx
              .update(aiMonthlyUsage)
              .set({
                output_tokens: sql`${aiMonthlyUsage.output_tokens} + ${result.usage?.outputTokens || 0}`,
                input_tokens: sql`${aiMonthlyUsage.input_tokens} + ${result.usage?.inputTokens || 0}`,
                total_tokens: sql`${aiMonthlyUsage.total_tokens} + ${result.usage?.totalTokens || 0}`,
                requests: sql`${aiMonthlyUsage.requests} + 1`,
              })
              .where(
                and(
                  eq(aiMonthlyUsage.userId, session.user.id),
                  eq(aiMonthlyUsage.month, today.slice(0, 7) + '-01'),
                ),
              )
          })

          try {
            await db.insert(historyUsage).values({
              userId: session.user.id,
              action: 'structure',
              from: 'Text',
              to: format,
            })
          } catch (historyError) {}

          return {
            output: result.text,
            success: true,
            error: null,
            compression: result.processing
              ? {
                  ratio: result.processing.compressionRatio,
                  strategy: result.processing.metadata.strategy,
                }
              : undefined,
          }
        } catch (aiError) {
          await db
            .update(aiUsage)
            .set({
              requests: sql`${aiUsage.requests} - 1`,
              structure_ai: sql`${aiUsage.structure_ai} - 1`,
            })
            .where(
              and(eq(aiUsage.userId, session.user.id), eq(aiUsage.day, today)),
            )

          throw aiError
        }
      } catch (error) {
        return {
          output: '',
          success: false,
          error: 'AI structuring failed, please try again later.',
        }
      }
    },
  )

interface AIStructureProps {
  selectedFormat: OutputFormat
  setSelectedFormat: (format: OutputFormat) => void
}

const AIStructure = ({
  selectedFormat,
  setSelectedFormat,
}: AIStructureProps) => {
  const { data: session } = authClient.useSession()
  const [unstructuredData, setUnstructuredData] = useState('')

  const { data, isSuccess, isPending, mutate, isError } = useMutation({
    mutationFn: structureTextFn,
    onSuccess: ({ success, error }) => {
      if (success) {
        toast.success('Data structured successfully!')
      } else {
        toast.error(error || 'Failed to structure data. Please try again.')
      }
    },
    onError: () => {
      toast.error('Failed to structure data. Please try again.')
    },
  })

  const handleMutate = () => {
    if (!unstructuredData.trim()) {
      toast.error('Input cannot be empty.')
      return
    }
    mutate({
      data: {
        input: unstructuredData,
        format: selectedFormat,
      },
    })
  }

  return (
    <section className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="unstructured-input" className="text-sm font-medium">
            Enter your unstructured data
          </Label>
          <TextareaWithCounter
            id="unstructured-input"
            placeholder="Enter your unstructured data here..."
            value={unstructuredData}
            onChange={(e) => setUnstructuredData(e.target.value)}
            className="min-h-75 font-mono bg-card"
            maxLength={
              PLAN_LIMITS[session?.user.plan || 'free'].max_input_length
            }
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-0">
          <div className="w-full sm:w-fit">
            <Label
              htmlFor="output-format-select"
              className="mb-2 uppercase font-medium text-foreground text-sm"
            >
              Output Format
            </Label>
            <FormatSelect<OutputFormat>
              placeholder="Select Output Format"
              inputTypes={OUTPUT_FORMATS}
              id="output-format-select"
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              className="w-full sm:w-45"
            />
          </div>
          <Button
            onClick={handleMutate}
            disabled={isPending || unstructuredData.trim() === ''}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isPending ? 'Structuring...' : 'Structure Data'}
          </Button>
        </div>
      </div>
      {isSuccess && data && data.output.trim() !== '' ? (
        <Output
          input={unstructuredData}
          output={data.output}
          success={true}
          error={undefined}
        />
      ) : null}
      {isError && (
        <InlineError
          title="AI Structuring Failed"
          message="An error occurred while structuring your data. Please try again."
          onRetry={handleMutate}
        />
      )}
    </section>
  )
}

export default AIStructure

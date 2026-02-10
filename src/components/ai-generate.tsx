import { OUTPUT_FORMATS, PLAN_LIMITS } from '@/constants'
import { db } from '@/db'
import { aiUsage, historyUsage } from '@/db/schema'
import { authClient } from '@/lib/auth-client'
import { generateData } from '@/lib/google-ai'
import { authMiddleware } from '@/lib/middleware'
import { validateAIServerFnInput } from '@/lib/utils'
import { OutputFormat } from '@/types'
import { useMutation } from '@tanstack/react-query'
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

const generateDataFn = createServerFn({ method: 'POST' })
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
        return {
          output: '',
          success: false,
          error: 'User is not authenticated.',
        }
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

          const updateResult = await tx
            .update(aiUsage)
            .set({
              generate_ai: sql`${aiUsage.generate_ai} + 1`,
            })
            .where(
              and(
                eq(aiUsage.userId, session.user.id),
                eq(aiUsage.day, today),
                sql`${aiUsage.generate_ai} < ${userPlanLimit.generate_ai_day}`,
              ),
            )

          if (!updateResult.rowCount) {
            return false
          }

          return updateResult.rowCount > 0
        })

        if (!quotaReserved) {
          return {
            output: '',
            success: false,
            error:
              'You have reached your AI usage limit. Please upgrade your plan to continue using this feature.',
          }
        }

        try {
          const result = await generateData(input, format, session.user.plan)

          if (result.processing?.metadata.isCompressed) {
            console.log(
              `[Token Opt] Compressed input: ${(result.processing.compressionRatio * 100).toFixed(1)}%`,
            )
          }

          try {
            await db.insert(historyUsage).values({
              userId: session.user.id,
              action: 'generate',
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
              generate_ai: sql`${aiUsage.generate_ai} - 1`,
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
          error: 'AI generation failed, please try again later.',
        }
      }
    },
  )

interface AIGenerateProps {
  selectedFormat: OutputFormat
  setSelectedFormat: (format: OutputFormat) => void
}

const AIGenerate = ({ selectedFormat, setSelectedFormat }: AIGenerateProps) => {
  const { data: session } = authClient.useSession()
  const [input, setInput] = useState('')

  const { data, isSuccess, isPending, mutate } = useMutation({
    mutationFn: generateDataFn,
    onSuccess: ({ success, error }) => {
      if (success) {
        toast.success('Data generated successfully!')
      } else {
        toast.error(error || 'Failed to generate data. Please try again.')
      }
    },
    onError: () => {
      toast.error('Failed to generate data. Please try again.')
    },
  })

  const handleValueChange = (value: string) => {
    if (
      value.length > PLAN_LIMITS[session?.user.plan || 'free'].max_input_length
    ) {
      toast.error(
        `Input exceeds maximum length of ${PLAN_LIMITS[session?.user.plan || 'free'].max_input_length} characters for your plan.`,
      )
      return
    }
    setInput(value)
  }

  return (
    <section className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="data-description" className="text-sm font-medium">
            Describe the data you want to generate
          </Label>
          <TextareaWithCounter
            id="data-description"
            placeholder="Example: Generate a list of 10 fictional users with name, email, age, and city..."
            value={input}
            onChange={(e) => handleValueChange(e.target.value)}
            className="min-h-75 bg-card"
            maxLength={
              PLAN_LIMITS[session?.user.plan || 'free'].max_input_length
            }
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-0">
          <div className="w-full sm:w-fit">
            <Label
              htmlFor="output-type-select"
              className="mb-2 uppercase font-medium text-foreground text-sm"
            >
              Output Format
            </Label>
            <FormatSelect<OutputFormat>
              placeholder="Select Output Format"
              inputTypes={OUTPUT_FORMATS}
              id="output-type-select"
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              className="w-full sm:w-45"
            />
          </div>
          <Button
            onClick={() =>
              mutate({
                data: {
                  input,
                  format: selectedFormat,
                },
              })
            }
            disabled={!input.trim() || isPending}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isPending ? 'Generating...' : 'Generate Data'}
          </Button>
        </div>
      </div>
      {isSuccess && data && data.output.trim() !== '' ? (
        <Output
          input={input}
          output={data.output}
          success={true}
          error={undefined}
        />
      ) : null}
    </section>
  )
}

export default AIGenerate

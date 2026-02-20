import { OUTPUT_FORMATS, PLAN_LIMITS } from '@/constants'
import { db } from '@/db'
import { historyUsage } from '@/db/schema'
import { reserveQuota, rollbackQuota, trackTokenUsage } from '@/db/utils'
import { useOutput } from '@/hooks/use-output'
import { authClient } from '@/lib/auth-client'
import { authMiddleware } from '@/lib/middleware'
import { generateData } from '@/lib/openai-ai'
import { validateAIServerFnInput } from '@/lib/utils'
import { OutputFormat } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import FormatSelect from './format-select'
import Output from './output'
import OutputActions from './output-actions'
import InlineError from './state/inline-error'
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
        throw redirect({ to: '/signin' })
      }

      if (!session.user.emailVerified) {
        return {
          output: '',
          success: false,
          error: 'Please verify your email to use AI features.',
        }
      }

      const plan = session.user.plan || 'free'

      try {
        const userPlanLimit = PLAN_LIMITS[plan]

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
            error: `AI can handle up to ${userPlanLimit.max_input_length} characters. ${plan === 'free' ? 'Upgrade your plan for larger inputs.' : 'Please shorten your input.'}`,
          }
        }

        const quotaReserved = await reserveQuota(
          session.user.id,
          plan,
          'generate_ai',
        )

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
          const result = await generateData(input, format, plan)

          if (result.processing?.metadata.isCompressed && import.meta.env.DEV) {
            console.log(
              `[Token Opt] Compressed input: ${(result.processing.compressionRatio * 100).toFixed(1)}%`,
            )
          }
          try {
            await trackTokenUsage(session.user.id, result)
          } catch (trackingError) {
            if (import.meta.env.DEV) {
              console.error('Failed to track token usage:', trackingError)
            }
          }

          try {
            await db.insert(historyUsage).values({
              userId: session.user.id,
              action: 'generate',
              from: 'Text',
              to: format,
            })
          } catch (historyError) {
            if (import.meta.env.DEV) {
              console.error(
                'Failed to log ai generate history usage:',
                historyError,
              )
            }
          }

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
          const rollbackResult = await rollbackQuota(
            session.user.id,
            'generate_ai',
          )

          if (!rollbackResult.success) {
            if (import.meta.env.DEV) {
              console.error('Failed to rollback quota:', rollbackResult.error)
            }
          }

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
  const [capturedFormat, setCapturedFormat] =
    useState<OutputFormat>(selectedFormat)
  const { data, isSuccess, isPending, mutate, isError } = useMutation({
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
  const { copied, handleCopyOutput, handleDownloadOutput } = useOutput(
    data?.output || '',
    capturedFormat,
  )

  const handleMutate = () => {
    if (!input.trim()) {
      toast.error('Input cannot be empty.')
      return
    }
    const formatAtMutation = selectedFormat
    setCapturedFormat(formatAtMutation)
    mutate({
      data: {
        input,
        format: formatAtMutation,
      },
    })
  }

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
            onClick={handleMutate}
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
        <>
          <Output
            input={input}
            output={data.output}
            success={isSuccess}
            error={undefined}
          />
          <OutputActions
            handleCopy={handleCopyOutput}
            handleDownload={handleDownloadOutput}
            success={isSuccess}
            copied={copied}
          />
        </>
      ) : null}
      {isError && (
        <InlineError
          title="AI Generation Failed"
          message="An error occurred while generating your data. Please try again."
          onRetry={handleMutate}
        />
      )}
    </section>
  )
}

export default AIGenerate

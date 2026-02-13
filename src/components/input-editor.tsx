import { INPUT_FORMATS, OUTPUT_FORMATS, PLAN_LIMITS } from '@/constants'
import { db } from '@/db'
import { aiMonthlyUsage, aiUsage } from '@/db/schema'
import useDebounce from '@/hooks/use-debounce'
import { authClient } from '@/lib/auth-client'
import { assistText } from '@/lib/openai-ai'
import { authMiddleware } from '@/lib/middleware'
import { InputFormat, OutputFormat } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import FormatSelect from './format-select'
import InlineError from './state/inline-error'
import { TextareaWithCounter } from './textarea-with-counter'
import { Button } from './ui/button'
import { Label } from './ui/label'
import AssistOutput from './assist-output'

const aiAssistFn = createServerFn({
  method: 'POST',
})
  .middleware([authMiddleware])
  .inputValidator(
    (data: { input: string; fromType: InputFormat; toType: OutputFormat }) => {
      if (!OUTPUT_FORMATS.includes(data.toType)) {
        throw new Error('Invalid output format.')
      }
      if (!INPUT_FORMATS.includes(data.fromType)) {
        throw new Error('Invalid input format.')
      }
      const input = data.input.trim()
      if (input.length === 0) {
        throw new Error('Input is required.')
      }

      return { ...data, input }
    },
  )
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
      const { input, fromType, toType } = data
      const { session } = context
      const plan = session?.user?.plan || 'free'

      try {
        const today = new Date().toISOString().split('T')[0]
        const userPlanLimit = PLAN_LIMITS[plan]

        if (!userPlanLimit) {
          return {
            output: '',
            success: false,
            error: 'Plan does not support AI features.',
          }
        }

        if (input.length > userPlanLimit.max_input_length) {
          return {
            output: '',
            success: false,
            error: `AI can handle up to ${userPlanLimit.max_input_length} characters. ${
              plan === 'free'
                ? 'Upgrade your plan for larger inputs.'
                : 'Please shorten your input.'
            }`,
          }
        }

        const quotaReserved = await db.transaction(async (tx) => {
          await tx
            .insert(aiUsage)
            .values({
              userId: session.user.id,
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
              assist_ai: sql`${aiUsage.assist_ai} + 1`,
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
          const result = await assistText(input, fromType, toType, plan)

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
              assist_ai: sql`${aiUsage.assist_ai} - 1`,
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
          error: 'AI Assist failed. Please try again later.',
        }
      }
    },
  )

const checkInputType = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { input: string }) => data)
  .handler(
    async ({ data }): Promise<{ format: InputFormat; valid: boolean }> => {
      const { input } = data
      // Try JSON
      try {
        JSON.parse(input)
        return { format: 'JSON', valid: true }
      } catch {}

      if (
        /<\?xml[\s\S]*?\?>/.test(input) ||
        /<([a-z][\w-]*)(?:\s[^>]*)?\/?>/i.test(input)
      ) {
        return { format: 'XML', valid: true }
      }

      // Try YAML
      /*try {
      yaml.load(input)
      // Avoid false positives: YAML is a superset of JSON, so check for YAML-specific features
      if (/^---|:/.test(input)) {
        return { format: 'YAML', valid: true }
      }
    } catch {}*/

      // Markdown: headings, lists, code blocks
      if (
        /^\s{0,3}(#{1,6})\s.+/m.test(input) ||
        /^\s*[-*+]\s.+/m.test(input) ||
        /```[\s\S]*?```/m.test(input)
      ) {
        return { format: 'Markdown', valid: true }
      }

      // HTML: tag pattern
      if (
        /<([a-z][\w-]*)(?:\s[^>]*)?>[\s\S]*<\/\1>/i.test(input) ||
        input.trim().startsWith('<!DOCTYPE html')
      ) {
        return { format: 'HTML', valid: true }
      }

      // CSV: at least two lines with same number of commas
      const lines = input.split(/\r?\n/).filter(Boolean)
      if (lines.length > 1) {
        const commaCounts = lines.map((l) => (l.match(/,/g) || []).length)
        if (commaCounts.every((c) => c === commaCounts[0] && c > 0)) {
          return { format: 'CSV', valid: true }
        }
      }

      if (/^[\s\S]*$/.test(input) && input.trim().length > 0) {
        return { format: 'Text', valid: true }
      }

      // Fallback
      return { format: 'Auto-detect', valid: false }
    },
  )

interface InputEditorProps {
  input: string
  setInput: (input: string) => void
  fromType: InputFormat
  setFromType: (type: InputFormat) => void
  toType: OutputFormat
  setToType: (type: OutputFormat) => void
}

const InputEditor = ({
  input,
  setInput,
  fromType,
  setFromType,
  toType,
  setToType,
}: InputEditorProps) => {
  const { data } = authClient.useSession()

  const {
    data: assistData,
    mutate,
    isPending,
    isError,
  } = useMutation({
    mutationFn: aiAssistFn,
    onSuccess: ({ success, error }) => {
      if (success) {
        toast.success('AI Assist successful!')
      } else {
        toast.error(error || 'AI Assist failed. Please try again.')
      }
    },
    onError: (error) => {
      toast.error(error.message || 'AI Assist failed. Please try again.')
    },
  })

  useDebounce({
    value: input,
    delay: 500,
    onDebounce: (value: string) => {
      handleTypeCheck(value)
    },
  })

  const handleTypeCheck = async (value: string) => {
    if (fromType !== 'Auto-detect') return
    const { valid, format: detectedFormat } = await checkInputType({
      data: { input: value },
    })
    if (valid) {
      setFromType(detectedFormat)
    }
  }

  const handleValueChange = async (newValue: string) => {
    setInput(newValue)
  }

  const handleClear = () => {
    setInput('')
    setFromType('Auto-detect')
  }

  const handleMutate = () => {
    if (!input.trim()) {
      toast.error('Input cannot be empty.')
      return
    }
    mutate({
      data: {
        input,
        fromType,
        toType,
      },
    })
  }

  const loggedIn = data?.user !== null && data?.user !== undefined

  return (
    <section className="p-4 w-full max-w-160" aria-label="Input Editor">
      <h2 className="text-foreground font-bold text-lg">Input Editor</h2>
      <p className="text-muted-foreground">
        Paste your text or code to begin conversion.
      </p>
      <div className="flex items-center justify-between gap-4 mt-4 w-full">
        <div>
          <Label
            htmlFor="input-format-select"
            className="mb-2 uppercase font-medium text-foreground text-sm"
          >
            Input Format
          </Label>
          <FormatSelect<InputFormat>
            placeholder="Select Input Format"
            defaultValue={INPUT_FORMATS[0]}
            inputTypes={INPUT_FORMATS}
            id="input-format-select"
            selectedFormat={fromType}
            setSelectedFormat={setFromType}
          />
        </div>
        <ArrowRight className="text-muted-foreground" />
        <div>
          <Label
            htmlFor="output-format-select"
            className="mb-2 uppercase font-medium text-foreground text-sm"
          >
            Output Format
          </Label>
          <FormatSelect<OutputFormat>
            placeholder="Select Output Format"
            defaultValue={OUTPUT_FORMATS[0]}
            inputTypes={OUTPUT_FORMATS}
            id="output-format-select"
            selectedFormat={toType}
            setSelectedFormat={setToType}
          />
        </div>
      </div>
      <TextareaWithCounter
        id="input-textarea"
        value={input}
        onChange={(e) => handleValueChange(e.target.value)}
        maxLength={PLAN_LIMITS[data?.user?.plan || 'free'].max_input_length}
        placeholder="Enter your text or code here..."
        className="mt-4 h-120 w-full resize-none bg-card"
      />

      <div className="flex items-center justify-between mt-4 w-full">
        <div className="flex gap-2">
          {/*<Button>Convert</Button>*/}
          <Button variant="link" onClick={handleClear}>
            Clear
          </Button>
        </div>
        <div className="flex flex-row items-center gap-2">
          {!loggedIn && (
            <span className="text-sm text-muted-foreground">
              Sign in to use AI Assist
            </span>
          )}
          <Button
            variant="outline"
            disabled={!loggedIn || input.trim() === '' || isPending}
            onClick={handleMutate}
          >
            <Sparkles />
            AI Assist
          </Button>
        </div>
      </div>
      {isError && (
        <div className="mt-4">
          <InlineError
            title="AI Assist Failed"
            message="An error occurred while assisting with your data. Please try again."
            onRetry={handleMutate}
          />
        </div>
      )}
      {assistData?.output && (
        <div className="mt-6">
          <Label className="mb-2 uppercase font-medium text-foreground text-sm">
            AI Assist Output
          </Label>
          <AssistOutput output={assistData.output} onApply={setInput} />
        </div>
      )}
    </section>
  )
}

export default InputEditor

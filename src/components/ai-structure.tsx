import {
  MAX_INPUT_LENGTH,
  OutputFormat,
  outputFormats,
  planLimits,
} from '@/constants'
import { db } from '@/db'
import { aiUsage } from '@/db/schema'
import { structureData } from '@/lib/google-ai'
import { authMiddleware } from '@/lib/middleware'
import { useMutation } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import FormatSelect from './format-select'
import Output from './output'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

const structureTextFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { input: string; format: OutputFormat }) => {
    if (!outputFormats.includes(data.format)) {
      throw new Error('Invalid output format.')
    }
    const input = data.input.trim()
    if (input.length === 0) {
      throw new Error('Input is required.')
    }
    if (input.length > MAX_INPUT_LENGTH) {
      throw new Error(`Input exceeds ${MAX_INPUT_LENGTH} characters.`)
    }
    return { ...data, input }
  })
  .middleware([authMiddleware])
  .handler(
    async ({
      data,
      context,
    }): Promise<{ success: boolean; output: string; error: string | null }> => {
      const { input, format } = data
      const { session } = context

      if (!session) {
        throw redirect({ to: '/signin' })
      }

      try {
        const today = new Date().toISOString().split('T')[0]
        const userPlanLimit = planLimits[session.user.plan]

        if (!userPlanLimit) {
          return {
            output: '',
            success: false,
            error:
              'Your current plan does not support AI features. Please upgrade your plan to use this feature.',
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
              structure_ai: sql`${aiUsage.structure_ai} + 1`,
            })
            .where(
              and(
                eq(aiUsage.userId, session.user.id),
                eq(aiUsage.day, today),
                sql`${aiUsage.structure_ai} < ${userPlanLimit.structure_ai_day}`,
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
          const structuredOutput = await structureData(input, format)

          return { output: structuredOutput, success: true, error: null }
        } catch (aiError) {
          await db
            .update(aiUsage)
            .set({
              structure_ai: sql`${aiUsage.structure_ai} - 1`,
            })
            .where(
              and(eq(aiUsage.userId, session.user.id), eq(aiUsage.day, today)),
            )

          throw new Error(
            'AI structuring failed: ' + (aiError as Error).message,
          )
        }
      } catch (error) {
        return {
          output: '',
          success: false,
          error:
            (error as Error).message ||
            'An error occurred while structuring data.',
        }
      }
    },
  )

const AIStructure = () => {
  const [unstructuredData, setUnstructuredData] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>(
    outputFormats[0],
  )

  const { data, isSuccess, isPending, mutate } = useMutation({
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

  return (
    <section className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="unstructured-input" className="text-sm font-medium">
            Enter your unstructured data
          </Label>
          <Textarea
            id="unstructured-input"
            placeholder="Enter your unstructured data here..."
            value={unstructuredData}
            onChange={(e) => setUnstructuredData(e.target.value)}
            className="min-h-75 font-mono bg-card"
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
              defaultValue={outputFormats[0]}
              inputTypes={outputFormats}
              id="output-format-select"
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              className="w-full sm:w-45"
            />
          </div>
          <Button
            onClick={() =>
              mutate({
                data: { input: unstructuredData, format: selectedFormat },
              })
            }
            disabled={isPending || unstructuredData.trim() === ''}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Structure Data
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
    </section>
  )
}

export default AIStructure

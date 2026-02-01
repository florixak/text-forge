import { InputFormat, outputFormats, planLimits } from '@/constants'
import { db } from '@/db'
import { aiUsage } from '@/db/schema'
import { structureData } from '@/lib/google-ai'
import { authMiddleware } from '@/lib/middleware'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import FormatSelect from './format-select'
import Output from './output'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

const structureTextFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { input: string; format: InputFormat }) => data)
  .middleware([authMiddleware])
  .handler(
    async ({
      data,
      context,
    }): Promise<{ success: boolean; output: string; error: string | null }> => {
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
        const aiUsageRecord = await db
          .select()
          .from(aiUsage)
          .where(
            and(eq(aiUsage.userId, session.user.id), eq(aiUsage.day, today)),
          )
          .limit(1)

        const userPlanLimit = planLimits[session.user.plan]

        if (
          aiUsageRecord.length > 0 &&
          aiUsageRecord[0].structure_ai >= userPlanLimit.structure_ai_day
        ) {
          return {
            output: '',
            success: false,
            error:
              'You have reached your AI usage limit. Please upgrade your plan to continue using this feature.',
          }
        } else {
          if (!aiUsageRecord.length) {
            await db.insert(aiUsage).values({
              userId: session.user.id,
              day: today,
              assist_ai: 0,
              structure_ai: 0,
              generate_ai: 0,
              words: 0,
            })
          }
        }

        const structuredOutput = await structureData(input, format)

        const structureAIUsage =
          aiUsageRecord.length > 0 ? aiUsageRecord[0].structure_ai || 0 : 0

        await db
          .update(aiUsage)
          .set({
            structure_ai: structureAIUsage + 1,
          })
          .where(
            and(eq(aiUsage.userId, session.user.id), eq(aiUsage.day, today)),
          )

        return { output: structuredOutput, success: true, error: null }
      } catch (error: any) {
        return {
          output: '',
          success: false,
          error: error.message || 'An error occurred while structuring data.',
        }
      }
    },
  )

const AIStructure = () => {
  const [unstructuredData, setUnstructuredData] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<InputFormat>(
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
            <FormatSelect
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

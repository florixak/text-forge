import { InputFormat, outputFormats, planLimits } from '@/constants'
import { db } from '@/db'
import { aiUsage } from '@/db/schema'
import { generateData } from '@/lib/google-ai'
import { authMiddleware } from '@/lib/middleware'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import FormatSelect from './format-select'
import Output from './output'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { sql, eq, and } from 'drizzle-orm'

const generateDataFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { description: string; format: InputFormat }) => data)
  .middleware([authMiddleware])
  .handler(
    async ({
      data,
      context,
    }): Promise<{ success: boolean; output: string; error: string | null }> => {
      const { description, format } = data
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

        await db
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
          aiUsageRecord[0].generate_ai >= userPlanLimit.generate_ai_day
        ) {
          return {
            output: '',
            success: false,
            error:
              'You have reached your AI usage limit. Please upgrade your plan to continue using this feature.',
          }
        }
        const generatedOutput = await generateData(description, format)

        await db
          .update(aiUsage)
          .set({
            generate_ai: sql`${aiUsage.generate_ai} + 1`,
          })
          .where(
            and(eq(aiUsage.userId, session.user.id), eq(aiUsage.day, today)),
          )

        return {
          output: generatedOutput,
          success: true,
          error: null,
        }
      } catch (error) {
        return {
          output: '',
          success: false,
          error: (error as Error).message,
        }
      }
    },
  )

const AIGenerate = () => {
  const [description, setDescription] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<InputFormat>(
    outputFormats[0],
  )

  const { data, isSuccess, isPending, mutate } = useMutation({
    mutationFn: generateDataFn,
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
          <Label htmlFor="data-description" className="text-sm font-medium">
            Describe the data you want to generate
          </Label>
          <Textarea
            id="data-description"
            placeholder="Example: Generate a list of 10 fictional users with name, email, age, and city..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-75 bg-card"
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
            <FormatSelect
              placeholder="Select Output Format"
              defaultValue={outputFormats[0]}
              inputTypes={outputFormats}
              id="output-type-select"
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              className="w-full sm:w-45"
            />
          </div>
          <Button
            onClick={() =>
              mutate({ data: { description, format: selectedFormat } })
            }
            disabled={!description.trim() || isPending}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Data
          </Button>
        </div>
      </div>
      {isSuccess && data && data.output.trim() !== '' ? (
        <Output
          input={description}
          output={data.output}
          success={true}
          error={undefined}
        />
      ) : null}
    </section>
  )
}

export default AIGenerate

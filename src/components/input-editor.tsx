import {
  InputFormat,
  inputFormats,
  outputFormats,
  planLimits,
} from '@/constants'
import useDebounce from '@/hooks/useDebounce'
import { authClient } from '@/lib/auth-client'
import { createServerFn } from '@tanstack/react-start'
import { ArrowRight, Sparkles } from 'lucide-react'
import FormatSelect from './format-select'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { assistText } from '@/lib/google-ai'
import { useMutation } from '@tanstack/react-query'
import { aiUsage } from '@/db/schema'
import { db } from '@/db'
import { authOptionalMiddleware } from '@/lib/middleware'
import { eq, and, sql } from 'drizzle-orm'

const aiAssistFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    (data: { input: string; fromType: InputFormat; toType: InputFormat }) =>
      data,
  )
  .middleware([authOptionalMiddleware])
  .handler(
    async ({
      data,
      context,
    }): Promise<{ success: boolean; output: string; error: string | null }> => {
      const { input, fromType, toType } = data
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
          aiUsageRecord[0].assist_ai >= userPlanLimit.assist_ai_day
        ) {
          return {
            output: '',
            success: false,
            error:
              'You have reached your AI usage limit. Please upgrade your plan to continue using this feature.',
          }
        }

        const assistedOutput = await assistText(input, fromType, toType)

        await db
          .update(aiUsage)
          .set({
            assist_ai: sql`${aiUsage.assist_ai} + 1`,
          })
          .where(
            and(eq(aiUsage.userId, session.user.id), eq(aiUsage.day, today)),
          )

        return {
          output: assistedOutput,
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
  toType: InputFormat
  setToType: (type: InputFormat) => void
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

  const { mutate, isPending } = useMutation({
    mutationFn: aiAssistFn,
    onSuccess: ({ success, output, error }) => {
      if (success) {
        setInput(output)
      } else {
        console.error('AI Assist Error:', error)
      }
    },
    onError: (error) => {
      console.error('AI Assist Mutation Error:', error)
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
      setFromType(detectedFormat as InputFormat)
    }
  }

  const handleValueChange = async (newValue: string) => {
    setInput(newValue)
  }

  const handleClear = () => {
    setInput('')
    setFromType('Auto-detect')
  }

  const loggedIn = data?.user !== null && data?.user !== undefined

  return (
    <section className="p-4 w-full">
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
          <FormatSelect
            placeholder="Select Input Format"
            defaultValue={inputFormats[0]}
            inputTypes={inputFormats}
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
          <FormatSelect
            placeholder="Select Output Format"
            defaultValue={outputFormats[0]}
            inputTypes={outputFormats}
            id="output-format-select"
            selectedFormat={toType}
            setSelectedFormat={setToType}
          />
        </div>
      </div>
      <Textarea
        id="input-textarea"
        placeholder="Enter your text or code here..."
        className="mt-4 h-120 w-full resize-none bg-card"
        value={input}
        onChange={(e) => handleValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault()
            const textarea = e.target as HTMLTextAreaElement
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newValue =
              input.substring(0, start) + '\t' + input.substring(end)
            handleValueChange(newValue)

            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + 1
            }, 0)
          }
        }}
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
            onClick={() => mutate({ data: { input, fromType, toType } })}
          >
            <Sparkles />
            AI Assist
          </Button>
        </div>
      </div>
    </section>
  )
}

export default InputEditor

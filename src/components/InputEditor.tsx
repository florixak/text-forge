import { InputType, inputTypes, outputTypes } from '@/constants'
import { createServerFn } from '@tanstack/react-start'
import { ArrowRight, Sparkles } from 'lucide-react'
import TypeSelect from './TypeSelect'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import useDebounce from '@/hooks/useDebounce'

const checkInputType = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { input: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<{ type: (typeof inputTypes)[number]; valid: boolean }> => {
      const { input } = data
      // Try JSON
      try {
        JSON.parse(input)
        return { type: 'JSON', valid: true }
      } catch {}

      if (
        /<\?xml[\s\S]*?\?>/.test(input) ||
        /<([a-z][\w-]*)(?:\s[^>]*)?\/?>/i.test(input)
      ) {
        return { type: 'XML', valid: true }
      }

      // Try YAML
      /*try {
      yaml.load(input)
      // Avoid false positives: YAML is a superset of JSON, so check for YAML-specific features
      if (/^---|:/.test(input)) {
        return { type: 'YAML', valid: true }
      }
    } catch {}*/

      // Markdown: headings, lists, code blocks
      if (
        /^\s{0,3}(#{1,6})\s.+/m.test(input) ||
        /^\s*[-*+]\s.+/m.test(input) ||
        /```[\s\S]*?```/m.test(input)
      ) {
        return { type: 'Markdown', valid: true }
      }

      // HTML: tag pattern
      if (
        /<([a-z][\w-]*)(?:\s[^>]*)?>[\s\S]*<\/\1>/i.test(input) ||
        input.trim().startsWith('<!DOCTYPE html')
      ) {
        return { type: 'HTML', valid: true }
      }

      // CSV: at least two lines with same number of commas
      const lines = input.split(/\r?\n/).filter(Boolean)
      if (lines.length > 1) {
        const commaCounts = lines.map((l) => (l.match(/,/g) || []).length)
        if (commaCounts.every((c) => c === commaCounts[0] && c > 0)) {
          return { type: 'CSV', valid: true }
        }
      }

      if (/^[\s\S]*$/.test(input) && input.trim().length > 0) {
        return { type: 'Text', valid: true }
      }

      // Fallback
      return { type: 'Auto-detect', valid: false }
    },
  )

interface InputEditorProps {
  input: string
  setInput: (input: string) => void
  fromType: InputType
  setFromType: (type: InputType) => void
  toType: InputType
  setToType: (type: InputType) => void
}

const InputEditor = ({
  input,
  setInput,
  fromType,
  setFromType,
  toType,
  setToType,
}: InputEditorProps) => {
  const { debouncedValue } = useDebounce({
    value: input,
    delay: 500,
    onDebounce: () => {
      handleTypeCheck()
    },
  })
  const handleTypeCheck = async () => {
    if (fromType !== 'Auto-detect') return
    const { valid, type: detectedType } = await checkInputType({
      data: { input: debouncedValue },
    })
    if (valid) {
      setFromType(detectedType as InputType)
    }
  }

  const handleValueChange = async (newValue: string) => {
    setInput(newValue)
  }

  const handleClear = () => {
    setInput('')
    setFromType('Auto-detect')
  }

  return (
    <section className="p-4 w-full">
      <h2 className="text-foreground font-bold text-lg">Input Editor</h2>
      <p className="text-muted-foreground">
        Paste your text or code to begin conversion.
      </p>
      <div className="flex items-center justify-between gap-4 mt-4 w-full">
        <div>
          <Label
            htmlFor="input-type-select"
            className="mb-2 uppercase font-medium text-foreground text-sm"
          >
            Input Type
          </Label>
          <TypeSelect
            placeholder="Select Input Type"
            defaultValue={inputTypes[0]}
            inputTypes={inputTypes}
            id="input-type-select"
            selectedType={fromType}
            setSelectedType={setFromType}
          />
        </div>
        <ArrowRight className="text-muted-foreground" />
        <div>
          <Label
            htmlFor="output-type-select"
            className="mb-2 uppercase font-medium text-foreground text-sm"
          >
            Output Type
          </Label>
          <TypeSelect
            placeholder="Select Output Type"
            defaultValue={outputTypes[0]}
            inputTypes={outputTypes}
            id="output-type-select"
            selectedType={toType}
            setSelectedType={setToType}
          />
        </div>
      </div>
      <Textarea
        id="input-textarea"
        placeholder="Enter your text or code here..."
        className="mt-4 h-120 w-full resize-none"
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
          <Button>Convert</Button>
          <Button variant="link" onClick={handleClear}>
            Clear
          </Button>
        </div>

        <Button variant="outline">
          <Sparkles />
          AI Assist
        </Button>
      </div>
    </section>
  )
}

export default InputEditor

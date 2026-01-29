import { InputFormat, outputFormats } from '@/constants'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import Output from './output'
import FormatSelect from './format-select'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { createServerFn } from '@tanstack/react-start'
import { structureData } from '@/lib/google-ai'
import { toast } from 'sonner'

const structureTextFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { input: string; format: InputFormat }) => data)
  .handler(
    async ({
      data,
    }): Promise<{ success: boolean; output: string; error: string | null }> => {
      const { input, format } = data

      try {
        const structuredOutput = await structureData(input, format)

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
  const [structuredData, setStructuredData] = useState('')

  const handleStructure = async () => {
    try {
      const result = await structureTextFn({
        data: { input: unstructuredData, format: selectedFormat },
      })

      if (result.success) {
        setStructuredData(result.output)
        toast.success('Data structured successfully!')
      } else {
        toast.error(
          result.error || 'Failed to structure data. Please try again.',
        )
      }
    } catch (error) {
      toast.error('Failed to structure data. Please try again.')
    }
  }

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
            onClick={handleStructure}
            disabled={!unstructuredData.trim()}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Structure Data
          </Button>
        </div>
      </div>
      {structuredData && structuredData.trim() !== '' ? (
        <Output
          input={unstructuredData}
          output={structuredData}
          success={true}
          error={undefined}
        />
      ) : null}
    </section>
  )
}

export default AIStructure

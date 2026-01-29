'use client'

import { InputFormat, outputFormats } from '@/constants'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import Output from './output'
import FormatSelect from './format-select'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

const AIGenerate = () => {
  const [description, setDescription] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<InputFormat>(
    outputFormats[0],
  )

  const handleGenerate = () => {
    // TODO: Implement generation logic
    console.log('Generating data...')
    console.log('Description:', description)
    console.log('Format:', selectedFormat)
  }

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
            onClick={handleGenerate}
            disabled={!description.trim()}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Data
          </Button>
        </div>
      </div>
      {
        // TODO: Display generated structured data conditionally
        <Output
          input={description}
          output={''}
          success={false}
          error={undefined}
        />
      }
    </section>
  )
}

export default AIGenerate

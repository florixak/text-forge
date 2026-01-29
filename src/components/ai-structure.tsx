'use client'

import { InputType, outputTypes } from '@/constants'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import Output from './output'
import FormatSelect from './format-select'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

const AIStructure = () => {
  const [unstructuredData, setUnstructuredData] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<InputType>(
    outputTypes[0],
  )

  const handleGenerate = () => {
    // TODO: Implement generation logic
    console.log('Generating structured data...')
    console.log('Input:', unstructuredData)
    console.log('Format:', selectedFormat)
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
              htmlFor="output-type-select"
              className="mb-2 uppercase font-medium text-foreground text-sm"
            >
              Output Format
            </Label>
            <FormatSelect
              placeholder="Select Output Type"
              defaultValue={outputTypes[0]}
              inputTypes={outputTypes}
              id="output-type-select"
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              className="w-full sm:w-45"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!unstructuredData.trim()}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Structure Data
          </Button>
        </div>
      </div>
      {
        // TODO: Display generated structured data conditionally
        <Output
          input={unstructuredData}
          output={''}
          success={false}
          error={undefined}
        />
      }
    </section>
  )
}

export default AIStructure

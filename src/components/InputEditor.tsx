import { inputTypes, outputTypes } from '@/constants'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import TypeSelect from './TypeSelect'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

const InputEditor = () => {
  const [value, setValue] = useState<string>('')

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
  }

  const handleClear = () => {
    setValue('')
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
          />
        </div>
      </div>
      <Textarea
        id="input-textarea"
        placeholder="Enter your text or code here..."
        className="mt-4 min-h-120 w-full resize-none"
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <div>
          <Button className="mt-4">Convert</Button>
          <Button variant="link" className="mt-4 ml-4" onClick={handleClear}>
            Clear
          </Button>
        </div>

        <Button variant="outline" className="mt-4 ml-4">
          <Sparkles />
          AI Assist
        </Button>
      </div>
    </section>
  )
}

export default InputEditor

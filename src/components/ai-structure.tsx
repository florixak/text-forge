'use client'

import { InputType, inputTypes } from '@/constants'
import { getFileSize } from '@/lib/utils'
import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import TypeSelect from './type-select'
import { Button } from './ui/button'

interface AIStructureState {
  input: string
  outputType: InputType
  isLoading: boolean
  output: string | null
  error: string | null
  copied: boolean
}

const AIStructure = () => {
  const [state, setState] = useState<AIStructureState>({
    input: '',
    outputType: 'JSON',
    isLoading: false,
    output: null,
    error: null,
    copied: false,
  })

  const handleInputChange = (value: string) => {
    setState((prevState) => ({
      ...prevState,
      input: value,
    }))
  }

  const fileSize = getFileSize(state.output || '')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Editor */}

        <div>
          <pre className="mt-4 h-130 marble-gradient rounded-t-md overflow-y-auto">
            <div className="p-4 font-mono text-sm whitespace-pre-wrap">
              <code>
                {state.error
                  ? state.error
                  : state.output
                    ? state.output
                    : state.input}
              </code>
            </div>
          </pre>
          <div className="bg-muted/30 w-full h-10 rounded-b-md border p-2 flex items-center gap-2">
            <div className="text-sm text-muted-foreground font-medium ml-auto">
              {fileSize}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 min-w-0">
            <label className="text-sm font-medium mb-2 block">
              Output Format
            </label>
            <TypeSelect
              inputTypes={inputTypes}
              selectedType={state.outputType}
            />
          </div>
          <Button
            disabled={state.isLoading || !state.input.trim()}
            size="lg"
            className="w-full sm:w-auto"
          >
            {state.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Structuring...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Structure
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AIStructure

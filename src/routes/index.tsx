import InputEditor from '@/components/input-editor'
import OutputPreview from '@/components/output-preview'
import {
  InputFormat,
  inputFormats,
  OutputFormat,
  outputFormats,
} from '@/constants'
import useDebounce from '@/hooks/useDebounce'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod'

const indexSchema = z
  .object({
    from: z.enum(inputFormats).default('Auto-detect').catch('Auto-detect'),
    to: z.enum(outputFormats).default('JSON').catch('JSON'),
  })
  .catch({ from: 'Auto-detect', to: 'JSON' })

export const Route = createFileRoute('/')({
  component: App,
  validateSearch: indexSchema,
  errorComponent: () => <div>Failed to load the app.</div>,
  pendingComponent: () => <div>Loading the app...</div>,
})

function App() {
  const navigate = Route.useNavigate()
  const { from: fromType, to: toType } = Route.useSearch()
  const [value, setValue] = useState<string>('')
  const { debouncedValue } = useDebounce({
    value: value,
    delay: 500,
  })

  const handleFromTypeChange = (newFromType: InputFormat) => {
    navigate({
      search: (prev) => ({
        ...prev,
        from: newFromType,
      }),
    })
  }

  const handleToTypeChange = (newToType: OutputFormat) => {
    navigate({
      search: (prev) => ({
        ...prev,
        to: newToType,
      }),
    })
  }

  return (
    <main className="min-h-screen container mx-auto mt-8 bg-background">
      <div className="flex md:flex-row flex-col gap-4 w-full">
        <InputEditor
          input={value}
          setInput={setValue}
          fromType={fromType}
          setFromType={handleFromTypeChange}
          toType={toType}
          setToType={handleToTypeChange}
        />
        <OutputPreview
          fromType={fromType}
          toType={toType}
          inputText={debouncedValue}
        />
      </div>
    </main>
  )
}

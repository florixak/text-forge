import InputEditor from '@/components/input-editor'
import OutputPreview from '@/components/output-preview'

import LoadingIndicator from '@/components/state/loading-indicator'
import { INPUT_FORMATS, LOCAL_STORAGE_KEYS, OUTPUT_FORMATS } from '@/constants'
import useDebounce from '@/hooks/use-debounce'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { getMetadata } from '@/lib/metadata'
import { ConvertLocalStorageData, InputFormat, OutputFormat } from '@/types'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod'

const indexSchema = z
  .object({
    from: z.enum(INPUT_FORMATS).default('Auto-detect').catch('Auto-detect'),
    to: z.enum(OUTPUT_FORMATS).default('JSON').catch('JSON'),
  })
  .catch({ from: 'Auto-detect', to: 'JSON' })

export const Route = createFileRoute('/')({
  component: App,
  validateSearch: indexSchema,
  pendingComponent: () => <LoadingIndicator />,
  head: () => getMetadata('/'),
})

function App() {
  const { setItem, getItem } = useLocalStorage<ConvertLocalStorageData>(
    LOCAL_STORAGE_KEYS.convert,
  )
  const navigate = Route.useNavigate()
  const { from: fromType, to: toType } = Route.useSearch()
  const [value, setValue] = useState<string>(
    typeof window !== 'undefined' ? getItem()?.input || '' : '',
  )
  const { debouncedValue } = useDebounce({
    value: value,
    delay: 500,
    onDebounce: (debouncedInput) => {
      setItem({
        input: debouncedInput || '',
        output: getItem()?.output || '',
        inputFormat: fromType,
        outputFormat: toType,
        aiAssistTip: getItem()?.aiAssistTip || '',
      })
    },
  })

  const handleSaveAssistTip = (tip: string) => {
    setItem({
      input: getItem()?.input || '',
      output: getItem()?.output || '',
      inputFormat: fromType,
      outputFormat: toType,
      aiAssistTip: tip,
    })
  }

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
          onAssistTipGenerated={handleSaveAssistTip}
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

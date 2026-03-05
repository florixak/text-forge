import InputEditor from '@/components/input-editor'
import OutputPreview from '@/components/output-preview'

import LoadingIndicator from '@/components/state/loading-indicator'
import { INPUT_FORMATS, LOCAL_STORAGE_KEYS, OUTPUT_FORMATS } from '@/constants'
import { usePersistentStorage } from '@/hooks/use-persistent-storage'
import { getMetadata } from '@/lib/metadata'
import { ConvertLocalStorageData, InputFormat, OutputFormat } from '@/types'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useEffectEvent, useState } from 'react'
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
  const navigate = Route.useNavigate()
  const { from: fromType, to: toType } = Route.useSearch()

  const {
    data: persistedData,
    updateData,
    debouncedData,
  } = usePersistentStorage<ConvertLocalStorageData>({
    key: LOCAL_STORAGE_KEYS.convert,
    initialData: {
      input: '',
      output: '',
      inputFormat: fromType,
      outputFormat: toType,
      aiAssistTip: '',
    },
  })

  const [value, setValue] = useState<string>(persistedData.input || '')

  const updateDataEffect = useEffectEvent(
    (updates: Partial<ConvertLocalStorageData>) => {
      updateData(updates)
    },
  )

  useEffect(() => {
    updateDataEffect({ input: value })
  }, [value])

  useEffect(() => {
    updateDataEffect({ inputFormat: fromType, outputFormat: toType })
  }, [fromType, toType])

  const handleSaveAssistTip = (tip: string) => {
    updateData({ aiAssistTip: tip })
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
          inputText={debouncedData.input}
        />
      </div>
    </main>
  )
}

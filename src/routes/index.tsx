import InputEditor from '@/components/input-editor'
import OutputPreview from '@/components/output-preview'

import LoadingIndicator from '@/components/state/loading-indicator'
import { INPUT_FORMATS, OUTPUT_FORMATS } from '@/constants'
import useDebounce from '@/hooks/use-debounce'
import { useLocalStorage } from '@/hooks/use-local-storage'
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
  const { setItem, getItem } =
    useLocalStorage<ConvertLocalStorageData>('convert-data')
  const navigate = Route.useNavigate()
  const { from: fromType, to: toType } = Route.useSearch()
  const [value, setValue] = useState<string>(
    typeof window !== 'undefined' ? getItem()?.input || '' : '',
  )
  const { debouncedValue } = useDebounce({
    value: value,
    delay: 500,
  })

  const onUpdate = useEffectEvent(
    (inputFormat: InputFormat, outputFormat: OutputFormat, input: string) => {
      setItem({
        input: input,
        output: getItem()?.output || '',
        inputFormat: inputFormat,
        outputFormat: outputFormat,
      })
    },
  )

  useEffect(() => {
    onUpdate(fromType, toType, debouncedValue)
  }, [fromType, toType, debouncedValue])

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

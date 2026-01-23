import InputEditor from '@/components/InputEditor'
import OutputPreview from '@/components/OutputPreview'
import { InputType } from '@/constants'
import useDebounce from '@/hooks/useDebounce'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [fromType, setFromType] = useState<InputType>('Auto-detect')
  const [toType, setToType] = useState<InputType>('JSON')
  const [value, setValue] = useState<string>('')
  const { debouncedValue } = useDebounce({
    value: value,
    delay: 500,
  })

  return (
    <main className="min-h-screen container mx-auto mt-8">
      <div className="flex md:flex-row flex-col gap-4 w-full">
        <InputEditor
          input={value}
          setInput={setValue}
          fromType={fromType}
          setFromType={setFromType}
          toType={toType}
          setToType={setToType}
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

import InputEditor from '@/components/InputEditor'
import OutputPreview from '@/components/OutputPreview'
import { InputType } from '@/constants'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [type, setType] = useState<InputType>('Auto-detect')
  const [value, setValue] = useState<string>('')

  return (
    <main className="min-h-screen container mx-auto mt-8">
      <div className="flex md:flex-row flex-col gap-4 w-full">
        <InputEditor
          input={value}
          setInput={setValue}
          selectedType={type}
          setSelectedType={setType}
        />
        <OutputPreview type={type} formattedOutput={value} />
      </div>
    </main>
  )
}

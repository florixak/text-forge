import InputEditor from '@/components/InputEditor'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="min-h-screen container mx-auto mt-8">
      <div className="flex md:flex-row flex-col gap-4 w-full">
        <InputEditor />
        <InputEditor />
      </div>
    </main>
  )
}

import { InputType } from '@/constants'
import { Button } from './ui/button'
import { Dot } from 'lucide-react'

interface PreviewOutputProps {
  type: InputType
  formattedOutput: string
}

const OutputPreview = ({ type, formattedOutput }: PreviewOutputProps) => {
  return (
    <section className="p-4 w-full" aria-label="Preview Output">
      <h2 className="text-foreground font-bold text-lg">Output Preview</h2>
      <p className="text-muted-foreground">
        Paste your text or code to begin conversion.
      </p>

      <pre className="relative mt-4 min-h-140 marble-gradient rounded-md overflow-x-auto">
        <div className="p-4 font-mono text-sm whitespace-pre-wrap">
          <code>{formattedOutput}</code>
        </div>
        <div className="absolute bg-muted/30 w-full h-10 rounded-b-md bottom-0 p-2 flex items-center gap-2">
          <div className="text-sm text-foreground font-medium flex items-center">
            <Dot className="text-green-400 -mr-4" size={48} /> LIVE
          </div>
        </div>
      </pre>
      <div className="flex justify-end mt-4">
        <Button>Download Output</Button>
      </div>
    </section>
  )
}

export default OutputPreview

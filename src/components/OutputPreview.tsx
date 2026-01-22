import { InputType } from '@/constants'
import useCopy from '@/hooks/useCopy'
import { convertData } from '@/lib/converters'
import { downloadFile } from '@/lib/download'
import { getFileSize } from '@/lib/utils'
import { Dot } from 'lucide-react'
import { Button } from './ui/button'

interface PreviewOutputProps {
  fromType: InputType
  toType: InputType
  inputText: string
}

const OutputPreview = ({ fromType, toType, inputText }: PreviewOutputProps) => {
  const { copied, handleCopy } = useCopy()
  const { success, error, output } = convertData(inputText, fromType, toType)

  const handleDownload = () => {
    downloadFile(output || '', toType)
  }

  const fileSize = getFileSize(output || '')

  return (
    <section className="p-4 w-full" aria-label="Preview Output">
      <h2 className="text-foreground font-bold text-lg">Output Preview</h2>
      <p className="text-muted-foreground">
        Paste your text or code to begin conversion.
      </p>
      <div>
        <pre className="mt-4 h-130 marble-gradient rounded-t-md overflow-y-auto">
          <div className="p-4 font-mono text-sm whitespace-pre-wrap">
            <code>{error ? error : success ? output : inputText}</code>
          </div>
        </pre>
        <div className="bg-muted/30 w-full h-10 rounded-b-md border p-2 flex items-center gap-2">
          <div className="text-sm text-foreground font-medium flex items-center">
            <Dot className="text-green-400 -mr-2" size={48} /> LIVE
          </div>

          <div className="text-sm text-muted-foreground font-medium ml-auto">
            {fileSize}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-4 gap-2">
        <Button
          variant="outline"
          onClick={() => handleCopy(output || '')}
          disabled={!output}
        >
          {copied ? 'Copied!' : 'Copy Output'}
        </Button>
        <Button variant="outline" onClick={handleDownload} disabled={!output}>
          Download Output
        </Button>
      </div>
    </section>
  )
}

export default OutputPreview

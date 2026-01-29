import { InputFormat } from '@/constants'
import useCopy from '@/hooks/useCopy'
import { convertData } from '@/lib/converters'
import { downloadFile } from '@/lib/download'
import { getFileSize } from '@/lib/utils'
import { Dot } from 'lucide-react'
import { Button } from './ui/button'
import Output from './output'

interface PreviewOutputProps {
  fromType: InputFormat
  toType: InputFormat
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
        <Output
          input={inputText}
          output={output || ''}
          success={success}
          error={error}
        />
        <div className="bg-muted/30 w-full h-10 rounded-b-md border p-2 flex items-center gap-2">
          <div className="text-sm text-foreground font-medium flex items-center">
            <Dot
              className={`${success ? 'text-green-400' : 'text-red-400'} -mr-2`}
              size={48}
            />{' '}
            LIVE PREVIEW
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
          disabled={!success}
        >
          {copied ? 'Copied!' : 'Copy Output'}
        </Button>
        <Button variant="outline" onClick={handleDownload} disabled={!success}>
          Download Output
        </Button>
      </div>
    </section>
  )
}

export default OutputPreview

import { db } from '@/db'
import { historyUsage } from '@/db/schema'
import useCopy from '@/hooks/use-copy'
import { convertData } from '@/lib/converters'
import { downloadFile } from '@/lib/download'
import { authOptionalMiddleware } from '@/lib/middleware'
import { getFileSize } from '@/lib/utils'
import { InputFormat, OutputFormat } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { Dot } from 'lucide-react'
import Output from './output'
import OutputActions from './output-actions'

interface PreviewOutputProps {
  fromType: InputFormat
  toType: OutputFormat
  inputText: string
}

const saveConversionHistory = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { from: InputFormat; to: OutputFormat }) => data)
  .middleware([authOptionalMiddleware])
  .handler(async ({ data, context }) => {
    const { from, to } = data
    const { session } = context

    if (!session) {
      return
    }

    try {
      await db.insert(historyUsage).values({
        userId: session.user.id,
        action: 'convert',
        from,
        to,
      })
    } catch (error) {}
  })

const OutputPreview = ({ fromType, toType, inputText }: PreviewOutputProps) => {
  const { copied, handleCopy } = useCopy()
  const { mutate } = useMutation({
    mutationFn: saveConversionHistory,
  })

  const { success, error, output } = convertData(inputText, fromType, toType)

  const handleCopyWithHistory = async (): Promise<boolean> => {
    const isCopied = await handleCopy(output || '')
    if (success && output && isCopied) {
      mutate({ data: { from: fromType, to: toType } })
    }
    return isCopied
  }

  const handleDownloadWithHistory = () => {
    const isDownloaded = downloadFile(output || '', toType)
    if (success && output && isDownloaded) {
      mutate({ data: { from: fromType, to: toType } })
    }
  }

  const fileSize = getFileSize(output || '')

  return (
    <section className="p-4 w-full max-w-160" aria-label="Preview Output">
      <h2 className="text-foreground font-bold text-lg">Output Preview</h2>
      <p className="text-muted-foreground">
        Paste your text or code to begin conversion.
      </p>
      <div className="mt-4 w-full">
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

      <OutputActions
        handleCopy={handleCopyWithHistory}
        handleDownload={handleDownloadWithHistory}
        success={success}
        copied={copied}
      />
    </section>
  )
}

export default OutputPreview

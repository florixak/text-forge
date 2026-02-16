import { OutputFormat } from '@/types'
import useCopy from './use-copy'
import { downloadFile } from '@/lib/download'

export const useOutput = (output: string, selectedFormat: OutputFormat) => {
  const { copied, handleCopy } = useCopy()

  const handleCopyOutput = async (): Promise<boolean> => {
    const isCopied = await handleCopy(output || '')
    return isCopied
  }

  const handleDownloadOutput = (): boolean => {
    const isDownloaded = downloadFile(output || '', selectedFormat)
    return isDownloaded
  }
  return {
    handleCopyOutput,
    handleDownloadOutput,
    copied,
  }
}

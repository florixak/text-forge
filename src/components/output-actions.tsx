import { Button } from './ui/button'

interface OutputActionsProps {
  handleCopy: () => Promise<boolean>
  handleDownload: () => void
  success: boolean
  copied: boolean
}

const OutputActions = ({
  handleCopy,
  handleDownload,
  success,
  copied,
}: OutputActionsProps) => {
  return (
    <div className="flex items-center justify-end mt-4 gap-2">
      <Button variant="outline" onClick={handleCopy} disabled={!success}>
        {copied ? 'Copied!' : 'Copy Output'}
      </Button>
      <Button variant="outline" onClick={handleDownload} disabled={!success}>
        Download Output
      </Button>
    </div>
  )
}

export default OutputActions

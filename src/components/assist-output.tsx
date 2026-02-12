import useCopy from '@/hooks/use-copy'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface AssistOutputProps {
  output: string
  onApply?: (output: string) => void
}

const AssistOutput = ({ output, onApply }: AssistOutputProps) => {
  const { copied, handleCopy } = useCopy()

  const handleCopyClick = async () => {
    await handleCopy(output)
  }

  return (
    <Card className="w-full">
      <CardContent>
        <div className="flex justify-end gap-2 mb-2">
          <Button size="sm" variant="outline" onClick={handleCopyClick}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          {onApply && (
            <Button size="sm" onClick={() => onApply(output)}>
              Apply
            </Button>
          )}
        </div>
        <pre className="whitespace-pre-wrap wrap-break-word">{output}</pre>
      </CardContent>
    </Card>
  )
}

export default AssistOutput

import useCopy from '@/hooks/use-copy'
import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface AssistOutputProps {
  output: string
  onApply?: (output: string) => void
  isPartial?: boolean
}

const AssistOutput = ({
  output,
  onApply,
  isPartial = false,
}: AssistOutputProps) => {
  const { copied, handleCopy } = useCopy()

  const handleCopyClick = async () => {
    await handleCopy(output)
  }

  return (
    <Card className="w-full">
      <CardContent>
        {isPartial ? (
          <p className="text-sm text-muted-foreground mb-2">
            Input was too long to fully transform. This is a corrected sample
            for reference only.{' '}
            <Link
              to="/plans"
              search={{ plan: 'pro' }}
              className="underline underline-offset-2"
            >
              Upgrade
            </Link>{' '}
            for larger inputs.
          </p>
        ) : null}
        <div className="flex justify-end gap-2 mb-2">
          <Button size="sm" variant="outline" onClick={handleCopyClick}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          {onApply ? (
            <Button size="sm" onClick={() => onApply(output)}>
              Apply
            </Button>
          ) : null}
        </div>
        <pre className="whitespace-pre-wrap wrap-break-word">{output}</pre>
      </CardContent>
    </Card>
  )
}

export default AssistOutput

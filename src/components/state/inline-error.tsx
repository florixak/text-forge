import { CircleAlert, RotateCcw, X } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'

interface InlineErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'default' | 'compact'
}

const InlineError = ({
  title = 'An error occurred',
  message = 'An unexpected error occurred. Please try again later.',
  onRetry,
  onDismiss,
  variant = 'default',
}: InlineErrorProps) => {
  const isCompact = variant === 'compact'

  return (
    <Card
      className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 w-full p-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <CircleAlert
          className="text-red-600 dark:text-red-500 shrink-0"
          size={isCompact ? 18 : 20}
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
            {title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {message}
          </p>

          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400"
            >
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          )}
        </div>

        {onDismiss && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="icon"
            className="shrink-0 size-8 text-red-600 hover:text-red-700 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}

export default InlineError

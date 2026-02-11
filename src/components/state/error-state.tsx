import { CircleAlert } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { useNavigate } from '@tanstack/react-router'

const ErrorState = ({ reset }: { error?: Error; reset?: () => void }) => {
  const navigate = useNavigate()

  const handleTryAgain = () => {
    if (reset) {
      reset()
    } else {
      window.location.reload()
    }
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate({ to: '/' })
    }
  }

  return (
    <section className="min-h-screen flex-col max-w-4xl mx-auto p-4 mt-8">
      <Card className="text-center p-8 flex-center w-full">
        <div className="bg-red-100/90 flex-center p-4 rounded-full shadow-md">
          <CircleAlert className="text-red-600" size={48} />
        </div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          We encountered an unexpected error while loading the app. This could
          be due to a temporary issue or a problem with the app itself. Please
          try refreshing the page, and if the problem persists, feel free to
          report it to us.
        </p>
        <div className="flex-center gap-4 mt-4">
          <Button onClick={handleTryAgain}>Try Again</Button>
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default ErrorState

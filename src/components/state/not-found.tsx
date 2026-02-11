import { Button } from '../ui/button'
import { Card } from '../ui/card'

const NotFound = () => {
  const handleGoBack = () => {
    window.history.back()
  }
  return (
    <section className="min-h-screen flex-col max-w-4xl mx-auto p-4 mt-8">
      <Card className="text-center p-8 flex-center w-full">
        <div className="bg-primary/90 flex-center p-4 rounded-full shadow-md">
          <span className="text-white text-4xl font-bold">404</span>
        </div>
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for does not exist. It might have been moved
          or deleted. Please check the URL or return to the previous page.
        </p>
        <div className="flex-center gap-4 mt-4">
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default NotFound

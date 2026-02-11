import LoadingIndicator from '@/components/state/loading-indicator'
import { LoginForm } from '@/components/login-form'
import { guestMiddleware } from '@/lib/middleware'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signin')({
  component: RouteComponent,
  server: {
    middleware: [guestMiddleware],
  },
  pendingComponent: () => <LoadingIndicator />,
})

function RouteComponent() {
  return (
    <section className="min-h-screen bg-background flex items-center justify-center max-w-md mx-auto p-4">
      <LoginForm />
    </section>
  )
}

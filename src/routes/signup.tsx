import LoadingIndicator from '@/components/state/loading-indicator'
import { SignUpForm } from '@/components/signup-form'
import { guestMiddleware } from '@/lib/middleware'
import { getMetadata } from '@/lib/metadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
  server: {
    middleware: [guestMiddleware],
  },
  pendingComponent: () => <LoadingIndicator />,
  head: () => getMetadata('/signup'),
})

function RouteComponent() {
  return (
    <section className="min-h-screen flex-center max-w-md mx-auto">
      <SignUpForm />
    </section>
  )
}

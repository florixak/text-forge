import { SignUpForm } from '@/components/signup-form'
import { guestMiddleware } from '@/lib/middleware'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
  server: {
    middleware: [guestMiddleware],
  },
})

function RouteComponent() {
  return (
    <section className="min-h-screen flex items-center justify-center max-w-md mx-auto p-4">
      <SignUpForm />
    </section>
  )
}

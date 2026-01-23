import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { authMiddleware } from '@/lib/middleware'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/signin', replace: true })
        },
      },
    })
  }
  return (
    <section>
      <Button onClick={handleLogout}>Logout</Button>
    </section>
  )
}

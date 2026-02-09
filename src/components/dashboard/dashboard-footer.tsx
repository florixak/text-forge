import { authClient } from '@/lib/auth-client'
import { Button } from '../ui/button'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

const DashboardFooter = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: '/signin', replace: true })
          },
        },
      })
    } catch {
      toast.error('Failed to log out. Please try again.')
      navigate({ to: '/signin', replace: true })
    }
  }
  return (
    <div className="w-full flex justify-end">
      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  )
}

export default DashboardFooter

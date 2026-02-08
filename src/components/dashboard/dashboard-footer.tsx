import { authClient } from '@/lib/auth-client'
import { Button } from '../ui/button'
import { useNavigate } from '@tanstack/react-router'

const DashboardFooter = () => {
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
    <div className="w-full flex justify-end">
      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  )
}

export default DashboardFooter

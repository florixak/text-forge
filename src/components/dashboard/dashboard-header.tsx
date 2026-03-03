import { capitalizeFirstLetter } from '@/lib/utils'
import { Link, useNavigate } from '@tanstack/react-router'
import { BadgeAlert, Star, Verified } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import TokenUsageCard from './token-usage-card'
import type { DashboardData } from '@/types'
import NotVerifiedCard from './not-verified-card'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

interface DashboardHeaderProps {
  data: DashboardData
}

const DashboardHeader = ({ data: { user, usage } }: DashboardHeaderProps) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/signin', replace: true })
        },
        onError: () => {
          toast.error('Failed to logout. Please try again.')
        },
      },
    })
  }

  return (
    <>
      <div className="w-full flex justify-between items-end">
        <div className="text-left w-full">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            Hi, {user?.name}{' '}
            {user?.emailVerified ? (
              <Verified
                className="inline text-green-500"
                aria-label="Verified"
              />
            ) : (
              <BadgeAlert
                className="inline text-red-500"
                aria-label="Not Verified"
              />
            )}
          </h2>
          <p>Manage your account and AI usage</p>
        </div>
        <div className="w-full flex justify-end">
          <Button variant="destructive" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
      {!user?.emailVerified ? <NotVerifiedCard /> : null}
      <div className="flex flex-wrap gap-4 w-full">
        <Card className="p-4 md:max-w-xs w-full">
          <div className="flex items-center justify-between">
            <div className="bg-primary/10 p-2 rounded-md">
              <Star className="text-primary" />
            </div>
            <Button
              size="sm"
              nativeButton={false}
              render={
                <Link to="/plans" search={{ plan: user.plan }}>
                  {user.plan === 'free' ? 'Upgrade' : 'Manage'}
                </Link>
              }
            />
          </div>
          <div className="flex flex-col">
            <h4 className="text-lg font-bold">
              {capitalizeFirstLetter(user.plan)}
            </h4>
            <p className="text-sm text-muted-foreground">Current Plan</p>
          </div>
        </Card>
        <TokenUsageCard usage={usage} />
      </div>
    </>
  )
}

export default DashboardHeader

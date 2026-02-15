import { capitalizeFirstLetter } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { BadgeAlert, Star, Verified } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import TokenUsageCard from './token-usage-card'
import type { DashboardData } from '@/types'
import NotVerifiedCard from './not-verified-card'

interface DashboardHeaderProps {
  data: DashboardData
}

const DashboardHeader = ({ data: { user, usage } }: DashboardHeaderProps) => {
  return (
    <>
      <div className="text-left">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          Hi, {user?.name}{' '}
          {user?.emailVerified ? (
            <Verified className="inline text-green-500" aria-label="Verified" />
          ) : (
            <BadgeAlert
              className="inline text-red-500"
              aria-label="Not Verified"
            />
          )}
        </h2>
        <p>Manage your account and AI usage</p>
      </div>
      {!user?.emailVerified ? <NotVerifiedCard /> : null}
      <div className="flex flex-wrap gap-4 w-full">
        <Card className="p-4 md:max-w-xs w-full">
          <div className="flex items-center justify-between">
            <div className="bg-primary/10 p-2 rounded-md">
              <Star className="text-primary" />
            </div>
            <Button size="sm" asChild>
              <Link to="/plans" search={{ plan: user.plan }}>
                {user.plan === 'free' ? 'Upgrade' : 'Manage'}
              </Link>
            </Button>
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

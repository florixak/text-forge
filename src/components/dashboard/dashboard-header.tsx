import { capitalizeFirstLetter } from '@/lib/utils'
import { DashboardData } from '@/routes/dashboard'
import { Link } from '@tanstack/react-router'
import {
  ShieldAlert,
  ShieldCheck,
  ShieldClose,
  Sparkles,
  Star,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface DashboardHeaderProps {
  data: DashboardData
}

const DashboardHeader = ({ data: { user, usage } }: DashboardHeaderProps) => {
  return (
    <>
      <div className="text-left">
        <h2 className="text-3xl font-bold mb-2">Hi, {user?.name}</h2>
        <p>Manage your account and AI usage</p>
      </div>
      <div className="flex flex-wrap gap-4 w-full">
        <Card className="p-4 flex-1">
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
        <Card className="p-4 flex-1">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-md">
              <Sparkles className="text-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold">
                {usage.assist.used} / {usage.assist.limit} used
              </h4>
              <span className="text-xs">
                {Math.round(usage.assist.percentage)}%
              </span>
            </div>

            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-primary"
                style={{ width: `${Math.min(usage.assist.percentage, 100)}%` }}
              ></div>
            </div>

            <p className="text-sm text-muted-foreground">Resets at midnight</p>
          </div>
        </Card>
        <Card className="p-4 flex-1">
          <div className="flex items-center">
            <div className={`bg-primary/10 p-2 rounded-md`}>
              {user.enabled ? (
                user.emailVerified ? (
                  <ShieldCheck className="text-green-400" />
                ) : (
                  <ShieldAlert className="text-yellow-400" />
                )
              ) : (
                <ShieldClose className="text-red-400" />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <h4 className="text-lg font-bold">
              {user.enabled
                ? user.emailVerified
                  ? 'Active'
                  : 'Unverified'
                : 'Disabled'}
            </h4>
            <p className="text-sm text-muted-foreground">Account Status</p>
          </div>
        </Card>
      </div>
    </>
  )
}

export default DashboardHeader

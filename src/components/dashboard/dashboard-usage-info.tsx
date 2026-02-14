import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Separator } from '../ui/separator'
import { formatBigNumber, formatPercentage } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Progress } from '../ui/progress'
import type { DashboardData } from '@/types'

interface DashboardUsageInfoProps {
  data: DashboardData
}

const DashboardUsageInfo = ({
  data: { user, usage, featureUsages },
}: DashboardUsageInfoProps) => {
  return (
    <Card className="w-full pb-0">
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Usage Info</h3>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h5>Daily Token Usage</h5>
            <p className="text-sm text-muted-foreground">
              {formatBigNumber(usage.today.used)} /{' '}
              {formatBigNumber(usage.today.limit)} tokens used today
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Progress
              value={usage.today.percentage}
              max={100}
              className="w-40"
            />

            <span className="text-muted-foreground text-sm">
              {formatPercentage(usage.today.percentage)} used
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Monthly Token Usage</h5>
            <p className="text-sm text-muted-foreground">
              {formatBigNumber(usage.month.used)} /{' '}
              {formatBigNumber(usage.month.limit)} tokens used this month
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Progress
              value={usage.month.percentage}
              max={100}
              className="w-40"
            />
            <span className="text-muted-foreground text-sm">
              {formatPercentage(usage.month.percentage)} used
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Assist AI Usage</h5>
            <span className="text-xs text-muted-foreground">total</span>
          </div>
          <p className="text-sm">{featureUsages.assist_ai} calls</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Structure AI Usage</h5>
            <span className="text-xs text-muted-foreground">total</span>
          </div>
          <p className="text-sm">{featureUsages.structure_ai} calls</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Generate AI Usage</h5>
            <span className="text-xs text-muted-foreground">total</span>
          </div>
          <p className="text-sm">{featureUsages.generate_ai} calls</p>
        </div>
      </CardContent>
      <CardFooter className="bg-border/50 flex flex-col items-center p-4">
        <p className="text-sm">
          Need more tokens?{' '}
          <Link
            to="/plans"
            search={{ plan: user.plan }}
            className="text-primary font-semibold"
          >
            Upgrade your plan
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default DashboardUsageInfo

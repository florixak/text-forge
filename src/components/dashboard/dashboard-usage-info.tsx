import { DashboardData } from '@/routes/dashboard'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Separator } from '../ui/separator'
import { formatBigNumber, formatPercentage } from '@/lib/utils'

interface DashboardUsageInfoProps {
  data: DashboardData
}

const DashboardUsageInfo = ({
  data: { usage, featureUsages },
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
            <div className="w-40 bg-gray-200 rounded-full overflow-hidden h-2">
              <div
                className="h-2 bg-primary"
                aria-valuemax={100}
                aria-valuenow={usage.today.percentage}
                aria-valuemin={0}
                role="progressbar"
                style={{ width: `${usage.today.percentage}%` }}
              />
            </div>
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
            <div className="w-40 bg-gray-200 rounded-full overflow-hidden h-2">
              <div
                className="h-2 bg-primary"
                aria-valuemax={100}
                aria-valuenow={usage.month.percentage}
                aria-valuemin={0}
                role="progressbar"
                style={{ width: `${usage.month.percentage}%` }}
              />
            </div>
            <span className="text-muted-foreground text-sm">
              {formatPercentage(usage.month.percentage)} used
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Assist AI Usage</h5>
            <span className="text-xs text-muted-foreground">this month</span>
          </div>
          <p className="text-sm">{featureUsages.assist_ai} calls</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Structure AI Usage</h5>
            <span className="text-xs text-muted-foreground">this month</span>
          </div>
          <p className="text-sm">{featureUsages.structure_ai} calls</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Generate AI Usage</h5>
            <span className="text-xs text-muted-foreground">this month</span>
          </div>
          <p className="text-sm">{featureUsages.generate_ai} calls</p>
        </div>
      </CardContent>
      <CardFooter className="bg-border/50 flex flex-col items-center p-4">
        <p className="text-sm">
          Need more tokens?{' '}
          <a href="/plans" className="text-primary font-semibold">
            Upgrade your plan
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}

export default DashboardUsageInfo

import { DashboardData } from '@/routes/dashboard'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Separator } from '../ui/separator'

interface DashboardUsageInfoProps {
  data: DashboardData
}

const DashboardUsageInfo = ({
  data: { user, usage },
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
              {usage.today.used} / {usage.today.limit} tokens used today
            </p>
          </div>
          <div className="w-40 bg-gray-200 rounded-full overflow-hidden h-2">
            <div
              className="h-2 bg-primary"
              style={{ width: `${usage.today.percentage}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Monthly Token Usage</h5>
            <p className="text-sm text-muted-foreground">
              {usage.month.used} / {usage.month.limit} tokens used this month
            </p>
          </div>
          <div className="w-40 bg-gray-200 rounded-full overflow-hidden h-2">
            <div
              className="h-2 bg-primary"
              style={{ width: `${usage.month.percentage}%` }}
            />
          </div>
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

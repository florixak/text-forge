import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Separator } from '../ui/separator'
import { DashboardData } from '@/routes/dashboard'

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
        <Link to="/history" className="text-primary">
          View History
        </Link>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h5>Daily AI Assist</h5>
            <p className="text-sm text-muted-foreground">
              Standard for {user.plan} tier users
            </p>
          </div>
          <p className="font-semibold text-base">
            {usage.assist.used} / {usage.assist.limit} Assists
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Daily AI Structuring</h5>
            <p className="text-sm text-muted-foreground">
              Standard for {user.plan} tier users
            </p>
          </div>
          <p className="font-semibold text-base">
            {usage.structure.used} / {usage.structure.limit} Structurings
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Daily AI Generations</h5>
            <p className="text-sm text-muted-foreground">
              Standard for {user.plan} tier users
            </p>
          </div>
          <p className="font-semibold text-base">
            {usage.generate.used} / {usage.generate.limit} Generations
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Words Processed Today</h5>
            <p className="text-sm text-muted-foreground">
              Total words processed so far today
            </p>
          </div>
          <p className="font-semibold text-base">{usage.words} words</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5>Last Used</h5>
            <p className="text-sm text-muted-foreground">
              Your most recent AI generation
            </p>
          </div>
          <p className="font-semibold text-base">
            {usage.last_used ? `${usage.last_used} hours ago` : 'Never'}
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-border/50 flex flex-col items-center p-4">
        <p className="text-sm">
          Need more power?{' '}
          <Link
            to="/plans"
            search={{ plan: user.plan }}
            className="text-primary font-semibold"
          >
            Compare all plans
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default DashboardUsageInfo

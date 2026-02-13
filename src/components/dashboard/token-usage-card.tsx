import { Sparkles } from 'lucide-react'
import { Card } from '../ui/card'
import { DashboardUsage } from '@/routes/dashboard'
import { formatBigNumber } from '@/lib/utils'

interface TokenUsageCardProps {
  usage: DashboardUsage
}

const TokenUsageCard = ({ usage }: TokenUsageCardProps) => {
  return (
    <Card className="p-4 flex-1 flex">
      <div className="flex items-center mb-2">
        <div className="bg-primary/10 p-2 rounded-md">
          <Sparkles className="text-primary" />
        </div>
        <span className="ml-2 text-lg font-bold">Token Usage</span>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <TokenStat
          label="Daily Tokens"
          used={usage.today.used}
          limit={usage.today.limit}
          percentage={usage.today.percentage}
          resetType="daily"
        />
        <TokenStat
          label="Monthly Tokens"
          used={usage.month.used}
          limit={usage.month.limit}
          percentage={usage.month.percentage}
          resetType="monthly"
        />
      </div>
    </Card>
  )
}

const getTimeUntilReset = (type: 'daily' | 'monthly'): string => {
  const now = new Date()
  let nextReset: Date

  if (type === 'daily') {
    nextReset = new Date(now)
    nextReset.setHours(24, 0, 0, 0)
  } else {
    nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0)
  }

  const ms = nextReset.getTime() - now.getTime()
  const totalMinutes = Math.floor(ms / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60

  return `${days}d ${hours}h ${String(minutes).padStart(2, '0')}m`
}

const TokenStat = ({
  label,
  used,
  limit,
  percentage,
  resetType,
}: {
  label: string
  used: number
  limit: number
  percentage: number
  resetType: 'daily' | 'monthly'
}) => {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold uppercase text-muted-foreground">
          {label}
        </span>
        {formatBigNumber(used)} / {formatBigNumber(limit)}
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className="h-2 bg-primary"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <span className="text-sm text-muted-foreground text-right">
        resets in {getTimeUntilReset(resetType)}
      </span>
    </div>
  )
}

export default TokenUsageCard

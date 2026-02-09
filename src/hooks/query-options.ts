import { QUERY_KEYS } from '@/constants'
import { getTodayUsage } from '@/routes/dashboard'
import { getUserHistoryFn } from '@/routes/history'
import { getUserPlan } from '@/routes/plans'
import { ActionType } from '@/types'
import { queryOptions } from '@tanstack/react-query'

export const createUsageQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.usageToday,
    queryFn: getTodayUsage,
  })

export const createHistoryQueryOptions = ({
  day,
  action,
}: {
  day?: string
  action?: ActionType
}) =>
  queryOptions({
    queryKey: QUERY_KEYS.history(day, action),
    queryFn: async () => {
      return await getUserHistoryFn({ data: { day, action } })
    },
  })

export const createPlanQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.userPlan,
    queryFn: getUserPlan,
  })

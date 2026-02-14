import { PLAN_LIMITS } from '@/constants'
import { Route } from '@/routes/history'
import type { HistoryItem as HistoryItemType } from '@/types'
import HistoryItem from './history-item'
import { Button } from '../ui/button'

interface HistoryListProps {
  history: HistoryItemType[]
  paging?: {
    page: number
    count: number
    total: number
  }
}

const HistoryList = ({ history, paging }: HistoryListProps) => {
  const navigate = Route.useNavigate()
  return (
    <div className="flex flex-col w-full gap-4">
      {history.map((item) => (
        <HistoryItem key={item.id} {...item} />
      ))}
      {history.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          No history items found for the selected filters.
        </div>
      )}
      {history.length >= PLAN_LIMITS.free.history_limit && (
        <div className="text-center text-sm text-muted-foreground py-4">
          You have reached the maximum number of history items for your plan. To
          access more history, please consider upgrading your plan.
        </div>
      )}
      {paging && paging.total > paging.count && (
        <div className="flex justify-center mt-4 gap-4 items-center flex-col">
          <span className="text-sm text-muted-foreground">
            Page {paging.page} of {Math.ceil(paging.total / paging.count)}
          </span>
          <div className="flex">
            {Array.from({ length: Math.ceil(paging.total / paging.count) }).map(
              (_, i) => (
                <Button
                  key={i}
                  className={`mx-1 px-3 py-1 rounded ${
                    paging.page === i + 1
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => {
                    navigate({ search: { page: String(i + 1) } })
                  }}
                >
                  {i + 1}
                </Button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryList

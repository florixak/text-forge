import { Route } from '@/routes/history'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { ActionType } from '@/types'
import { Input } from '../ui/input'
import { formatLocalDate } from '@/lib/utils'

const HistoryFilter = () => {
  const navigate = Route.useNavigate()
  const { action, day } = Route.useSearch()

  const today = formatLocalDate(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = formatLocalDate(yesterdayDate)

  const handleActionClick = (newAction: ActionType | undefined) => {
    navigate({ search: (prev) => ({ ...prev, action: newAction }) })
  }

  const handleDayChange = (newDay: string | undefined) => {
    navigate({ search: (prev) => ({ ...prev, day: newDay }) })
  }

  return (
    <Card className="w-full flex flex-row items-center gap-2 p-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={action ? 'outline' : 'default'}
          onClick={() => handleActionClick(undefined)}
        >
          All
        </Button>
        <Button
          variant={action === 'convert' ? 'default' : 'outline'}
          onClick={() => handleActionClick('convert')}
        >
          Convert
        </Button>
        <Button
          variant={action === 'structure' ? 'default' : 'outline'}
          onClick={() => handleActionClick('structure')}
        >
          Structure
        </Button>
        <Button
          variant={action === 'generate' ? 'default' : 'outline'}
          onClick={() => handleActionClick('generate')}
        >
          Generate
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <Button
          variant={day ? 'outline' : 'default'}
          onClick={() => handleDayChange(undefined)}
        >
          Any day
        </Button>
        <Button
          variant={day === today ? 'default' : 'outline'}
          onClick={() => handleDayChange(today)}
        >
          Today
        </Button>
        <Button
          variant={day === yesterday ? 'default' : 'outline'}
          onClick={() => handleDayChange(yesterday)}
        >
          Yesterday
        </Button>
        <Input
          type="date"
          value={day ?? ''}
          onChange={(event) => handleDayChange(event.target.value || undefined)}
          className="w-auto"
          aria-label="Filter by date"
        />
      </div>
    </Card>
  )
}

export default HistoryFilter

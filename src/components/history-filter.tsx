import { Route } from '@/routes/history'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ActionType } from '@/types'

const HistoryFilter = () => {
  const navigate = Route.useNavigate()
  const { action, day } = Route.useSearch()

  const handleFilterClick = (newAction: ActionType | undefined) => {
    navigate({ search: (prev) => ({ ...prev, action: newAction }) })
  }

  return (
    <Card className="w-full flex flex-row items-center gap-2 p-2">
      <Button
        variant={action ? 'outline' : 'default'}
        onClick={() => handleFilterClick(undefined)}
      >
        All
      </Button>
      <Button
        variant={action === 'convert' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('convert')}
      >
        Convert
      </Button>
      <Button
        variant={action === 'structure' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('structure')}
      >
        Structure
      </Button>
      <Button
        variant={action === 'generate' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('generate')}
      >
        Generate
      </Button>
    </Card>
  )
}

export default HistoryFilter

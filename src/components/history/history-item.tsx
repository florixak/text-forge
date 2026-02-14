import type { ActionType, HistoryItem as HistoryItemType } from '@/types'
import { Card } from '../ui/card'
import { capitalizeFirstLetter } from '@/lib/utils'
import { Bolt, Bot, RefreshCcw, WandSparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { useNavigate } from '@tanstack/react-router'

const getActionIcon = (action: ActionType) => {
  switch (action) {
    case 'convert':
      return <RefreshCcw className="h-8 w-8 text-green-500" />
    case 'structure':
      return <WandSparkles className="h-8 w-8 text-purple-500" />
    case 'generate':
      return <Bot className="h-8 w-8 text-primary" />
    default:
      return <Bolt className="h-8 w-8 text-primary" />
  }
}

const getActionPath = (action: ActionType) => {
  switch (action) {
    case 'convert':
      return '/'
    case 'structure':
    case 'generate':
      return '/ai-structuring'
    default:
      return '/'
  }
}

const HistoryItem = ({
  type,
  inputFormat,
  outputFormat,
  createdAt,
}: HistoryItemType) => {
  const navigate = useNavigate()

  if (type !== 'convert') {
    inputFormat = 'Prompt'
  }

  const Icon = getActionIcon(type)

  const handleUseAgain = () => {
    navigate({
      to: getActionPath(type),
      search: () => ({
        selected: type,
        from: inputFormat === 'Prompt' ? undefined : inputFormat,
        to: outputFormat,
      }),
    })
  }

  return (
    <Card className="px-4 py-2 w-full flex flex-row items-center gap-4">
      <div className="bg-muted rounded p-2">{Icon}</div>
      <div className="flex flex-col">
        <div className="text-sm text-muted-foreground">
          <span>{capitalizeFirstLetter(type)}</span>
        </div>
        <div className="text-base">
          {inputFormat} → {outputFormat}
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(createdAt).toLocaleString()}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto text-primary"
        onClick={handleUseAgain}
      >
        Use again
      </Button>
    </Card>
  )
}

export default HistoryItem

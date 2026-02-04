import type { HistoryItem as HistoryItemType } from 'types'
import { Card } from './ui/card'
import { capitalizeFirstLetter } from '@/lib/utils'

const HistoryItem = ({
  type,
  inputFormat,
  outputFormat,
  createdAt,
}: HistoryItemType) => {
  if (type !== 'convert') {
    inputFormat = 'Prompt'
  }
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">
          <span>{capitalizeFirstLetter(type)}</span>
        </div>
        <div className="text-base">
          {inputFormat} → {outputFormat}
        </div>
        <div className="text-sm text-muted-foreground">
          {createdAt.toLocaleString()}
        </div>
      </div>
    </Card>
  )
}

export default HistoryItem

import type { HistoryItem as HistoryItemType } from 'types'
import HistoryItem from './history-item'

interface HistoryListProps {
  history: HistoryItemType[]
}

const HistoryList = ({ history }: HistoryListProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      {history.map((item) => (
        <HistoryItem key={item.id} {...item} />
      ))}
    </div>
  )
}

export default HistoryList

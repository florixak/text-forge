import { BadgeAlert } from 'lucide-react'
import { Card } from '../ui/card'

const NotVerifiedCard = () => {
  return (
    <Card className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-md flex flex-row items-center gap-4 w-full">
      <BadgeAlert className="text-yellow-500" />
      <div className="text-sm text-yellow-700">
        Your email is not verified. Please check your inbox and click the
        verification link to unlock all features.
      </div>
    </Card>
  )
}

export default NotVerifiedCard

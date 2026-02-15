import { Link } from '@tanstack/react-router'
import { Card } from '../ui/card'
import { CirclePile, TextAlignStart } from 'lucide-react'

const DashboardQuickActions = () => {
  return (
    <div className="w-full flex flex-col">
      <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
      <div className="flex flex-wrap sm:gap-4 w-full">
        <Link to="/" className="min-w-75 flex-1">
          <Card className="p-4 mb-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-accent/50">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-md">
                <TextAlignStart className="text-primary" />
              </div>
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold">Go To Formatter</h4>
              <p className="text-sm text-muted-foreground">
                Clean and beautify your data
              </p>
            </div>
          </Card>
        </Link>
        <Link to="/ai-structuring" className="min-w-75 flex-1">
          <Card className="p-4 mb-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-accent/50">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-md">
                <CirclePile className="text-primary" />
              </div>
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold">AI Structuring</h4>
              <p className="text-sm text-muted-foreground">
                Structure unorganized data using AI
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default DashboardQuickActions

import { DashboardData } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import ProfileDrawer from './profile-drawer'
import PasswordDrawer from './password-drawer'

interface ProfileCardProps {
  data: DashboardData
}

const ProfileCard = ({ data }: ProfileCardProps) => {
  const { user } = data

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-lg font-semibold">Profile</h2>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4 items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
            {user.name.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <ProfileDrawer user={user} />
          <PasswordDrawer />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  )
}

export default ProfileCard

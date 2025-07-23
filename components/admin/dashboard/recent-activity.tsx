import { formatDistanceToNow } from 'date-fns'
import { Icons } from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentActivity } from '@/hooks/use-analytics'

const activityIcons = {
  comment: 'messageSquare',
  post: 'fileText',
  user: 'user',
  project: 'folder',
  publication: 'bookOpen',
  settings: 'settings',
  activity: 'barChart'
} as const

const activityColors = {
  comment: 'text-blue-500',
  post: 'text-green-500',
  user: 'text-purple-500',
  project: 'text-amber-500',
  publication: 'text-pink-500',
  settings: 'text-gray-500',
} as const

export function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Icons.activity className="h-8 w-8 mb-2" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = Icons[activityIcons[activity.type] || 'activity']
            const color = activityColors[activity.type] || 'text-gray-500'
            
            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.image || ''} alt={activity.user.name || ''} />
                  <AvatarFallback>
                    {activity.user.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <span className="font-medium">{activity.user.name || 'Unknown User'}</span>
                    <span className="mx-1">•</span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Icon className={`mr-2 h-4 w-4 ${color}`} />
                    <span>{activity.title}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

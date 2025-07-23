import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/use-analytics'
import { ComponentType } from 'react'

// Define a union type of valid icon names
type IconName = keyof typeof Icons

interface StatCardProps {
  title: string
  value: number | string
  icon: IconName
  description?: string
  loading?: boolean
}

// Map icon names to their corresponding components
const iconMap: Record<IconName, ComponentType<any>> = {
  fileText: Icons.fileText,
  messageSquare: Icons.messageSquare,
  users: Icons.users,
  barChart: Icons.barChart,
  // Add other icons as needed
  check: Icons.check,
  x: Icons.x,
  alertTriangle: Icons.alertTriangle,
  edit: Icons.edit,
  trash: Icons.trash,
  moreVertical: Icons.moreVertical,
  send: Icons.send,
  filter: Icons.filter,
  search: Icons.search,
  externalLink: Icons.externalLink,
  chevronDown: Icons.chevronDown,
  chevronRight: Icons.chevronRight,
  user: Icons.user,
  mail: Icons.mail,
  lock: Icons.lock,
  eye: Icons.eye,
  eyeOff: Icons.eyeOff,
  google: Icons.google,
  spinner: Icons.spinner,
  comment: Icons.comment,
  home: Icons.home,
  calendar: Icons.calendar,
  settings: Icons.settings,
  folder: Icons.folder,
  tag: Icons.tag,
  layers: Icons.layers,
  fileArchive: Icons.fileArchive,
  bookOpen: Icons.bookOpen
}

function StatCard({ title, value, icon: iconName, description, loading = false }: StatCardProps) {
  const Icon = iconMap[iconName] || Icons.fileText // Fallback to fileText if icon not found
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {loading ? (
          <Skeleton className="h-6 w-6 rounded-full" />
        ) : (
          Icon && <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const { data: stats, isLoading } = useDashboardStats()

  const cards = [
    {
      title: 'Total Posts',
      value: stats?.totalPosts ?? 0,
      icon: 'fileText',
      description: '+12% from last month',
    },
    {
      title: 'Total Comments',
      value: stats?.totalComments ?? 0,
      icon: 'messageSquare',
      description: '+19% from last month',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: 'users',
      description: '+5% from last month',
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers ?? 0,
      icon: 'activity',
      description: 'Active in last 30 days',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        // Ensure the icon name exists in Icons, fallback to a default icon if not found
        const iconName = Object.keys(Icons).includes(card.icon) 
          ? card.icon as IconName 
          : 'fileText';
          
        return (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={iconName}
            description={card.description}
            loading={isLoading}
          />
        );
      })}
    </div>
  )
}

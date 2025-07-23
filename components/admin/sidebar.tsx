'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  BarChart3, 
  Mail,
  Folder,
  Tag,
  MessageCircle,
  Layers,
  FileArchive,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  items?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Content',
    href: '#',
    icon: FileText,
    items: [
      {
        title: 'Posts',
        href: '/admin/blog/posts',
        icon: FileText,
      },
      {
        title: 'Categories',
        href: '/admin/blog/categories',
        icon: Folder,
      },
      {
        title: 'Tags',
        href: '/admin/blog/tags',
        icon: Tag,
      },
      {
        title: 'Comments',
        href: '/admin/blog/comments',
        icon: MessageCircle,
      },
    ],
  },
  {
    title: 'Projects',
    href: '/admin/projects',
    icon: Layers,
  },
  {
    title: 'Publications',
    href: '/admin/publications',
    icon: FileArchive,
  },
  {
    title: 'Resources',
    href: '/admin/resources',
    icon: BookOpen,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || (href !== '#' && pathname?.startsWith(href))
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block h-screen fixed w-64 overflow-y-auto">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Dr. Abel Health</span>
          </Link>
        </div>
        
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.href} className="space-y-1">
                {item.items ? (
                  <div className="space-y-1">
                    <div className="px-2 py-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                      {item.title}
                    </div>
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive(subItem.href)
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <subItem.icon className="h-4 w-4" />
                        {subItem.title}
                        {isActive(subItem.href) && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    {isActive(item.href) && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-auto p-4">
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

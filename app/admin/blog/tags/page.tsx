import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { TagList } from '@/components/admin/blog/tag-list'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Icons } from '@/components/icons'

export default async function TagsPage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Tags"
        text="Create and manage blog tags"
      >
        <Link
          href="/admin/blog/tags/new"
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          <Icons.add className="mr-2 h-4 w-4" />
          New Tag
        </Link>
      </DashboardHeader>
      <div className="space-y-6">
        <TagList />
      </div>
    </DashboardShell>
  )
}

export const metadata = {
  title: 'Tags',
  description: 'Manage blog tags',
}

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { BlogPostList } from '@/components/admin/blog/blog-post-list'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Icons } from '@/components/icons'

export default async function BlogPostsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  // TypeScript now knows session.user exists after the check above
  const user = session.user
  
  const isAdmin = user.role === 'ADMIN' || 
    ['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(user.email || '')
  
  if (!isAdmin) {
    return notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Blog Posts"
        text="Create and manage blog posts"
      >
        <Link
          href="/admin/blog/posts/new"
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          <Icons.add className="mr-2 h-4 w-4" />
          New Post
        </Link>
      </DashboardHeader>
      <div className="space-y-6">
        <BlogPostList />
      </div>
    </DashboardShell>
  )
}

export const metadata = {
  title: 'Blog Posts',
  description: 'Manage blog posts',
}

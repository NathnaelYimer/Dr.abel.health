import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { CategoryList } from '@/components/admin/blog/category-list'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Icons } from '@/components/icons'

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Categories"
        text="Create and manage blog categories"
      >
        <Link
          href="/admin/blog/categories/new"
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          <Icons.add className="mr-2 h-4 w-4" />
          New Category
        </Link>
      </DashboardHeader>
      <div className="space-y-6">
        <CategoryList />
      </div>
    </DashboardShell>
  )
}

export const metadata = {
  title: 'Categories',
  description: 'Manage blog categories',
}

import { ProjectList } from '@/components/admin/projects/project-list'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Icons } from '@/components/icons'

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const isAdmin = session.user.role === 'ADMIN' || 
    ['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')
  
  if (!isAdmin) {
    redirect('/')
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Projects"
        text="Manage and track all projects"
      >
        <Link
          href="/admin/projects/new"
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          <Icons.add className="mr-2 h-4 w-4" />
          New Project
        </Link>
      </DashboardHeader>
      <div className="space-y-6">
        <ProjectList />
      </div>
    </DashboardShell>
  )
}

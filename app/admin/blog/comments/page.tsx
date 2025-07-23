import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { CommentList } from '@/components/admin/comments/comment-list'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comments',
  description: 'Manage and moderate blog comments',
}

export default async function CommentsPage({
  searchParams,
}: {
  searchParams?: {
    status?: string
    search?: string
    page?: string
  }
}) {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  const isAdmin = session?.user?.email && [
    'admin@drabel.com', 
    'abel@drabel.com', 
    'admin@example.com'
  ].includes(session.user.email)
  
  if (!isAdmin) {
    return notFound()
  }

  const status = searchParams?.status || 'ALL'
  const search = searchParams?.search || ''
  const page = searchParams?.page ? parseInt(searchParams.page) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Comments</h2>
          <p className="text-muted-foreground">
            Manage and moderate blog comments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative w-full md:w-64">
            <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search comments..."
              className="w-full pl-8"
              defaultValue={search}
            />
          </div>
          <Button>
            <Icons.filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue={status} className="space-y-4">
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          <TabsTrigger value="SPAM">Spam</TabsTrigger>
        </TabsList>
        
        <TabsContent value={status} className="space-y-4">
          <CommentList 
            filters={{
              status: status !== 'ALL' ? status as any : undefined,
              search,
              page,
              limit: 10
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

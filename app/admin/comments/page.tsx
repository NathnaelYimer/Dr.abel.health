import { DataTable } from '@/components/admin/comments/data-table'
import { columns } from '@/components/admin/comments/columns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function AdminCommentsPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/comments')
  }
  
  // Only allow admin users
  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // Fetch comments with all required fields
  const comments = await prisma.comment.findMany({
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }).then(comments => 
    comments.map(comment => ({
      ...comment,
      // Ensure author is not null (required by Comment type)
      author: comment.author || {
        id: 'unknown',
        name: 'Unknown',
        email: null,
        image: null
      },
      // Ensure post is not null (required by Comment type)
      post: comment.post || {
        id: 'unknown',
        title: 'Unknown Post',
        slug: 'unknown'
      }
    }))
  )

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comments</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {comments.length} comment{comments.length !== 1 ? 's' : ''} total
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={comments} />
        </CardContent>
      </Card>
    </div>
  )
}

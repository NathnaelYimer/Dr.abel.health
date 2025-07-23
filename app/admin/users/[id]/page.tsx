import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Get the user data with related information
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
      posts: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          category: true,
          published: true,
          createdAt: true,
        },
      },
      comments: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Send Message
          </Button>
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Profile */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-medium">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user.name || 'No Name'}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span>
                    {user.emailVerified ? (
                      <Badge variant="outline">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Active</span>
                  <span>{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{user._count.posts}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{user._count.comments}</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Activity */}
        <div className="md:col-span-2 space-y-6">
          {/* Recent Posts */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Posts</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/users/${user.id}/posts`}>View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {user.posts.length > 0 ? (
                <div className="space-y-4">
                  {user.posts.map((post) => (
                    <div key={post.id} className="border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <Link 
                          href={`/admin/blog/${post.id}`}
                          className="font-medium hover:underline"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{post.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No posts found.</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Comments */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Comments</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/users/${user.id}/comments`}>View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {user.comments.length > 0 ? (
                <div className="space-y-4">
                  {user.comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <p className="text-sm mb-2 line-clamp-2">{comment.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Link 
                          href={`/blog/${comment.post.id}`} 
                          className="hover:underline"
                        >
                          On: {comment.post.title}
                        </Link>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

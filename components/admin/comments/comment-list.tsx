'use client'

import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { Comment, CommentStatus } from '@/types/comment'

const statusVariantMap = {
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 hover:bg-green-200',
  REJECTED: 'bg-red-100 text-red-800 hover:bg-red-200',
  SPAM: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
}

interface CommentListProps {
  initialData?: Comment[]
  filters?: {
    status?: CommentStatus
    search?: string
    page?: number
    limit?: number
  }
}

export function CommentList({ initialData, filters = {} }: CommentListProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<CommentStatus | 'ALL'>(
    (filters.status as CommentStatus) || 'ALL'
  )

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['admin', 'comments', { status: selectedStatus }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus)
      if (filters.search) params.set('search', filters.search)
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())

      const response = await fetch(`/api/admin/blog/comments?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      return response.json()
    },
    initialData,
  })

  const updateCommentStatus = useCallback(
    async (id: string, status: CommentStatus) => {
      try {
        const response = await fetch(`/api/admin/blog/comments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })

        if (!response.ok) throw new Error('Failed to update comment status')

        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] })
      } catch (error) {
        console.error('Error updating comment status:', error)
      }
    },
    [queryClient]
  )

  const deleteComment = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this comment?')) return

      try {
        const response = await fetch(`/api/admin/blog/comments/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Failed to delete comment')

        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] })
      } catch (error) {
        console.error('Error deleting comment:', error)
      }
    },
    [queryClient]
  )

  const getStatusBadge = (status: CommentStatus) => (
    <Badge className={`text-xs ${statusVariantMap[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center p-8">
        <Icons.comment className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">No comments found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {selectedStatus === 'PENDING'
            ? 'No pending comments to review.'
            : 'No comments match your criteria.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={selectedStatus === 'ALL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('ALL')}
        >
          All
        </Button>
        {Object.entries(statusVariantMap).map(([status, _]) => (
          <Button
            key={status}
            variant={selectedStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(status as CommentStatus)}
            className="capitalize"
          >
            {status.toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {comment.author?.image ? (
                    <img
                      src={comment.author.image}
                      alt={comment.author.name || 'User'}
                      className="h-full w-full rounded-full"
                    />
                  ) : (
                    <Icons.user className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {comment.author?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {getStatusBadge(comment.status as CommentStatus)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    on "{comment.postTitle}"
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Icons.moreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {comment.status !== 'APPROVED' && (
                    <DropdownMenuItem
                      onClick={() => updateCommentStatus(comment.id, 'APPROVED')}
                    >
                      <Icons.check className="mr-2 h-4 w-4" />
                      <span>Approve</span>
                    </DropdownMenuItem>
                  )}
                  {comment.status !== 'REJECTED' && (
                    <DropdownMenuItem
                      onClick={() => updateCommentStatus(comment.id, 'REJECTED')}
                    >
                      <Icons.x className="mr-2 h-4 w-4" />
                      <span>Reject</span>
                    </DropdownMenuItem>
                  )}
                  {comment.status !== 'SPAM' && (
                    <DropdownMenuItem
                      onClick={() => updateCommentStatus(comment.id, 'SPAM')}
                    >
                      <Icons.alertTriangle className="mr-2 h-4 w-4" />
                      <span>Mark as spam</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `/blog/${comment.postId}#comment-${comment.id}`,
                        '_blank'
                      )
                    }
                  >
                    <Icons.externalLink className="mr-2 h-4 w-4" />
                    <span>View on site</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteComment(comment.id)}
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-3 pl-10 text-sm">
              <p className="whitespace-pre-line">{comment.content}</p>
            </div>
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 pl-10 border-l-2 border-muted">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Replies ({comment.replies.length})
                </h4>
                <div className="space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-muted/30 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium">
                            {reply.author?.name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {getStatusBadge(reply.status as CommentStatus)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Icons.moreVertical className="h-3 w-3" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {reply.status !== 'APPROVED' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateCommentStatus(reply.id, 'APPROVED')
                                }
                              >
                                <Icons.check className="mr-2 h-4 w-4" />
                                <span>Approve</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteComment(reply.id)}
                            >
                              <Icons.trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-1 text-xs whitespace-pre-line">
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

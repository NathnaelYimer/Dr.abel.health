'use client'

import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { DataTable } from './data-table'
import { ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM'

type Comment = {
  id: string
  content: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  post: {
    id: string
    title: string
    slug: string
  }
  replies: Array<{
    id: string
    content: string
    createdAt: string
    author: {
      name: string | null
      image: string | null
    } | null
  }>
}

export function CommentList() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: 'PENDING',
  })

  // Fetch comments
  const { data: comments, isLoading, error } = useQuery({
    queryKey: ['admin-blog-comments', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, String(value))
      })
      
      const res = await fetch(`/api/admin/blog/comments?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch comments')
      return res.json()
    },
  })

  // Update comment status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: CommentStatus }) => {
      const res = await fetch(`/api/admin/blog/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update comment status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-comments'] })
      toast({
        title: 'Success',
        description: 'Comment status updated successfully',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update comment status',
        variant: 'destructive',
      })
    },
  })

  // Delete comment
  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/blog/comments/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-comments'] })
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      })
    },
  })

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap = {
      PENDING: { label: 'Pending', variant: 'outline' as const },
      APPROVED: { label: 'Approved', variant: 'default' as const },
      REJECTED: { label: 'Rejected', variant: 'destructive' as const },
      SPAM: { label: 'Spam', variant: 'secondary' as const },
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const }
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    )
  }

  // Column header with sorting
  const DataTableColumnHeader = ({ column, title }: { column: any; title: string }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-3 h-8 data-[state=open]:bg-accent"
      >
        {title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  }

  // Columns definition
  const columns = [
    {
      accessorKey: 'content',
      header: 'Comment',
      cell: ({ row }: any) => {
        const comment = row.original as Comment
        return (
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.author?.image || ''} alt={comment.author?.name || 'User'} />
              <AvatarFallback>
                {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {comment.author?.name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {comment.post.title}
                </Badge>
                {comment.replies.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }: any) => {
        const comment = row.original as Comment
        return <StatusBadge status={comment.status} />
      },
      filterFn: (row: any, id: string, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }: any) => {
        const comment = row.original as Comment
        return (
          <div className="text-sm text-muted-foreground">
            {comment.author?.email || 'No email'}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const comment = row.original as Comment
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Icons.moreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/blog/${comment.post.slug}#comment-${comment.id}`)}
              >
                <Icons.externalLink className="mr-2 h-4 w-4" />
                View on site
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {comment.status !== 'APPROVED' && (
                <DropdownMenuItem
                  onClick={() => updateStatus.mutate({ id: comment.id, status: 'APPROVED' })}
                >
                  <Icons.check className="mr-2 h-4 w-4 text-green-600" />
                  Approve
                </DropdownMenuItem>
              )}
              {comment.status !== 'REJECTED' && (
                <DropdownMenuItem
                  onClick={() => updateStatus.mutate({ id: comment.id, status: 'REJECTED' })}
                >
                  <Icons.x className="mr-2 h-4 w-4 text-red-600" />
                  Reject
                </DropdownMenuItem>
              )}
              {comment.status !== 'SPAM' && (
                <DropdownMenuItem
                  onClick={() => updateStatus.mutate({ id: comment.id, status: 'SPAM' })}
                >
                  <Icons.alertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                  Mark as Spam
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
                    deleteComment.mutate(comment.id)
                  }
                }}
              >
                <Icons.trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <Icons.alertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Failed to load comments
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search comments..."
            className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchParams.search}
            onChange={(e) =>
              setSearchParams({ ...searchParams, search: e.target.value, page: 1 })
            }
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchParams.status}
            onChange={(e) =>
              setSearchParams({ ...searchParams, status: e.target.value, page: 1 })
            }
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SPAM">Spam</option>
            <option value="">All Statuses</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSearchParams({
                page: 1,
                limit: 10,
                search: '',
                status: 'PENDING',
              })
            }
          >
            <Icons.refreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={comments?.data || []}
        />
        
        {/* Custom Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page {searchParams.page} of {Math.ceil((comments?.pagination?.total || 0) / searchParams.limit)}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams(prev => ({
                ...prev,
                page: Math.max(1, searchParams.page - 1)
              }))}
              disabled={searchParams.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams(prev => ({
                ...prev,
                page: searchParams.page + 1
              }))}
              disabled={!comments?.pagination?.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from './data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { Icons } from '@/components/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'

type BlogPost = {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  updatedAt: string
  author: {
    name: string | null
    image: string | null
  }
  categories: Array<{ name: string }>
  tags: Array<{ name: string }>
  viewCount: number
  commentCount: number
}

export function BlogPostList() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    category: '',
    tag: '',
  })

  // Fetch blog posts
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['admin-blog-posts', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, String(value))
      })
      
      const res = await fetch(`/api/admin/blog/posts?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch blog posts')
      return res.json()
    },
  })

  // Handle status change
  const updateStatus = async (postId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (!res.ok) throw new Error('Failed to update post status')
      
      toast({
        title: 'Success',
        description: 'Post status updated successfully',
      })
      
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update post status',
        variant: 'destructive',
      })
    }
  }

  // Handle delete
  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return
    
    try {
      const res = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete post')
      
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      })
      
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      })
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap = {
      DRAFT: { label: 'Draft', variant: 'outline' as const },
      PUBLISHED: { label: 'Published', variant: 'default' as const },
      ARCHIVED: { label: 'Archived', variant: 'secondary' as const },
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const }
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    )
  }

  // Columns definition
  const columns = [
    {
      accessorKey: 'title',
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }: any) => {
        const post = row.original as BlogPost
        return (
          <div className="flex flex-col">
            <span className="font-medium">{post.title}</span>
            <span className="text-xs text-muted-foreground">/{post.slug}</span>
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
        const post = row.original as BlogPost
        return <StatusBadge status={post.status} />
      },
      filterFn: (row: any, id: string, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'publishedAt',
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Published" />
      ),
      cell: ({ row }: any) => {
        const post = row.original as BlogPost
        return post.publishedAt ? (
          <div className="text-sm text-muted-foreground">
            {format(new Date(post.publishedAt), 'MMM d, yyyy')}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Not published</span>
        )
      },
    },
    {
      accessorKey: 'categories',
      header: 'Categories',
      cell: ({ row }: any) => {
        const post = row.original as BlogPost
        return (
          <div className="flex flex-wrap gap-1">
            {post.categories.map((category) => (
              <Badge key={category.name} variant="outline" className="text-xs">
                {category.name}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'stats',
      header: 'Stats',
      cell: ({ row }: any) => {
        const post = row.original as BlogPost
        return (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Icons.eye className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{post.viewCount}</span>
            </div>
            <div className="flex items-center">
              <Icons.messageSquare className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{post.commentCount}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const post = row.original as BlogPost
        
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
                onClick={() => router.push(`/admin/blog/posts/${post.id}`)}
              >
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {post.status !== 'PUBLISHED' && (
                <DropdownMenuItem
                  onClick={() => updateStatus(post.id, 'PUBLISHED')}
                >
                  <Icons.upload className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
              {post.status === 'PUBLISHED' && (
                <DropdownMenuItem
                  onClick={() => updateStatus(post.id, 'DRAFT')}
                >
                  <Icons.draft className="mr-2 h-4 w-4" />
                  Unpublish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/blog/${post.slug}`
                  )
                  toast({
                    title: 'Copied to clipboard',
                    description: 'Blog post URL has been copied to clipboard.',
                  })
                }}
              >
                <Icons.copy className="mr-2 h-4 w-4" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deletePost(post.id)}
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
              Failed to load blog posts
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
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search posts..."
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
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSearchParams({
                page: 1,
                limit: 10,
                search: '',
                status: '',
                category: '',
                tag: '',
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
          data={posts?.data || []}
        />
        
        {/* Custom Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page {searchParams.page} of {Math.ceil((posts?.pagination?.total || 0) / searchParams.limit)}
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
              disabled={!posts?.pagination?.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

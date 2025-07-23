'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { DataTable } from './data-table'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

type Tag = {
  id: string
  name: string
  slug: string
  postCount: number
  createdAt: string
  updatedAt: string
}

export function TagList() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  })

  // Fetch tags
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-blog-tags', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, String(value))
      })
      
      const res = await fetch(`/api/admin/blog/tags?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch tags')
      return res.json()
    },
  })

  const tags = data?.data || []

  // Handle delete
  const deleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag? This will remove it from all associated posts.')) return
    
    try {
      const res = await fetch(`/api/admin/blog/tags/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete tag')
      
      toast({
        title: 'Success',
        description: 'Tag deleted successfully',
      })
      
      queryClient.invalidateQueries({ queryKey: ['admin-blog-tags'] })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive',
      })
    }
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
      accessorKey: 'name',
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }: any) => {
        const tag = row.original as Tag
        return (
          <div className="flex items-center">
            <span className="font-medium">#{tag.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">/{tag.slug}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'postCount',
      header: 'Posts',
      cell: ({ row }: any) => {
        const tag = row.original as Tag
        return (
          <Badge variant="outline">
            {tag.postCount} {tag.postCount === 1 ? 'post' : 'posts'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }: any) => {
        const tag = row.original as Tag
        return format(new Date(tag.updatedAt), 'MMM d, yyyy')
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const tag = row.original as Tag
        
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
                onClick={() => router.push(`/admin/blog/tags/${tag.id}`)}
              >
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteTag(tag.id)}
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
              Failed to load tags
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
            placeholder="Search tags..."
            className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchParams.search}
            onChange={(e) =>
              setSearchParams({ ...searchParams, search: e.target.value, page: 1 })
            }
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSearchParams({
                page: 1,
                limit: 10,
                search: '',
              })
            }
          >
            <Icons.refreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={() => router.push('/admin/blog/tags/new')}
          >
            <Icons.plus className="mr-2 h-4 w-4" />
            New Tag
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tags..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={searchParams.search || ''}
          onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
        />
      </div>
      <DataTable
        columns={columns}
        data={tags || []}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { DataTable } from './data-table'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

// Column header with sorting
const DataTableColumnHeader = ({ column, title }: { column: any; title: string }) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="-ml-3 h-8 data-[state=open]:bg-accent"
    >
      {title}
      <Icons.arrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  postCount: number
  createdAt: string
  updatedAt: string
}

export function CategoryList() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  })

  // Fetch categories
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['admin-blog-categories', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, String(value))
      })
      
      const res = await fetch(`/api/admin/blog/categories?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  // Handle delete
  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone and will remove this category from all associated posts.')) return
    
    try {
      const res = await fetch(`/api/admin/blog/categories/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete category')
      
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })
      
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      })
    }
  }

  // Columns definition
  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }: any) => {
        const category = row.original as Category
        return (
          <div className="flex flex-col">
            <span className="font-medium">{category.name}</span>
            <span className="text-xs text-muted-foreground">/{category.slug}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => {
        const category = row.original as Category
        return (
          <div className="text-sm text-muted-foreground line-clamp-1">
            {category.description || 'No description'}
          </div>
        )
      },
    },
    {
      accessorKey: 'postCount',
      header: 'Posts',
      cell: ({ row }: any) => {
        const category = row.original as Category
        return (
          <Badge variant="outline">
            {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }: any) => {
        const category = row.original as Category
        return format(new Date(category.updatedAt), 'MMM d, yyyy')
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const category = row.original as Category
        
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
                onClick={() => router.push(`/admin/blog/categories/${category.id}`)}
              >
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteCategory(category.id)}
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
              Failed to load categories
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
            placeholder="Search categories..."
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
            onClick={() => router.push('/admin/blog/categories/new')}
          >
            <Icons.plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={categories?.data || []}
        />
        
        {/* Custom Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page {searchParams.page} of {Math.ceil((categories?.pagination?.total || 0) / searchParams.limit)}
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
              disabled={!categories?.pagination?.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

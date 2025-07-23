'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ProjectStatus, Priority } from '@prisma/client'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/users/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'

type Project = {
  id: string
  title: string
  status: ProjectStatus
  progress: number
  priority: Priority
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
  _count: {
    teamMembers: number
    updates: number
  }
}

export function ProjectList() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    type: ''
  })

  // Fetch projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['admin-projects', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, String(value))
      })
      
      const res = await fetch(`/api/admin/projects?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch projects')
      return res.json()
    }
  })

  // Handle status change
  const updateStatus = async (projectId: string, status: ProjectStatus) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!res.ok) throw new Error('Failed to update status')
      
      toast({
        title: 'Success',
        description: 'Project status updated',
        variant: 'default'
      })
      
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive'
      })
    }
  }

  // Handle delete
  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Failed to delete project')
      
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
        variant: 'default'
      })
      
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      })
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: ProjectStatus }) => {
    const statusMap = {
      DRAFT: { label: 'Draft', variant: 'outline' as const },
      PLANNING: { label: 'Planning', variant: 'secondary' as const },
      IN_PROGRESS: { label: 'In Progress', variant: 'default' as const },
      ON_HOLD: { label: 'On Hold', variant: 'secondary' as const }, // Changed from 'warning' to 'secondary'
      COMPLETED: { label: 'Completed', variant: 'default' as const }, // Changed from 'success' to 'default'
      CANCELLED: { label: 'Cancelled', variant: 'destructive' as const },
      ARCHIVED: { label: 'Archived', variant: 'outline' as const },
    }
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const }
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    )
  }

  // Priority icon
  const PriorityIcon = ({ priority }: { priority: Priority }) => {
    const iconMap = {
      LOW: <Icons.arrowDown className="h-4 w-4 text-muted-foreground" />,
      MEDIUM: <Icons.minus className="h-4 w-4 text-muted-foreground" />,
      HIGH: <Icons.arrowUp className="h-4 w-4 text-amber-500" />,
      URGENT: <Icons.alertTriangle className="h-4 w-4 text-red-500" />
    }
    
    return iconMap[priority] || null
  }

  // Columns definition
  const columns = [
    {
      accessorKey: 'title',
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }: any) => {
        const project = row.original as Project
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="link" 
              className="h-auto p-0 text-left"
              onClick={() => router.push(`/admin/projects/${project.id}`)}
            >
              {project.title}
            </Button>
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
        const project = row.original as Project
        return <StatusBadge status={project.status} />
      },
      filterFn: (row: any, id: string, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'progress',
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Progress" />
      ),
      cell: ({ row }: any) => {
        const project = row.original as Project
        return (
          <div className="flex items-center space-x-2">
            <Progress value={project.progress} className="h-2 w-24" />
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }: any) => {
        const project = row.original as Project
        return (
          <div className="flex items-center">
            <PriorityIcon priority={project.priority} />
            <span className="ml-2 capitalize">{project.priority.toLowerCase()}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'teamMembers',
      header: 'Team',
      cell: ({ row }: any) => {
        const project = row.original as Project
        return (
          <div className="flex items-center">
            <Icons.users className="h-4 w-4 text-muted-foreground" />
            <span className="ml-2">{project._count.teamMembers}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'updates',
      header: 'Updates',
      cell: ({ row }: any) => {
        const project = row.original as Project
        return project._count.updates
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: any) => {
        const project = row.original as Project
        return format(new Date(project.startDate), 'MMM d, yyyy')
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const project = row.original as Project
        
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
                onClick={() => router.push(`/admin/projects/${project.id}`)}
              >
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateStatus(project.id, 'COMPLETED')}
                disabled={project.status === 'COMPLETED'}
              >
                <Icons.check className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateStatus(project.id, 'ON_HOLD')}
                disabled={project.status === 'ON_HOLD'}
              >
                <Icons.pause className="mr-2 h-4 w-4" />
                Put on Hold
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteProject(project.id)}
                className="text-red-600"
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
              Failed to load projects
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
            placeholder="Search projects..."
            className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchParams.search}
            onChange={(e) =>
              setSearchParams({ ...searchParams, search: e.target.value })
            }
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchParams.status}
            onChange={(e) =>
              setSearchParams({ ...searchParams, status: e.target.value })
            }
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
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
                type: ''
              })
            }
          >
            <Icons.refreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border">
          <DataTable
            columns={columns}
            data={projects?.data || []}
          />
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const prevPage = Math.max(1, searchParams.page - 1);
              setSearchParams({ ...searchParams, page: prevPage });
            }}
            disabled={searchParams.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextPage = searchParams.page + 1;
              setSearchParams({ ...searchParams, page: nextPage });
            }}
            disabled={!projects?.pagination?.hasNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

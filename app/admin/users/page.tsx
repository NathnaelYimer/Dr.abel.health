"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Download, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/admin/users/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { columns } from "@/components/admin/users/columns"
import { BulkActions } from "@/components/admin/users/bulk-actions"
import { useEffect, useState } from 'react'
import { User as PrismaUser, Role, UserStatus } from '@prisma/client'
import { User } from '@/components/admin/users/columns'
import { toast } from "sonner"
import { canManageUsers } from '@/lib/rbac'
import { useSession } from 'next-auth/react'

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  
  const statusFilter = searchParams.get('status')
  const roleFilter = searchParams.get('role')
  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (statusFilter) params.set('status', statusFilter)
        if (roleFilter) params.set('role', roleFilter)
        if (searchQuery) params.set('q', searchQuery)
        
        const res = await fetch(`/api/admin/users?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch users')
        const prismaUsers = await res.json()
        
        // Transform Prisma users to match the User type expected by the DataTable
        const transformedUsers = prismaUsers.map((user: PrismaUser) => ({
          id: user.id,
          name: user.name || 'No Name',
          email: user.email || '',
          role: user.role,
          status: user.status,
          joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
          posts: 0, // These would need to be populated from your data
          comments: 0, // These would need to be populated from your data
          lastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never',
          emailVerified: user.emailVerified
        }))
        
        setUsers(transformedUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUsers()
  }, [statusFilter, roleFilter, searchQuery])

  // Get counts for tabs
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length
  const inactiveUsers = users.filter(u => u.status === 'INACTIVE').length
  const pendingVerification = users.filter(u => !u.emailVerified).length

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value
      const params = new URLSearchParams(searchParams.toString())
      
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      
      router.push(`/admin/users?${params.toString()}`)
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const response = await fetch('/api/admin/users/export')
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Export completed successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export users')
    } finally {
      setIsExporting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session?.user) {
    router.push('/auth/signin')
    return null
  }

  // Check if user has permission to view this page
  const currentUserRole = session.user.role as Role
  if (!['ADMIN', 'SUPER_ADMIN'].includes(currentUserRole)) {
    router.push('/admin')
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users and their permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              defaultValue={searchQuery}
              onKeyDown={handleSearch}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active ({activeUsers})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveUsers})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingVerification})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <BulkActions 
            selectedIds={[]} 
            onSuccess={() => {
              // Invalidate the users query
              router.refresh()
            }}
            currentUserRole={currentUserRole}
            className="mb-4"
          />
          <div className="rounded-md border">
            <DataTable columns={columns} data={users} />
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <BulkActions 
            selectedIds={[]}
            onSuccess={() => window.location.reload()}
            currentUserRole={session?.user?.role as Role}
            className="mb-4"
          />
          <div className="rounded-md border">
            <DataTable 
              columns={columns} 
              data={users.filter((u) => u.status === 'ACTIVE')}
            />
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <BulkActions 
            selectedIds={[]}
            onSuccess={() => window.location.reload()}
            currentUserRole={session?.user?.role as Role}
            className="mb-4"
          />
          <div className="rounded-md border">
            <DataTable 
              columns={columns} 
              data={users.filter((u) => u.status === 'INACTIVE')}
            />
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <BulkActions 
            selectedIds={[]}
            onSuccess={() => window.location.reload()}
            currentUserRole={session?.user?.role as Role}
            className="mb-4"
          />
          <div className="rounded-md border">
            <DataTable 
              columns={columns} 
              data={users.filter((u) => !u.emailVerified)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

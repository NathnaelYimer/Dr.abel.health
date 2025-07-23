"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, UserCog, Mail, UserX, UserCheck, Download, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Role, UserStatus } from "@prisma/client"
import { canManageUsers } from "@/lib/rbac"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BulkActionsProps {
  selectedIds: string[]
  onSuccess?: () => void
  currentUserRole: Role
  className?: string
}

export function BulkActions({ selectedIds, onSuccess, currentUserRole, className }: BulkActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  const handleBulkAction = async (action: string, data?: Record<string, unknown>) => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one user")
      return
    }

    try {
      setIsLoading(true)
      
      const url = "/api/admin/users/bulk"
      const body = { 
        action, 
        userIds: selectedIds,
        ...(data && { data }) // Only include data if it exists
      }
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to perform bulk action")
      }
      
      const result = await response.json()
      toast.success(result.message || "Bulk action completed successfully")
      
      onSuccess?.()
      setShowRoleDialog(false)
      setShowStatusDialog(false)
      router.refresh()
    } catch (error) {
      console.error("Bulk action error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to perform bulk action")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: 'CSV' | 'JSON') => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        format,
        ...(selectedIds.length > 0 && { ids: selectedIds.join(',') })
      })
      
      const response = await fetch(`/api/admin/users/export?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to export users')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url) // Clean up
      
      toast.success(`Exported ${selectedIds.length > 0 ? selectedIds.length + ' users' : 'all users'} as ${format}`)
    } catch (error) {
      console.error('Error exporting users:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to export users')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter available bulk actions based on user's role
  const canChangeRole = selectedIds.length > 0 && 
    selectedIds.every(id => {
      // In a real app, you'd check the target user's role here
      // For now, we'll just check if the current user is an admin
      return currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN'
    })

  const canChangeStatus = selectedIds.length > 0
  const canSendEmail = selectedIds.length > 0
  const canExport = selectedIds.length > 0

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoading || selectedIds.length === 0}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserCog className="h-4 w-4" />
            )}
            <span>Actions</span>
            <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {canChangeRole && (
            <DropdownMenuItem 
              onSelect={() => setShowRoleDialog(true)}
              disabled={isLoading}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Change Role
            </DropdownMenuItem>
          )}
          
          {canChangeStatus && (
            <DropdownMenuItem 
              onSelect={() => setShowStatusDialog(true)}
              disabled={isLoading}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Change Status
            </DropdownMenuItem>
          )}
          
          {canSendEmail && (
            <DropdownMenuItem
              onSelect={() => {
                // Implement email sending logic
                toast.info("Email functionality coming soon")
              }}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {canExport && (
            <DropdownMenuItem
              onSelect={async () => {
                try {
                  setIsLoading(true)
                  const response = await fetch('/api/admin/users/export', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ids: selectedIds }),
                  })
                  
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
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Selected
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change Role Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new role for {selectedIds.length} selected user{selectedIds.length > 1 ? 's' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select 
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {currentUserRole === 'SUPER_ADMIN' && (
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                )}
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="AUTHOR">Author</SelectItem>
                <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-sm text-muted-foreground">
              Note: You can only assign roles that are at or below your current permission level.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkAction("changeRole", { role: selectedRole })}
              disabled={!selectedRole || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                `Update ${selectedIds.length} User${selectedIds.length > 1 ? 's' : ''}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Status Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Status</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new status for {selectedIds.length} selected user{selectedIds.length > 1 ? 's' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select 
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                {currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN' ? (
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                ) : null}
              </SelectContent>
            </Select>
            <p className="mt-2 text-sm text-muted-foreground">
              Note: Some status changes may require admin approval.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkAction("changeStatus", { status: selectedStatus })}
              disabled={!selectedStatus || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                `Update ${selectedIds.length} User${selectedIds.length > 1 ? 's' : ''}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

'use client';

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle2, XCircle, MessageSquare, Trash2, Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

export type Comment = {
  id: string
  content: string
  approved: boolean
  createdAt: Date
  updatedAt?: Date
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
}

const approvalVariantMap = {
  true: "default",
  false: "outline"
} as const

const approvalTextMap = {
  true: "Approved",
  false: "Pending"
} as const

export const columns: ColumnDef<Comment>[] = [
  {
    accessorKey: "content",
    header: "Comment",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-[500px] truncate">
          {row.original.content.substring(0, 100)}
          {row.original.content.length > 100 ? '...' : ''}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "post",
    header: "Post",
    cell: ({ row }) => {
      const post = row.original.post
      return (
        <div className="flex flex-col">
          <span className="font-medium">{post.title}</span>
          <span className="text-sm text-muted-foreground">/{post.slug}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "approved",
    header: "Status",
    cell: ({ row }) => {
      const isApproved = row.original.approved
      const variant = approvalVariantMap[String(isApproved) as keyof typeof approvalVariantMap]
      
      return (
        <Badge variant={variant as "default" | "outline" | "destructive"}>
          {approvalTextMap[String(isApproved) as keyof typeof approvalTextMap]}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const comment = row.original
      const router = useRouter()
      const [isUpdating, setIsUpdating] = useState(false)

      const handleStatusUpdate = async (approved: boolean) => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        try {
          const response = await fetch(`/api/admin/comments/${comment.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ approved }),
          })

          if (!response.ok) {
            throw new Error('Failed to update comment approval status')
          }

          toast.success(`Comment ${approved ? 'approved' : 'unapproved'} successfully`)
          router.refresh()
        } catch (error) {
          console.error('Error updating comment approval status:', error)
          toast.error('Failed to update comment approval status')
        } finally {
          setIsUpdating(false);
        }
      }

      const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
          return
        }

        try {
          const response = await fetch(`/api/admin/comments/${comment.id}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            throw new Error('Failed to delete comment')
          }

          toast.success('Comment deleted')
          router.refresh()
        } catch (error) {
          console.error('Error deleting comment:', error)
          toast.error('Failed to delete comment')
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            {!comment.approved && (
              <DropdownMenuItem onClick={() => handleStatusUpdate(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Approve
              </DropdownMenuItem>
            )}
            
            {comment.approved && (
              <DropdownMenuItem onClick={() => handleStatusUpdate(false)}>
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Unapprove
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

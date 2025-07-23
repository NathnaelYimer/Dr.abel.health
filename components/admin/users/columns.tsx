import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// This type is used to define the shape of our data
export type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
  joined: string
  posts: number
  comments: number
  lastActive: string
  emailVerified: Date | null
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <span className="text-sm font-medium">
            {row.original.name?.charAt(0) || 'U'}
          </span>
        </div>
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge 
          variant={role === 'ADMIN' ? 'default' : 'secondary'}
          className={role === 'ADMIN' ? 'bg-blue-500' : ''}
        >
          {role}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge 
        variant={row.getValue("status") === 'Verified' ? 'outline' : 'secondary'}
      >
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "posts",
    header: "Posts",
  },
  {
    accessorKey: "comments",
    header: "Comments",
  },
  {
    accessorKey: "joined",
    header: "Joined",
  },
  {
    accessorKey: "lastActive",
    header: "Last Active",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

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
            <Link href={`/admin/users/${user.id}`}>
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>Send Message</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

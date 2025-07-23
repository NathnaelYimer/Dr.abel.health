import { ColumnDef, Row } from "@tanstack/react-table"
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

// This type is used to define the shape of our data
export type BlogPost = {
  id: string
  title: string
  category: string
  published: boolean
  publishedAt: string
  author: string
  slug: string
}

export const columns: ColumnDef<BlogPost>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }: { row: Row<BlogPost> }) => (
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
    accessorKey: "title",
    header: "Title",
    cell: ({ row }: { row: Row<BlogPost> }) => {
      const title = row.getValue("title") as string;
      return (
        <Link 
          href={`/admin/blog/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {title}
        </Link>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: { row: Row<BlogPost> }) => {
      const category = row.getValue("category") as string;
      return (
        <span className="capitalize">
          {category.toLowerCase().replace(/_/g, " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "published",
    header: "Status",
    cell: ({ row }: { row: Row<BlogPost> }) => {
      const isPublished = row.getValue("published") as boolean;
      return (
        <div className="flex items-center">
          {isPublished ? (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Published
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              Draft
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "publishedAt",
    header: "Published At",
  },
  {
    accessorKey: "author",
    header: "Author",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const post = row.original

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
            <Link href={`/admin/blog/${post.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <Link href={`/blog/${post.slug}`} target="_blank">
              <DropdownMenuItem>View</DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

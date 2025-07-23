import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DataTable } from "@/components/admin/blog/data-table"
import { columns } from "@/components/admin/blog/columns"
import { Category, Role } from "@prisma/client"
import { authOptions } from "@/lib/auth"

export default async function AdminBlogPosts() {
  // Get session using NextAuth getServerSession
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/blog')
  }
  
  // Type-safe role check
  const userEmail = session.user.email || ""
  const isAdmin = session.user.role === Role.ADMIN || 
    ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(userEmail)
  
  if (!isAdmin) {
    redirect('/?error=unauthorized')
  }

  // Define non-blog categories
  const nonBlogCategories: Category[] = [
    'RESEARCH',
    'CLINICAL_TRIALS',
    'HEALTH_POLICY',
    'CAPACITY_BUILDING',
    'MATERNAL_HEALTH',
    'INFECTIOUS_DISEASES',
    'NON_COMMUNICABLE_DISEASES',
    'DIGITAL_HEALTH',
    'NUTRITION'
  ]

  // Fetch blog posts (non-publication posts)
  const blogPosts = await prisma.post.findMany({
    where: {
      category: {
        notIn: nonBlogCategories
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { name: true }
      }
    }
  })

  // Format posts for the data table with proper typing
  const formattedPosts = blogPosts.map((post) => {
    // Type assertion for author
    const authorName = (post as any).author?.name || 'Unknown'
    
    return {
      id: post.id,
      title: post.title,
      category: post.category,
      published: post.published,
      publishedAt: post.publishedAt?.toLocaleDateString() || 'Draft',
      author: authorName,
      slug: post.slug
    }
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Blog Posts</h1>
        <Button asChild>
          <Link href="/admin/blog/new">Add New Post</Link>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <DataTable columns={columns} data={formattedPosts} />
      </div>
    </div>
  )
}

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DataTable } from "@/components/admin/publications/data-table"
import { columns } from "@/components/admin/publications/columns"
import { Role } from "@prisma/client"
import { authOptions } from "@/lib/auth"

export default async function AdminPublications() {
  // Get session using NextAuth getServerSession
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/publications')
  }
  
  // Type-safe role check
  const userEmail = session.user.email || ""
  const isAdmin = session.user.role === Role.ADMIN || 
    ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(userEmail)
  
  if (!isAdmin) {
    redirect('/?error=unauthorized')
  }

  // Fetch publications
  const publications = await prisma.post.findMany({
    where: {
      category: {
        in: [
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
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { name: true }
      }
    }
  })

  // Format publications for the data table
  const formattedPublications = publications.map((pub) => ({
    id: pub.id,
    title: pub.title,
    category: pub.category,
    published: pub.published,
    publishedAt: pub.publishedAt?.toLocaleDateString() || 'Draft',
    author: pub.author?.name || 'Unknown',
    slug: pub.slug
  }))

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Publications</h1>
        <Button asChild>
          <Link href="/admin/publications/new">Add New Publication</Link>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <DataTable columns={columns} data={formattedPublications} />
      </div>
    </div>
  )
}

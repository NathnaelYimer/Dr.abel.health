import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { CategoryForm } from '@/components/admin/blog/category-form'
import { Category } from '@prisma/client'

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['nathnaelyimer@gmail.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  // Get all valid category values from the enum
  const validCategories = Object.values(Category) as string[]
  
  // Check if the requested category exists in the enum
  if (!validCategories.includes(params.id)) {
    return notFound()
  }

  // Get post count for this category
  const postCount = await prisma.post.count({
    where: {
      category: params.id as Category
    }
  })

  // Create category data object that matches CategoryFormValues interface
  const categoryData = {
    id: params.id,
    name: params.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: '', // Initialize with empty string as required by the interface
    postCount
  }

  return (
    <div className="container mx-auto py-10">
      <CategoryForm 
        initialData={categoryData} 
        isEdit={true} 
      />
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}) {
  return {
    title: `Edit Category: ${params.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
  }
}

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { CategoryForm } from '@/components/admin/blog/category-form'

export default async function NewCategoryPage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <CategoryForm />
    </div>
  )
}

export const metadata = {
  title: 'New Category',
  description: 'Create a new blog category',
}

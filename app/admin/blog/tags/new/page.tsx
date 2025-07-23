import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { TagForm } from '@/components/admin/blog/tag-form'

export default async function NewTagPage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <TagForm />
    </div>
  )
}

export const metadata = {
  title: 'New Tag',
  description: 'Create a new blog tag',
}

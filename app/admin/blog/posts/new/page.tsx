import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { BlogPostForm } from '@/components/admin/blog/blog-post-form'
import { prisma } from '@/lib/db'

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <BlogPostForm isEdit={false} />
    </div>
  )
}

export const metadata = {
  title: 'New Blog Post',
}

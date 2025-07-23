import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BlogPostForm } from '@/components/admin/blog/blog-post-form'
import { Post } from '@prisma/client'

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  // Fetch blog post data
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  })

  if (!post) {
    return notFound()
  }

  if (!post) return notFound()

  // Transform post data to match form schema
  const postData = {
    ...post,
    // category is already a string (enum value) in the Post model
    // tags is already a string[] in the Post model, convert to comma-separated string
    tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
    published: post.publishedAt !== null,
  }

  // The BlogPostForm component handles its own category and tag fetching
  // No need to fetch them here as props

  return (
    <div className="container mx-auto py-10">
      <BlogPostForm 
        initialData={postData} 
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
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { title: true },
  })

  return {
    title: `Edit Post: ${post?.title || 'Blog Post'}`,
  }
}

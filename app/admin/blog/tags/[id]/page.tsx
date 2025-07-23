import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TagForm } from '@/components/admin/blog/tag-form'

export default async function EditTagPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  // Fetch tag data
  const tag = await prisma.tag.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })

  if (!tag) {
    notFound()
  }

  // Transform tag data to match form schema
  const tagData = {
    ...tag,
    postCount: tag._count.posts,
  }

  return (
    <div className="container mx-auto py-10">
      <TagForm 
        initialData={tagData} 
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
  const tag = await prisma.tag.findUnique({
    where: { id: params.id },
    select: { name: true },
  })

  return {
    title: `Edit Tag: ${tag?.name || 'Tag'}`,
  }
}

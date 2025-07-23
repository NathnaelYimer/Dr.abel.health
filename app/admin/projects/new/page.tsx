import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { ProjectForm } from '@/components/admin/projects/project-form'

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <ProjectForm />
    </div>
  )
}

export const metadata = {
  title: 'New Project',
}

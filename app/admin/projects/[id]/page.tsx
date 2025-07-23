import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProjectForm } from '@/components/admin/projects/project-form'

export default async function EditProjectPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
    return notFound()
  }

  // Fetch project data
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      teamMembers: true,
      updates: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!project) {
    return notFound()
  }

  // Transform project data to match form schema
  const projectData = {
    ...project,
    startDate: project.startDate ? project.startDate.toISOString() : '',
    endDate: project.endDate ? project.endDate.toISOString() : null,
    milestones: project.milestones || [],
    tasks: project.tasks || [],
    teamMembers: project.teamMembers || [],
  }

  return (
    <div className="container mx-auto py-10">
      <ProjectForm project={projectData} isEdit={true} />
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
  })

  return {
    title: `Edit Project: ${project?.title || 'Project'}`,
  }
}

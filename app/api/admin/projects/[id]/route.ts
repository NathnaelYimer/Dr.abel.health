import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

type ProjectStatus = 'DRAFT' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type ProjectType = 'MATERNAL_CHILD_HEALTH' | 'COMMUNICABLE_DISEASE' | 'NON_COMMUNICABLE_DISEASE' | 'NUTRITION' | 'MENTAL_HEALTH' | 'CLIMATE_CHANGE' | 'CAPACITY_BUILDING' | 'RESEARCH' | 'POLICY' | 'OTHER'

interface ProjectUpdateData {
  title?: string
  description?: string
  content?: string
  type?: ProjectType
  status?: ProjectStatus
  progress?: number
  priority?: Priority
  startDate?: string
  endDate?: string | null
  budget?: number | null
  client?: string | null
  location?: string | null
  impact?: string | null
  beneficiaries?: string | null
  fundingSource?: string | null
  objectives?: string[]
  outcomes?: string[]
  milestones?: any[]
  tasks?: any[]
  partners?: string[]
  coverImage?: string | null
  gallery?: string[]
  documents?: string[]
  featured?: boolean
  published?: boolean
  tags?: string[]
  teamMembers?: Array<{
    id?: string
    name: string
    role: string
    bio?: string | null
    image?: string | null
  }>
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({ req: request } as any)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true, image: true }
        },
        teamMembers: true,
        updates: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, email: true, image: true }
            }
          },
          take: 5
        },
        _count: {
          select: { updates: true }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({ req: request } as any)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data: ProjectUpdateData = await request.json()
    
    // Get existing project to check for changes
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: { teamMembers: true }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Calculate progress based on completed milestones if milestones were updated
    let progress = data.progress
    if (data.milestones && !data.progress) {
      const completedMilestones = data.milestones.filter((m: any) => m.completed).length
      progress = Math.round((completedMilestones / data.milestones.length) * 100)
    }

    // Generate slug if title was changed
    let slug = existingProject.slug
    if (data.title && data.title !== existingProject.title) {
      slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()
    }

    const updatedProject = await prisma.$transaction(async (prisma) => {
      // Update the project
      const project = await prisma.project.update({
        where: { id: params.id },
        data: {
          title: data.title,
          slug,
          description: data.description,
          content: data.content,
          type: data.type,
          status: data.status,
          progress: progress !== undefined ? progress : undefined,
          priority: data.priority,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
          budget: data.budget,
          client: data.client,
          location: data.location,
          impact: data.impact,
          beneficiaries: data.beneficiaries,
          fundingSource: data.fundingSource,
          objectives: data.objectives,
          outcomes: data.outcomes,
          milestones: data.milestones,
          tasks: data.tasks,
          partners: data.partners,
          coverImage: data.coverImage,
          gallery: data.gallery,
          documents: data.documents,
          featured: data.featured,
          published: data.published,
          tags: data.tags,
          updatedById: session.user.id,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, image: true }
          },
          updatedBy: {
            select: { id: true, name: true, email: true, image: true }
          },
          teamMembers: true
        }
      })

      // Update team members if provided
      if (data.teamMembers) {
        // Delete existing team members not in the new list
        const existingMemberIds = data.teamMembers
          .filter(member => member.id)
          .map(member => member.id)
        
        await prisma.teamMember.deleteMany({
          where: {
            projectId: params.id,
            NOT: { id: { in: existingMemberIds as string[] } }
          }
        })

        // Update or create team members
        for (const member of data.teamMembers) {
          if (member.id) {
            // Update existing member
            await prisma.teamMember.update({
              where: { id: member.id },
              data: {
                name: member.name,
                role: member.role,
                bio: member.bio,
                image: member.image
              }
            })
          } else {
            // Create new member
            await prisma.teamMember.create({
              data: {
                projectId: params.id,
                name: member.name,
                role: member.role,
                bio: member.bio,
                image: member.image
              }
            })
          }
        }
      }

      return project
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_PROJECT',
        resource: 'Project',
        details: {
          message: `Updated project: ${updatedProject.title}`,
          projectId: updatedProject.id,
          projectTitle: updatedProject.title
        },
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({ req: request } as any)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, title: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete the project (cascading deletes will handle related records)
    await prisma.project.delete({
      where: { id: params.id }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_PROJECT',
        resource: 'Project',
        details: {
          message: `Deleted project: ${project.title}`,
          projectId: project.id,
          projectTitle: project.title
        },
      },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

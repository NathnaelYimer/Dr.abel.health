import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

type ProjectStatus = 'DRAFT' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'

interface ProjectUpdateData {
  title: string
  description: string
  status: ProjectStatus
  progress: number
  challenges?: string
  nextSteps?: string
  attachments?: string[]
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [updates, total] = await Promise.all([
      prisma.projectUpdate.findMany({
        where: { projectId: params.projectId },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, image: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.projectUpdate.count({ 
        where: { projectId: params.projectId } 
      })
    ])

    return NextResponse.json({
      data: updates,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching project updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project updates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
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
    
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      select: { id: true, title: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const update = await prisma.$transaction(async (prisma) => {
      // Create the project update
      const newUpdate = await prisma.projectUpdate.create({
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          progress: data.progress,
          challenges: data.challenges,
          nextSteps: data.nextSteps,
          attachments: data.attachments || [],
          projectId: params.projectId,
          createdById: session.user.id,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, image: true }
          }
        }
      })

      // Update the project's status and progress if changed
      await prisma.project.update({
        where: { id: params.projectId },
        data: {
          status: data.status,
          progress: data.progress,
          updatedById: session.user.id,
        }
      })

      return newUpdate
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PROJECT_UPDATE',
        resource: 'ProjectUpdate',
        details: {
          message: `Added update to project: ${project.title}`,
          projectId: project.id,
          projectTitle: project.title,
          updateId: update.id
        },
      },
    })

    return NextResponse.json(update, { status: 201 })
  } catch (error) {
    console.error('Error creating project update:', error)
    return NextResponse.json(
      { error: 'Failed to create project update', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

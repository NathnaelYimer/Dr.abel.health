import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ProjectStatus = 'DRAFT' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'

interface UpdateProjectUpdateData {
  title?: string
  description?: string
  status?: ProjectStatus
  progress?: number
  challenges?: string | null
  nextSteps?: string | null
  attachments?: string[]
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; updateId: string } }
) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const update = await prisma.projectUpdate.findUnique({
      where: { 
        id: params.updateId,
        projectId: params.projectId
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true }
        },
        project: {
          select: { id: true, title: true }
        }
      }
    })

    if (!update) {
      return NextResponse.json({ error: 'Project update not found' }, { status: 404 })
    }

    return NextResponse.json(update)
  } catch (error) {
    console.error('Error fetching project update:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project update', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string; updateId: string } }
) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data: UpdateProjectUpdateData = await request.json()
    
    // Verify project and update exist
    const [project, existingUpdate] = await Promise.all([
      prisma.project.findUnique({
        where: { id: params.projectId },
        select: { id: true, title: true }
      }),
      prisma.projectUpdate.findUnique({
        where: { 
          id: params.updateId,
          projectId: params.projectId
        },
        select: { id: true, title: true }
      })
    ])

    if (!project || !existingUpdate) {
      return NextResponse.json({ error: 'Project or update not found' }, { status: 404 })
    }

    const updatedUpdate = await prisma.$transaction(async (prisma) => {
      // Update the project update
      const update = await prisma.projectUpdate.update({
        where: { 
          id: params.updateId,
          projectId: params.projectId
        },
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          progress: data.progress,
          challenges: data.challenges,
          nextSteps: data.nextSteps,
          attachments: data.attachments,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, image: true }
          },
          project: {
            select: { id: true, title: true }
          }
        }
      })

      // If status or progress was updated, also update the project
      if (data.status !== undefined || data.progress !== undefined) {
        await prisma.project.update({
          where: { id: params.projectId },
          data: {
            status: data.status,
            progress: data.progress,
            updatedById: session.user.id,
          }
        })
      }

      return update
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_PROJECT_UPDATE',
        resource: 'ProjectUpdate',
        details: {
          message: `Updated update for project: ${project.title}`,
          projectId: project.id,
          projectTitle: project.title,
          updateId: updatedUpdate.id
        },
      },
    })

    return NextResponse.json(updatedUpdate)
  } catch (error) {
    console.error('Error updating project update:', error)
    return NextResponse.json(
      { error: 'Failed to update project update', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; updateId: string } }
) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify project and update exist
    const [project, update] = await Promise.all([
      prisma.project.findUnique({
        where: { id: params.projectId },
        select: { id: true, title: true }
      }),
      prisma.projectUpdate.findUnique({
        where: { 
          id: params.updateId,
          projectId: params.projectId
        },
        select: { id: true, title: true }
      })
    ])

    if (!project || !update) {
      return NextResponse.json({ error: 'Project or update not found' }, { status: 404 })
    }

    // Delete the update
    await prisma.projectUpdate.delete({
      where: { 
        id: params.updateId,
        projectId: params.projectId
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_PROJECT_UPDATE',
        resource: 'ProjectUpdate',
        details: {
          message: `Deleted update from project: ${project.title}`,
          projectId: project.id,
          projectTitle: project.title,
          updateId: update.id
        },
      },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting project update:', error)
    return NextResponse.json(
      { error: 'Failed to delete project update', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

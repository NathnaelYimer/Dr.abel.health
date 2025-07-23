import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

type ProjectStatus = 'DRAFT' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type ProjectType = 'MATERNAL_CHILD_HEALTH' | 'COMMUNICABLE_DISEASE' | 'NON_COMMUNICABLE_DISEASE' | 'NUTRITION' | 'MENTAL_HEALTH' | 'CLIMATE_CHANGE' | 'CAPACITY_BUILDING' | 'RESEARCH' | 'POLICY' | 'OTHER'

type Milestone = {
  title: string
  dueDate: string
  completed: boolean
  description?: string
}

type Task = {
  id: string
  title: string
  completed: boolean
  assignedTo?: string
  dueDate?: string
}

interface ProjectCreateData {
  title: string
  description: string
  content: string
  type: ProjectType
  status?: ProjectStatus
  progress?: number
  priority?: Priority
  startDate: string
  endDate?: string
  budget?: number
  client?: string
  location?: string
  impact?: string
  beneficiaries?: string
  fundingSource?: string
  objectives: string[]
  outcomes: string[]
  milestones?: Milestone[]
  tasks?: Task[]
  partners: string[]
  coverImage?: string
  gallery?: string[]
  documents?: string[]
  featured?: boolean
  published?: boolean
  tags?: string[]
  teamMembers?: Array<{
    name: string
    role: string
    bio?: string
    image?: string
  }>
}

export async function GET(request: Request) {
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
    const status = searchParams.get('status') as ProjectStatus | null
    const type = searchParams.get('type') as ProjectType | null
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, image: true }
          },
          updatedBy: {
            select: { id: true, name: true, email: true, image: true }
          },
          teamMembers: true,
          _count: {
            select: { teamMembers: true, updates: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count({ where })
    ])

    return NextResponse.json({
      data: projects,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const data: ProjectCreateData = await request.json()
    
    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()

    // Calculate progress based on completed milestones if not provided
    const progress = data.progress ?? (data.milestones?.length 
      ? Math.round((data.milestones.filter(m => m.completed).length / data.milestones.length) * 100)
      : 0)

    const project = await prisma.$transaction(async (prisma) => {
      // Create the project
      const project = await prisma.project.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          content: data.content,
          type: data.type,
          status: data.status || 'DRAFT',
          progress,
          priority: data.priority || 'MEDIUM',
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          budget: data.budget,
          client: data.client,
          location: data.location,
          impact: data.impact,
          beneficiaries: data.beneficiaries,
          fundingSource: data.fundingSource,
          objectives: data.objectives,
          outcomes: data.outcomes,
          milestones: data.milestones || [],
          tasks: data.tasks || [],
          partners: data.partners || [],
          coverImage: data.coverImage,
          gallery: data.gallery || [],
          documents: data.documents || [],
          featured: data.featured || false,
          published: data.published || false,
          tags: data.tags || [],
          createdById: session.user.id,
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

      // Create team members if provided
      if (data.teamMembers && data.teamMembers.length > 0) {
        await prisma.teamMember.createMany({
          data: data.teamMembers.map(member => ({
            projectId: project.id,
            name: member.name,
            role: member.role,
            bio: member.bio,
            image: member.image
          }))
        })
      }

      // Create initial project update if milestones or tasks are provided
      if (data.milestones?.length || data.tasks?.length) {
        await prisma.projectUpdate.create({
          data: {
            title: 'Project Kickoff',
            description: 'Initial project setup with goals and milestones.',
            progress: progress,
            status: project.status,
            projectId: project.id,
            createdById: session.user.id,
          }
        })
      }

      return project
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PROJECT',
        resource: 'Project',
        details: {
          message: `Created project: ${project.title}`,
          projectId: project.id,
          projectTitle: project.title
        }
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

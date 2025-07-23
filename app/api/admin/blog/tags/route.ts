import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Tag } from '@prisma/client'

type TagWithCount = Tag & {
  _count: {
    posts: number
  }
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user && ['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')
  return { session, isAdmin }
}

// GET /api/admin/blog/tags - List all tags with pagination
export async function GET(request: Request) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // Get tags with post counts
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { name: 'asc' },
      }) as Promise<TagWithCount[]>,
      prisma.tag.count({ where }),
    ])

    // Transform data for the frontend
    const data = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      postCount: tag._count?.posts || 0,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    }))

    const response: PaginatedResponse<typeof data[number]> = {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blog/tags - Create a new tag
export async function POST(request: Request) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, slug, description } = await request.json()

    // Validate input
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if tag with same slug already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this slug already exists' },
        { status: 400 }
      )
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/blog/tags - Update a tag
export async function PUT(request: Request) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, slug, description } = await request.json()

    // Validate input
    if (!id || !name || !slug) {
      return NextResponse.json(
        { error: 'ID, name, and slug are required' },
        { status: 400 }
      )
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and if new slug already exists
    if (slug !== existingTag.slug) {
      const slugExists = await prisma.tag.findUnique({
        where: { slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A tag with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update tag
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
      },
    })

    return NextResponse.json(updatedTag)
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blog/tags - Delete a tag
export async function DELETE(request: Request) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      )
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if tag is in use
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tag that is in use by posts' },
        { status: 400 }
      )
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

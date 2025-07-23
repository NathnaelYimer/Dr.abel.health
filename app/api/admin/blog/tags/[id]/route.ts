import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-ignore - tag model is dynamically added by Prisma
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Transform data for the frontend
    const data = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      postCount: tag._count?.posts || 0,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching tag:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
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

    // Check if tag exists
    // @ts-ignore - tag model is dynamically added by Prisma
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Check if another tag with the same slug exists
    // @ts-ignore - tag model is dynamically added by Prisma
    const slugConflict = await prisma.tag.findFirst({
      where: {
        slug,
        NOT: {
          id: params.id,
        },
      },
    })

    if (slugConflict) {
      return NextResponse.json(
        { error: 'A tag with this slug already exists' },
        { status: 400 }
      )
    }

    // Update tag
    // @ts-ignore - tag model is dynamically added by Prisma
    const updatedTag = await prisma.tag.update({
      where: { id: params.id },
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if tag exists
    // @ts-ignore - tag model is dynamically added by Prisma
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Check if tag is in use
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tag that is in use by posts' },
        { status: 400 }
      )
    }

    // Delete tag
    // @ts-ignore - tag model is dynamically added by Prisma
    await prisma.tag.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

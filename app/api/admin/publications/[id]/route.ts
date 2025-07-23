import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    // Get publication by ID
    const publication = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    })

    if (!publication) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(publication)
  } catch (error) {
    console.error('Error fetching publication:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publication' },
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()
    
    // Get current publication to check if we need to update publishedAt
    const currentPublication = await prisma.post.findUnique({
      where: { id: params.id }
    })

    // Update publication
    const updatedPublication = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
        featuredImage: data.featuredImage,
        published: data.published,
        publishedAt: data.published && !currentPublication?.publishedAt ? new Date() : currentPublication?.publishedAt,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt?.substring(0, 160) || '',
      }
    })

    return NextResponse.json(updatedPublication)
  } catch (error) {
    console.error('Error updating publication:', error)
    return NextResponse.json(
      { error: 'Failed to update publication' },
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete publication
    await prisma.post.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting publication:', error)
    return NextResponse.json(
      { error: 'Failed to delete publication' },
      { status: 500 }
    )
  }
}

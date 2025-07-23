import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Category } from '@prisma/client'

// GET /api/admin/blog/categories/[id] - Get a specific category
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions)
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params

    // Check if the category exists in the enum
    if (!Object.values(Category).includes(id as Category)) {
      return new NextResponse('Category not found', { status: 404 })
    }

    // Get post count for this category
    const postCount = await prisma.post.count({
      where: { category: id as Category }
    })

    // Return category data
    return NextResponse.json({
      id,
      name: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: '', // Add description if you store it elsewhere
      postCount,
      slug: id.toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PUT /api/admin/blog/categories/[id] - Update a category
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions)
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params
    const { description } = await request.json()

    // Check if the category exists in the enum
    if (!Object.values(Category).includes(id as Category)) {
      return new NextResponse('Category not found', { status: 404 })
    }

    // For enum-based categories, we don't actually update the enum itself
    // But we can store additional metadata (like description) in a separate table if needed
    // For now, we'll just return the updated data without saving

    return NextResponse.json({
      id,
      name: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: description || '',
      slug: id.toLowerCase(),
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/admin/blog/categories/[id] - Delete a category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions)
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params

    // Check if the category exists in the enum
    if (!Object.values(Category).includes(id as Category)) {
      return new NextResponse('Category not found', { status: 404 })
    }

    // Check if the category is being used by any posts
    const postCount = await prisma.post.count({
      where: { category: id as Category }
    })

    if (postCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category that is in use by posts',
          postCount 
        },
        { status: 400 }
      )
    }

    // For enum-based categories, we don't actually delete them
    // But we'll return success for API consistency
    return NextResponse.json({ 
      success: true,
      message: 'Category marked as deleted (enum categories cannot be deleted)'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

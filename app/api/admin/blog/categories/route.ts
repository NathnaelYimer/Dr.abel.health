import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Category } from '@prisma/client'

// GET /api/admin/blog/categories - Get all categories with pagination
export async function GET(request: Request) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions)
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Get all valid category values from the enum
    const allCategories = Object.values(Category)
    
    // Filter categories based on search query
    const filteredCategories = allCategories
      .filter(category => 
        category.toLowerCase().includes(search.toLowerCase()) ||
        category.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase())
      )
      .map(category => ({
        id: category,
        name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        slug: category.toLowerCase(),
        description: '', // Add description if you store it elsewhere
        postCount: 0, // Will be updated below
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

    // Get post counts for each category
    const categoriesWithCounts = await Promise.all(
      filteredCategories.map(async (category) => {
        const postCount = await prisma.post.count({
          where: { category: category.id as Category }
        })
        return { ...category, postCount }
      })
    )

    // Implement pagination
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedCategories = categoriesWithCounts.slice(startIndex, endIndex)

    return NextResponse.json({
      data: paginatedCategories,
      pagination: {
        total: filteredCategories.length,
        page,
        limit,
        totalPages: Math.ceil(filteredCategories.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/admin/blog/categories - Create a new category (not used for enums, but kept for API consistency)
export async function POST(request: Request) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions)
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // For enum-based categories, we don't actually create new ones
    // But we'll keep this for API consistency
    return NextResponse.json(
      { error: 'Categories are managed as an enum and cannot be created via API' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error creating category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

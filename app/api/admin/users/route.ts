import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const roleFilter = searchParams.get('role')
    const searchQuery = searchParams.get('q') || ''

    // Build the where clause
    const where: any = {}
    
    if (statusFilter) where.status = statusFilter
    if (roleFilter) where.role = roleFilter
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
      ]
    }

    // Fetch users with related data
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        status: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'No Name',
      email: user.email || 'No Email',
      role: user.role,
      status: user.status || (user.emailVerified ? 'ACTIVE' : 'PENDING'),
      emailVerified: !!user.emailVerified,
      lastActive: user.lastActive || user.updatedAt,
      joined: user.createdAt,
      posts: user._count.posts,
      comments: user._count.comments,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

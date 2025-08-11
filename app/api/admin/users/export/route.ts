import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'ADMIN' || 
      ['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const formatType = searchParams.get('format') || 'json'
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    // Build the where clause
    const where: any = {}
    if (role) where.role = role
    if (status) where.status = status

    // Get users with related data
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
        bio: true,
        location: true,
        website: true,
        twitter: true,
        linkedin: true,
        github: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
            bookmarks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format the data for export
    const formattedData = users.map((user: any) => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified ? 'Yes' : 'No',
      lastActive: user.lastActive ? new Date(user.lastActive).toISOString() : 'Never',
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      twitter: user.twitter || '',
      linkedin: user.linkedin || '',
      github: user.github || '',
      postsCount: user._count.posts,
      commentsCount: user._count.comments,
      likesCount: user._count.likes,
      bookmarksCount: user._count.bookmarks
    }))

    // Return data in requested format
    if (formatType.toLowerCase() === 'csv') {
      // Create CSV content manually
      const headers = Object.keys(formattedData[0] || {})
      const csvContent = [
        headers.join(','),
        ...formattedData.map((row: any) => 
          headers.map(header => {
            const value = row[header]
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          }).join(',')
        )
      ].join('\n')

      // Create a response with CSV content
      const response = new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.csv`
        }
      })

      return response
    }

    // Default to JSON format
    return NextResponse.json({
      data: formattedData,
      meta: {
        exportedAt: new Date().toISOString(),
        total: formattedData.length,
        filters: { role, status }
      }
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Failed to export users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

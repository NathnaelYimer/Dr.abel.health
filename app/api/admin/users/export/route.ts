import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { createObjectCsvStringifier } from 'csv-writer'

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

    // Get format from query params (default to CSV)
    const { searchParams } = new URL(request.url)
    const formatType = searchParams.get('format')?.toUpperCase() || 'CSV'
    const statusFilter = searchParams.get('status')
    const roleFilter = searchParams.get('role')

    // Get users with filters and counts
    const users = await prisma.$queryRaw`
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM "Post" p WHERE p."authorId" = u.id) as "postCount",
        (SELECT COUNT(*) FROM "Comment" c WHERE c."authorId" = u.id) as "commentCount"
      FROM "User" u
      WHERE 
        (${statusFilter}::text IS NULL OR u.status = ${statusFilter}::"UserStatus")
        AND (${roleFilter}::text IS NULL OR u.role = ${roleFilter}::"Role")
      ORDER BY u."createdAt" DESC
    ` as any[]

    // Format data for export
    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      status: user.status,
      email_verified: user.emailVerified ? 'Yes' : 'No',
      join_date: format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm'),
      last_active: format(new Date(user.updatedAt), 'yyyy-MM-dd HH:mm'),
      post_count: Number(user.postCount) || 0,
      comment_count: Number(user.commentCount) || 0,
    }))

    if (formatType === 'JSON') {
      return new NextResponse(JSON.stringify(formattedUsers, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="users_export.json"',
        },
      })
    }

    // Default to CSV
    const csv = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'role', title: 'Role' },
        { id: 'status', title: 'Status' },
        { id: 'email_verified', title: 'Email Verified' },
        { id: 'join_date', title: 'Join Date' },
        { id: 'last_active', title: 'Last Active' },
        { id: 'post_count', title: 'Posts' },
        { id: 'comment_count', title: 'Comments' },
      ],
    })

    const csvData = csv.getHeaderString() + csv.stringifyRecords(formattedUsers)

    // Log the export
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'EXPORT_USERS',
        resource: 'User',
        details: JSON.stringify({
          message: `Exported ${formattedUsers.length} users as ${formatType}`,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }),
      },
    })

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="users_export.csv"',
      },
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    )
  }
}

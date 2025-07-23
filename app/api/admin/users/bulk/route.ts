import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
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

    const { action, userIds, data } = await request.json()

    // Validate input
    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Prevent modifying self in bulk actions
    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'Cannot modify your own account in bulk actions' },
        { status: 400 }
      )
    }

    let result
    let details = ''

    switch (action) {
      case 'UPDATE_ROLE':
        if (!data?.role) {
          return NextResponse.json(
            { error: 'Role is required' },
            { status: 400 }
          )
        }
        
        // Prevent removing last admin
        if (data.role !== 'ADMIN') {
          const adminCount = await prisma.user.count({
            where: { 
              role: 'ADMIN',
              id: { notIn: userIds } // Exclude users being modified
            }
          })
          
          // Check if we're trying to demote all admins
          const currentAdmins = await prisma.user.count({
            where: { 
              id: { in: userIds },
              role: 'ADMIN'
            }
          })
          
          if (adminCount === 0 && currentAdmins > 0) {
            return NextResponse.json(
              { error: 'At least one admin must remain' },
              { status: 400 }
            )
          }
        }

        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { role: data.role },
        })
        details = `Updated role to ${data.role} for ${result.count} users`
        break

      case 'UPDATE_STATUS':
        if (!data?.status) {
          return NextResponse.json(
            { error: 'Status is required' },
            { status: 400 }
          )
        }

        // Prevent deactivating all admins
        if (data.status === 'INACTIVE') {
          const adminCount = await prisma.user.count({
            where: { 
              role: 'ADMIN',
              status: 'ACTIVE',
              id: { notIn: userIds } // Exclude users being modified
            }
          })
          
          // Check if we're trying to deactivate all admins
          const currentAdmins = await prisma.user.count({
            where: { 
              id: { in: userIds },
              role: 'ADMIN',
              status: 'ACTIVE'
            }
          })
          
          if (adminCount === 0 && currentAdmins > 0) {
            return NextResponse.json(
              { error: 'At least one active admin must remain' },
              { status: 400 }
            )
          }
        }

        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { 
            status: data.status,
            ...(data.status === 'INACTIVE' && {
              sessions: {
                deleteMany: {}
              }
            })
          },
        })
        details = `Updated status to ${data.status} for ${result.count} users`
        break

      case 'SEND_EMAIL':
        // In a real app, this would trigger an email sending service
        details = `Email queued for ${userIds.length} users`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Log the bulk action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `BULK_${action}`,
        resource: 'User',
        details: JSON.stringify({
          targetIds: userIds,
          ...(details && { message: details }),
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }),
      },
    })

    return NextResponse.json({ success: true, message: details })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { status } = await request.json()
    
    // Validate status
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Prevent deactivating last admin
    if (status === 'INACTIVE') {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        select: { role: true }
      })
      
      if (user?.role === 'ADMIN') {
        const adminCount = await prisma.user.count({
          where: { 
            role: 'ADMIN',
            status: 'ACTIVE'
          }
        })
        
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot deactivate the last active admin' },
            { status: 400 }
          )
        }
      }
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { 
        status,
        // Clear refresh tokens if deactivating
        ...(status === 'INACTIVE' && {
          sessions: {
            deleteMany: {}
          }
        })
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_USER_STATUS',
        resource: 'User',
        details: JSON.stringify({
          targetUserId: params.id,
          status: status,
          message: `Updated user status to ${status}`,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }),
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}

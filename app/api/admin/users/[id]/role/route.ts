import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { type Role } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { activityLog } from '@/lib/activity-log'
import { hasPermission, canManageUsers, ROLE_HIERARCHY } from '@/lib/rbac'
import type { UserStatus } from '@prisma/client'

interface UserWithRole {
  id: string
  role: Role
  status: UserStatus
  email: string | null
  name: string | null
  lastActive: Date | null
  createdAt: Date
  updatedAt: Date
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow users with permission to manage users
    if (!session.user.role || !hasPermission(session.user as any, 'users:update')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Validate request body
    const { role } = await request.json()

    // Validate role
    if (!(role in ROLE_HIERARCHY)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }
    
    // Type assertion after validation
    const newRole = role as Role

    // Don't allow changing your own role
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }
    
    // Prepare user object for permission check
    const currentUser = {
      role: session.user.role as Role,
      status: 'ACTIVE' as UserStatus
    }
    
    // Check if user has permission to assign this role
    if (!canManageUsers(currentUser, newRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to assign this role' },
        { status: 403 }
      )
    }

    // Check if the target user exists and get their current role
    // Fetch the target user with required fields
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { 
        id: true, 
        role: true, 
        email: true,
        status: true,
        name: true
      }
    }) as UserWithRole | null

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if target user is the last admin
    if (['ADMIN', 'SUPER_ADMIN'].includes(targetUser.role)) {
      // Get admin roles that can manage users
      const adminRoles = Object.entries(ROLE_HIERARCHY)
        .filter(([_, weight]) => weight >= (ROLE_HIERARCHY.ADMIN || 0))
        .map(([role]) => role as Role);
        
      const adminCount = await prisma.user.count({
        where: {
          AND: [
            { role: { in: adminRoles } },
            { status: 'ACTIVE' as const },
            { id: { not: targetUser.id } } // Exclude the current user from the count
          ]
        }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last admin/super admin' },
          { status: 400 }
        )
      }
    }

    // Prepare update data with proper type safety
    const updateData: { role: Role; status?: UserStatus } = {
      role: newRole,
    };
    
    // If promoting to admin, ensure account is active
    // If demoting from admin, ensure user remains active
    const isPromotingToAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(newRole);
    const isDemotingFromAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(targetUser.role) && 
                              !['ADMIN', 'SUPER_ADMIN'].includes(newRole);
    
    if ((isPromotingToAdmin && targetUser.status !== 'ACTIVE') || isDemotingFromAdmin) {
      updateData.status = 'ACTIVE' as UserStatus;
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true
      }
    }) as unknown as UserWithRole // Double assertion to handle Prisma's generated types

    // Log activity
    await activityLog.user.roleChanged(
      session.user.id,
      targetUser.id,
      targetUser.email || 'unknown',
      targetUser.role,
      newRole
    )

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

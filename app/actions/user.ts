'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Role, UserStatus } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canManageUsers } from '@/lib/rbac'

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Get target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true }
  })

  if (!targetUser) {
    throw new Error('User not found')
  }

  // Check if current user can manage target user's role
  if (!canManageUsers(
    { role: session.user.role as Role, status: session.user.status as UserStatus },
    targetUser.role as Role
  )) {
    throw new Error('Insufficient permissions')
  }

  // Update user role
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function updateUserStatus(userId: string, newStatus: UserStatus) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Get target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true }
  })

  if (!targetUser) {
    throw new Error('User not found')
  }

  // Check if current user can manage target user
  if (!canManageUsers(
    { role: session.user.role as Role, status: session.user.status as UserStatus },
    targetUser.role as Role
  )) {
    throw new Error('Insufficient permissions')
  }

  // Prevent users from modifying their own status
  if (session.user.id === userId) {
    throw new Error('Cannot modify your own status')
  }

  // Update user status
  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus }
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Prevent users from deleting themselves
  if (session.user.id === userId) {
    throw new Error('Cannot delete your own account')
  }

  // Get target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true }
  })

  if (!targetUser) {
    throw new Error('User not found')
  }

  // Check if current user can manage target user
  if (!canManageUsers(
    { role: session.user.role as Role, status: session.user.status as UserStatus },
    targetUser.role as Role
  )) {
    throw new Error('Insufficient permissions')
  }

  // Delete user (this will cascade to related records due to Prisma's referential actions)
  await prisma.user.delete({
    where: { id: userId }
  })

  revalidatePath('/admin/users')
  return { success: true }
}

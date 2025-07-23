import { Role, UserStatus } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
      status: UserStatus
    }
  }
  interface User {
    role: Role
    status: UserStatus
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    status: UserStatus
  }
}

// Define permissions for each role
export type RolePermissionsType = {
  [key in Role]: Permission[]
}

export const RolePermissions: RolePermissionsType = {
  SUPER_ADMIN: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'posts:read',
    'posts:create',
    'posts:update',
    'posts:delete',
    'settings:read',
    'settings:update',
    'analytics:read',
  ],
  ADMIN: [
    'users:read',
    'users:create',
    'users:update',
    'posts:read',
    'posts:create',
    'posts:update',
    'posts:delete',
    'analytics:read',
  ],
  EDITOR: [
    'posts:read',
    'posts:create',
    'posts:update',
    'analytics:read',
  ],
  AUTHOR: [
    'posts:read',
    'posts:create',
    'posts:update:own',
    'analytics:read:own',
  ],
  CONTRIBUTOR: [
    'posts:read',
    'posts:create:draft',
    'posts:update:own',
  ],
  VIEWER: [
    'posts:read',
  ],
} as const

export type Permission = typeof RolePermissions[keyof typeof RolePermissions][number]

export const hasPermission = (userRole: Role, permission: Permission): boolean => {
  const permissions = RolePermissions[userRole as keyof typeof RolePermissions] || []
  return permissions.includes(permission)
}

// Helper function to get all roles except higher ones
export function getAssignableRoles(userRole: Role): Role[] {
  const allRoles: Role[] = Object.keys(RolePermissions) as Role[]
  const currentRoleIndex = allRoles.indexOf(userRole)
  
  // Return all roles that are at or below the current user's role
  return allRoles.slice(currentRoleIndex)
}

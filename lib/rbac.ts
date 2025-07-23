import { Role, UserStatus } from '@prisma/client'
import { rolePermissions } from '../types/auth'

type Permission = string // Define a more specific type if needed

// Define assignable roles mapping
const assignableRoles: Record<Role, Role[]> = {
  [Role.SUPER_ADMIN]: Object.values(Role),
  [Role.ADMIN]: [Role.EDITOR, Role.AUTHOR, Role.CONTRIBUTOR, Role.VIEWER],
  [Role.EDITOR]: [Role.AUTHOR, Role.CONTRIBUTOR, Role.VIEWER],
  [Role.AUTHOR]: [Role.CONTRIBUTOR, Role.VIEWER],
  [Role.CONTRIBUTOR]: [Role.VIEWER],
  [Role.VIEWER]: []
}

function getAssignableRoles(role: Role): Role[] {
  return assignableRoles[role] || []
}

// Re-export Role enum for convenience
export { Role }

// Role hierarchy with weights for comparison
type RoleHierarchy = Record<Role, number>

// Create a type-safe role hierarchy with all required roles
const roleHierarchy = {
  [Role.SUPER_ADMIN]: 6,
  [Role.ADMIN]: 5,
  [Role.EDITOR]: 4,
  [Role.AUTHOR]: 3,
  [Role.CONTRIBUTOR]: 2,
  [Role.VIEWER]: 1,
} as const

export const ROLE_HIERARCHY: RoleHierarchy = roleHierarchy as RoleHierarchy

// Get role values as array
export const ROLES: Role[] = Object.values(Role)

// User status values
export const USER_STATUSES: UserStatus[] = Object.values(UserStatus)

// Export UserStatus type
export type { UserStatus }

export type UserWithRole = {
  role: Role
  status: UserStatus
}

export type UserWithPermissions = UserWithRole & {
  permissions: Set<string>
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: UserWithRole, permission: string): boolean {
  // Inactive users have no permissions
  if (user.status !== UserStatus.ACTIVE) return false
  
  // Get permissions for the user's role
  const userPermissions = rolePermissions[user.role]?.permissions || []
  return userPermissions.includes(permission) || userPermissions.includes('*')
}

/**
 * Check if a user can manage another user with the target role
 */
export function canManageUsers(currentUser: UserWithRole, targetRole: Role): boolean {
  // Only active users can manage others
  if (currentUser.status !== UserStatus.ACTIVE) return false
  
  // Users can't manage themselves (handled by role comparison)
  if (currentUser.role === targetRole) return false
  
  // Check role hierarchy
  return ROLE_HIERARCHY[currentUser.role] > ROLE_HIERARCHY[targetRole]
}

/**
 * Get all roles that a user can assign to others
 */
export function getAssignableUserRoles(user: UserWithRole): Role[] {
  if (user.status !== UserStatus.ACTIVE) return []
  return getAssignableRoles(user.role)
}

/**
 * Check if a user can update another user's status
 */
export function canUpdateUserStatus(
  currentUser: UserWithRole,
  targetUser: UserWithRole,
  newStatus: UserStatus
): boolean {
  // Only active users can update status
  if (currentUser.status !== UserStatus.ACTIVE) return false
  
  // Users can't update their own status
  if (currentUser === targetUser) return false
  
  // Only allow status changes for users with lower or equal role
  if (ROLE_HIERARCHY[currentUser.role] <= ROLE_HIERARCHY[targetUser.role]) {
    return false
  }
  
  // Additional business rules can be added here
  // For example, prevent setting status to SUSPENDED for certain roles
  if (newStatus === UserStatus.SUSPENDED && targetUser.role === Role.SUPER_ADMIN) {
    return false
  }
  
  return true
}

/**
 * Check if a user can delete another user
 */
export function canDeleteUser(
  currentUser: UserWithRole,
  targetUser: UserWithRole
): boolean {
  // Only active users can delete others
  if (currentUser.status !== UserStatus.ACTIVE) return false
  
  // Users can't delete themselves
  if (currentUser === targetUser) return false
  
  // Check role hierarchy - must be higher in hierarchy
  return ROLE_HIERARCHY[currentUser.role] > ROLE_HIERARCHY[targetUser.role]
}

/**
 * Get a user's permissions as a Set
 */
export function getUserPermissions(user: UserWithRole): Set<Permission> {
  const permissions = new Set<Permission>()
  
  if (user.status !== UserStatus.ACTIVE) {
    return permissions
  }
  
  // Add permissions based on role
  // This comes from the RolePermissions defined in auth.d.ts
  const rolePermissions = RolePermissions[user.role] || []
  return new Set<string>(rolePermissions)
}

/**
 * Create a user object with permissions
 */
export function createUserWithPermissions(user: UserWithRole): UserWithPermissions {
  return {
    ...user,
    permissions: getUserPermissions(user)
  }
}

export function getRoleBadgeVariant(role: Role) {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'destructive'
    case 'ADMIN':
      return 'default'
    case 'EDITOR':
      return 'secondary'
    case 'AUTHOR':
      return 'outline'
    case 'CONTRIBUTOR':
      return 'outline'
    case 'VIEWER':
      return 'outline'
    default:
      return 'outline'
  }
}

export function getStatusBadgeVariant(status: UserStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'ACTIVE':
      return 'default'
    case 'INACTIVE':
      return 'secondary'
    case 'PENDING':
      return 'outline'
    case 'SUSPENDED':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function getRoleDescription(role: Role): string {
  const descriptions = {
    SUPER_ADMIN: 'Full system access and administration',
    ADMIN: 'Administrative access to manage content and users',
    EDITOR: 'Can create, edit, and publish all content',
    AUTHOR: 'Can create and edit their own content',
    CONTRIBUTOR: 'Can submit content for review',
    VIEWER: 'Can view published content only',
  }
  return descriptions[role] || 'No description available'
}

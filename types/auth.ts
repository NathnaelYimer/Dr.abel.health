import { Role } from '@prisma/client';

type Permission = string;

export interface RolePermissions {
  [key: string]: {
    permissions: Permission[];
    description: string;
  };
}

// Define permissions for each role
export const rolePermissions: RolePermissions = {
  [Role.SUPER_ADMIN]: {
    permissions: ['*'],
    description: 'Full access to all features and settings',
  },
  [Role.ADMIN]: {
    permissions: [
      'manage:users',
      'manage:content',
      'manage:settings',
      'view:analytics',
    ],
    description: 'Can manage users, content, and settings',
  },
  [Role.EDITOR]: {
    permissions: [
      'manage:content',
      'publish:content',
      'view:analytics',
    ],
    description: 'Can create, edit, and publish content',
  },
  [Role.AUTHOR]: {
    permissions: [
      'create:content',
      'edit:own-content',
    ],
    description: 'Can create and edit their own content',
  },
  [Role.CONTRIBUTOR]: {
    permissions: [
      'create:content',
    ],
    description: 'Can create content that requires review',
  },
  [Role.VIEWER]: {
    permissions: [
      'view:content',
    ],
    description: 'Can view published content',
  },
};

export type { Permission };

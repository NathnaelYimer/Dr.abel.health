import { Role, UserStatus } from '@prisma/client'

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: Role
    bio?: string | null
    status: UserStatus
    lastActive?: Date | null
    emailVerified?: Date | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
      bio?: string | null
      status: UserStatus
      lastActive?: Date | null
      emailVerified?: Date | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: Role
    bio?: string | null
    status: UserStatus
    lastActive?: Date | null
    emailVerified?: Date | null
  }
}

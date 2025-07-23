import "better-auth"

declare module "better-auth" {
  interface User {
    id: string
    email: string
    emailVerified: boolean
    name: string
    image?: string | null
    role?: string
    bio?: string
    createdAt?: Date
    updatedAt?: Date
  }

  interface Session {
    user: User
  }
}

declare module "next-auth" {
  interface User {
    id: string
    email: string
    emailVerified: boolean
    name: string
    image?: string | null
    role?: string
    bio?: string
    createdAt?: Date
    updatedAt?: Date
  }

  interface Session {
    user: User
  }
}

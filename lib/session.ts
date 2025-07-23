import { auth, type Session } from '@/lib/auth-config'
import { Role } from '@prisma/client'

// Define the shape of the user in the session
type SessionUser = {
  id: string
  email: string
  name: string | null
  role: Role
  bio: string | null
  status?: string
  emailVerified?: Date | null
  image?: string | null
  lastActive?: Date | null
}

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
      query: { disableCookieCache: true }
    })
    
    if (!session?.user) return null
    
    return {
      user: session.user as unknown as SessionUser,
      expires: session.session?.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // Default to 1 week if not available
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export type { Session }

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

export async function requireSession() {
  const session = await getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireSession()
  if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Admin privileges required')
  }
  return session
}

export async function requireSuperAdmin() {
  const session = await requireSession()
  if (session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Super admin privileges required')
  }
  return session
}

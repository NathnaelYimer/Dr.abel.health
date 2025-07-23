import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { authOptions } from "@/lib/auth-options"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/admin',
    '/settings',
    '/profile'
  ]
  
  // Admin-only routes
  const adminRoutes = [
    '/admin'
  ]
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  if (isProtectedRoute) {
    try {
      // Get token using NextAuth
      const token = await getToken({ req: request })

      // If no token, redirect to signin
      if (!token) {
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
      }

      // Check admin access for admin routes
      if (isAdminRoute) {
        const isAdmin = token.role === 'ADMIN' || 
          ['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(token.email || '')
        
        if (!isAdmin) {
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
      }

      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/error', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/settings/:path*', 
    '/profile/:path*'
  ]
}

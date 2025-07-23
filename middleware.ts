import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-config"

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
      // Get session from Better Auth server-side
      const session = await auth.api.getSession({
        headers: request.headers
      })
      
      // If no session, redirect to sign-in
      if (!session?.user) {
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
      }
      
      // Check admin access for admin routes
      if (isAdminRoute) {
        const isAdmin = session.user.role === "ADMIN" || 
          ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
        
        if (!isAdmin) {
          // Redirect non-admin users to home with error message
          const homeUrl = new URL('/', request.url)
          homeUrl.searchParams.set('error', 'unauthorized')
          return NextResponse.redirect(homeUrl)
        }
      }
    } catch (error) {
      // If session check fails, redirect to sign-in
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
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

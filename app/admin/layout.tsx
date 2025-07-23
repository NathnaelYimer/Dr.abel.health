import type { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  bio?: string | null
}

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administration dashboard for managing content and users',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined

  // Check if user is admin
  const isAdmin = user?.email && [
    'nathnaelyimer@gmail.com',
    'abel.gedefaw@gmail.com',
    'diborawassu@gmail.com'
  ].includes(user.email)
  
  if (!session || !isAdmin) {
    redirect('/auth/signin')
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1">
              <div className="flex-1 overflow-y-auto p-4 pt-4 md:p-8 md:pt-6">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

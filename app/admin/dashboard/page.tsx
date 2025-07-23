import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { AnalyticsDashboard } from '@/components/admin/dashboard/analytics-dashboard'
import { Metadata } from 'next'

interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  bio?: string | null
}

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Admin dashboard overview',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  
  // Check if user is admin
  const isAdmin = user?.email && [
    'admin@drabel.com', 
    'abel@drabel.com', 
    'admin@example.com'
  ].includes(user.email)
  
  if (!session || !isAdmin) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <DashboardHeader
        heading="Dashboard"
        text="Welcome to your admin dashboard"
      />
      <div className="space-y-4">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}

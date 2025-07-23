import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getAnalyticsData } from '@/lib/analytics'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await getAnalyticsData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

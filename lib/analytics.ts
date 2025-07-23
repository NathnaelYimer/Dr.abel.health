import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export interface AnalyticsData {
  // Blog statistics
  totalPosts: number
  totalComments: number
  // Note: Categories and tags counts removed as they don't exist in the schema
  
  // User statistics
  totalUsers: number
  newUsersThisMonth: number
  activeUsers: number
  
  // Engagement metrics
  averageReadTime: number
  averageCommentsPerPost: number
  
  // Popular content
  popularPosts: Array<{
    id: string
    title: string
    slug: string
    views: number
    comments: number
    likes: number
  }>
  
  // Traffic sources
  trafficSources: Array<{
    source: string
    count: number
    percentage: number
  }>
  
  // Recent activity
  recentActivity: Array<{
    id: string
    type: 'comment' | 'post' | 'user'
    action: string
    title: string
    date: Date
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }>
  
  // Comment activity
  commentActivity: Array<{
    date: string
    count: number
  }>
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  // Get counts
  const [
    totalPosts,
    totalComments,
    totalUsers,
    newUsersThisMonth,
    activeUsers,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.comment.count(),
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
    }),
    prisma.user.count({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ])

// Types for the raw query result
  interface CommentActivity {
    date: Date
    count: bigint
  }

  // Get popular posts (top 5 by views)
  const popularPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { views: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      _count: {
        select: { comments: true, likes: true },
      },
    },
  })

  // Get traffic sources (mock data - replace with actual analytics integration)
  const trafficSources = [
    { source: 'Direct', count: 1234, percentage: 45 },
    { source: 'Search', count: 987, percentage: 35 },
    { source: 'Social', count: 432, percentage: 15 },
    { source: 'Referral', count: 123, percentage: 5 },
  ]

  // Get recent activity
  const recentActivity = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  // Get comment activity (last 30 days)
  const commentActivity = await prisma.$queryRaw<CommentActivity[]>`
    SELECT 
      DATE(createdAt) as date,
      COUNT(*) as count
    FROM Comment
    WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `

  // Calculate averages
  const averageReadTime = 5 // Mock data - replace with actual calculation
  const averageCommentsPerPost = totalPosts > 0 ? totalComments / totalPosts : 0

  return {
    totalPosts,
    totalComments,
    totalUsers,
    newUsersThisMonth,
    activeUsers,
    averageReadTime,
    averageCommentsPerPost,
    popularPosts: popularPosts.map((post: { id: string; title: string; slug: string; views: number; _count: { comments: number; likes: number } }) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      views: post.views,
      comments: post._count.comments,
      likes: post._count.likes,
    })),
    trafficSources,
    recentActivity: recentActivity.map((activity: { id: string; type: string; action: string; title: string; createdAt: Date; user: { id: string; name: string | null; image: string | null } }) => ({
      id: activity.id,
      type: activity.type as 'comment' | 'post' | 'user',
      action: activity.action,
      title: activity.title,
      date: activity.createdAt,
      user: {
        id: activity.user.id,
        name: activity.user.name,
        image: activity.user.image,
      },
    })),
    commentActivity: commentActivity.map((item: CommentActivity) => ({
      date: item.date.toISOString().split('T')[0],
      count: Number(item.count),
    })),
  }
}

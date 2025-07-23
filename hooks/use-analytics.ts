import { useQuery } from '@tanstack/react-query'
import { AnalyticsData } from '@/lib/analytics'

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export function usePopularPosts() {
  const { data, ...rest } = useAnalytics()
  return {
    ...rest,
    data: data?.popularPosts || [],
  }
}

export function useTrafficSources() {
  const { data, ...rest } = useAnalytics()
  return {
    ...rest,
    data: data?.trafficSources || [],
  }
}

export function useRecentActivity() {
  const { data, ...rest } = useAnalytics()
  return {
    ...rest,
    data: data?.recentActivity || [],
  }
}

export function useCommentActivity() {
  const { data, ...rest } = useAnalytics()
  return {
    ...rest,
    data: data?.commentActivity || [],
  }
}

export function useDashboardStats() {
  const { data, ...rest } = useAnalytics()
  return {
    ...rest,
    data: data
      ? {
          totalPosts: data.totalPosts,
          totalComments: data.totalComments,
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          averageReadTime: data.averageReadTime,
          averageCommentsPerPost: data.averageCommentsPerPost,
        }
      : null,
  }
}

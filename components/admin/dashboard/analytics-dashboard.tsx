'use client'

import { DashboardStats } from './stats-cards'
import { RecentActivity } from './recent-activity'
import { CommentActivityChart } from './comment-activity-chart'
import { TrafficSources } from './traffic-sources'

export function AnalyticsDashboard() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your blog.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Comment Activity Chart */}
        <div className="col-span-4">
          <CommentActivityChart />
        </div>

        {/* Recent Activity */}
        <div className="col-span-3">
          <RecentActivity />
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <TrafficSources />
      </div>
    </div>
  )
}

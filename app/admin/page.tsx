import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, MessageSquare, Calendar, TrendingUp, Eye } from "lucide-react"

export default async function AdminDashboard() {
  // Get session using NextAuth
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated and is admin
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin')
  }
  
  const isAdmin = session.user.role === "ADMIN" || 
    ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
  
  if (!isAdmin) {
    redirect('/?error=unauthorized')
  }

  // Fetch dashboard stats
  const [
    totalPosts,
    publishedPosts,
    totalUsers,
    pendingComments,
    pendingAppointments,
    newsletterSubscribers,
    recentPosts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.comment.count({ where: { approved: false } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.newsletter.count({ where: { subscribed: true } }),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
      },
    }),
  ])

  const stats = [
    {
      title: "Total Posts",
      value: totalPosts,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Published Posts",
      value: publishedPosts,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Comments",
      value: pendingComments,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pending Appointments",
      value: pendingAppointments,
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Newsletter Subscribers",
      value: newsletterSubscribers,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="text-sm text-gray-600">
                    By {post.author.name} • {post.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

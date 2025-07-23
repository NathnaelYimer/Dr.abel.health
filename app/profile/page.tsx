"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import type { Session } from "@/lib/auth-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Link as LinkIcon,
  Settings,
  ArrowLeft,
  Edit,
  Activity,
  Award,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Heart,
  Star
} from "lucide-react"

export default function ProfilePage() {
  const { data: session, isPending } = useSession() as { 
    data: (Session & { 
      user: { 
        role: string; 
        bio?: string;
        email?: string;
        name?: string;
        image?: string | null;
      } 
    }) | null; 
    isPending: boolean 
  }
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/auth/signin?callbackUrl=/profile')
    }
  }, [session, isPending, router])

  const isAdmin = session?.user?.role === "ADMIN" || 
    ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session?.user?.email || "")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Mock data for demonstration
  const stats = [
    { label: "Projects Contributed", value: isAdmin ? 12 : 3, icon: BookOpen },
    { label: "Comments Made", value: isAdmin ? 45 : 8, icon: MessageSquare },
    { label: "Likes Received", value: isAdmin ? 128 : 15, icon: Heart },
    { label: "Profile Views", value: isAdmin ? 234 : 42, icon: TrendingUp },
  ]

  const recentActivity = [
    {
      type: "comment",
      description: "Commented on 'Maternal Health Initiative'",
      time: "2 hours ago",
      icon: MessageSquare
    },
    {
      type: "project",
      description: "Updated progress on 'Community Health Program'",
      time: "1 day ago",
      icon: BookOpen
    },
    {
      type: "achievement",
      description: "Earned 'Active Contributor' badge",
      time: "3 days ago",
      icon: Award
    },
    {
      type: "profile",
      description: "Updated profile information",
      time: "1 week ago",
      icon: User
    }
  ]

  const achievements = [
    {
      title: "Early Adopter",
      description: "One of the first users to join the platform",
      icon: Star,
      earned: true,
      date: "2024-01-15"
    },
    {
      title: "Active Contributor",
      description: "Made significant contributions to projects",
      icon: TrendingUp,
      earned: isAdmin,
      date: isAdmin ? "2024-02-20" : null
    },
    {
      title: "Community Leader",
      description: "Helped guide and mentor other users",
      icon: Award,
      earned: isAdmin,
      date: isAdmin ? "2024-03-10" : null
    },
    {
      title: "Expert Reviewer",
      description: "Provided valuable feedback on multiple projects",
      icon: BookOpen,
      earned: false,
      date: null
    }
  ]

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                <AvatarFallback className="text-2xl">
                  {getInitials(session.user.name || session.user.email || "U")}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {session.user.name || "User"}
                  </h1>
                  {isAdmin && (
                    <Badge className="bg-green-100 text-green-800 border-green-300 w-fit">
                      👑 Administrator
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {session.user.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member since {session.user.createdAt ? 
                      new Date(session.user.createdAt).toLocaleDateString() : 
                      "Recently"
                    }
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {session.user.bio || "Health professional passionate about evidence-based practice and improving healthcare outcomes."}
                </p>
                
                <Button onClick={() => router.push('/settings')} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <stat.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Profile completeness</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="w-full" />
                    <div className="text-sm text-gray-600">
                      <p>✅ Basic information added</p>
                      <p>✅ Profile photo uploaded</p>
                      <p>✅ Bio completed</p>
                      <p>❌ Social links missing</p>
                      <p>❌ Skills not specified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/projects')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Projects
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/admin')}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <activity.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className={achievement.earned ? "border-green-200 bg-green-50" : "border-gray-200"}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${achievement.earned ? "bg-green-100" : "bg-gray-100"}`}>
                        <achievement.icon className={`h-6 w-6 ${achievement.earned ? "text-green-600" : "text-gray-400"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                          {achievement.earned && (
                            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                              Earned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-gray-500">
                            Earned on {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Profile Visibility</h3>
                    <p className="text-sm text-gray-600">Control who can see your profile</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Public
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Activity Status</h3>
                    <p className="text-sm text-gray-600">Show when you're active</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => router.push('/settings')}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

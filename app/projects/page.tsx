"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Target, CheckCircle, Clock, Globe, ArrowRight, X } from "lucide-react"
import Image from "next/image"
import { UserProfile } from "@/components/user-profile"

// Session types are defined in types/auth.d.ts

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const isPending = status === "loading"
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditingProgress, setIsEditingProgress] = useState(false)
  const [tempProgress, setTempProgress] = useState(0)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [tempStatus, setTempStatus] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  // Check if user is admin based on Better Auth session
  const isAdmin = session?.user && (session.user.role === "ADMIN" || 
    ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || ""))
    
  const checkAdminAccess = () => {
    // In a real app, you would verify the password on the server
    if (adminPassword === 'admin123') {
      setIsAdminMode(true)
      setShowAdminLogin(false)
      setAdminPassword('')
    } else {
      alert('Incorrect admin password')
    }
  }

  const handleViewDetails = (project: any) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const handleProgressEdit = (project: any) => {
    setTempProgress(project.progress)
    setIsEditingProgress(true)
  }

  const handleProgressUpdate = (projectId: number, newProgress: number) => {
    // Update the project progress in the projects array
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, progress: newProgress, lastUpdated: new Date().toLocaleDateString() }
        : project
    )
    
    // In a real app, you would save this to a database
    // For now, we'll update the local state
    console.log(`Project ${projectId} progress updated to ${newProgress}%`)
    
    // Update selected project if it's the one being edited
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject({ ...selectedProject, progress: newProgress })
    }
    
    setIsEditingProgress(false)
    
    // Show success feedback
    alert(`Progress updated to ${newProgress}%`)
  }

  const handleProgressCancel = () => {
    setIsEditingProgress(false)
    setTempProgress(0)
  }

  const handleStatusEdit = (project: any) => {
    setTempStatus(project.status)
    setIsEditingStatus(true)
  }

  const handleStatusUpdate = (projectId: number, newStatus: string) => {
    // Update the project status in the projects array
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, status: newStatus, lastUpdated: new Date().toLocaleDateString() }
        : project
    )
    
    // In a real app, you would save this to a database
    console.log(`Project ${projectId} status updated to ${newStatus}`)
    
    // Update selected project if it's the one being edited
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject({ ...selectedProject, status: newStatus })
    }
    
    setIsEditingStatus(false)
    
    // Show success feedback
    alert(`Status updated to ${newStatus}`)
  }

  const handleStatusCancel = () => {
    setIsEditingStatus(false)
    setTempStatus('')
  }

  const projects = [
    {
      id: 1,
      title: "Maternal Health Improvement Initiative in Sidama Region",
      description:
        "Comprehensive maternal health program focusing on reducing maternal mortality and improving access to quality prenatal and postnatal care in rural Sidama communities.",
      category: "Maternal & Child Health",
      status: "ongoing",
      progress: 75,
      startDate: "January 2024",
      endDate: "December 2025",
      location: "Sidama Region, Ethiopia",
      partners: ["Sidama Regional Health Bureau", "Hawassa University", "UNICEF"],
      beneficiaries: "15,000+ pregnant women",
      budget: "$2.5M",
      image: "/placeholder.svg?height=300&width=400",
      objectives: [
        "Reduce maternal mortality by 40%",
        "Increase skilled birth attendance to 85%",
        "Establish 20 new maternal health clinics",
        "Train 200 community health workers",
      ],
      outcomes: [
        "12 new clinics established",
        "150 health workers trained",
        "30% reduction in maternal mortality",
        "8,500 women reached with services",
      ],
    },
    {
      id: 2,
      title: "COVID-19 Vaccine Hesitancy Study in Ethiopian Communities",
      description:
        "Multi-site research study examining factors contributing to vaccine hesitancy and developing culturally appropriate intervention strategies.",
      category: "Communicable Disease",
      status: "completed",
      progress: 100,
      startDate: "March 2023",
      endDate: "November 2024",
      location: "Multi-regional, Ethiopia",
      partners: ["Ministry of Health", "WHO Ethiopia", "CDC Africa"],
      beneficiaries: "50,000+ community members",
      budget: "$1.8M",
      image: "/placeholder.svg?height=300&width=400",
      objectives: [
        "Identify key factors in vaccine hesitancy",
        "Develop targeted communication strategies",
        "Implement community-based interventions",
        "Measure behavior change outcomes",
      ],
      outcomes: [
        "25% increase in vaccination rates",
        "Community intervention model developed",
        "Policy recommendations published",
        "Training materials created",
      ],
    },
    {
      id: 3,
      title: "Non-Communicable Disease Prevention Program",
      description:
        "Comprehensive NCD prevention initiative targeting diabetes, hypertension, and cardiovascular diseases through community-based screening and lifestyle interventions.",
      category: "Non-communicable Disease",
      status: "ongoing",
      progress: 60,
      startDate: "June 2024",
      endDate: "May 2026",
      location: "Addis Ababa & Hawassa",
      partners: ["Ethiopian Diabetes Association", "Heart Foundation", "Local Health Centers"],
      beneficiaries: "25,000+ adults",
      budget: "$3.2M",
      image: "/placeholder.svg?height=300&width=400",
      objectives: [
        "Screen 25,000 adults for NCDs",
        "Establish 15 community health clubs",
        "Reduce NCD risk factors by 35%",
        "Train 300 community health promoters",
      ],
      outcomes: [
        "15,000 people screened",
        "10 health clubs established",
        "200 health promoters trained",
        "20% improvement in lifestyle factors",
      ],
    },
    {
      id: 4,
      title: "Neglected Tropical Diseases Elimination Campaign",
      description:
        "Integrated approach to eliminate neglected tropical diseases through mass drug administration, health education, and environmental interventions.",
      category: "Neglected Tropical Disease",
      status: "planning",
      progress: 25,
      startDate: "September 2025",
      endDate: "August 2027",
      location: "Southern Ethiopia",
      partners: ["WHO", "Carter Center", "Regional Health Bureaus"],
      beneficiaries: "100,000+ community members",
      budget: "$4.1M",
      image: "/placeholder.svg?height=300&width=400",
      objectives: [
        "Eliminate lymphatic filariasis",
        "Control schistosomiasis transmission",
        "Reduce trachoma prevalence to <1%",
        "Strengthen surveillance systems",
      ],
      outcomes: [
        "Project planning completed",
        "Baseline surveys conducted",
        "Community engagement initiated",
        "Partnership agreements signed",
      ],
    },
    {
      id: 5,
      title: "Nutrition Intervention for Stunting Prevention",
      description:
        "Multi-component nutrition program addressing childhood stunting through improved feeding practices, micronutrient supplementation, and caregiver education.",
      category: "Nutrition",
      status: "completed",
      progress: 100,
      startDate: "January 2022",
      endDate: "December 2023",
      location: "SNNPR, Ethiopia",
      partners: ["USAID", "World Vision", "Local NGOs"],
      beneficiaries: "12,000+ children under 5",
      budget: "$2.8M",
      image: "/placeholder.svg?height=300&width=400",
      objectives: [
        "Reduce stunting prevalence by 25%",
        "Improve feeding practices in 80% of households",
        "Establish community nutrition programs",
        "Train 500 community nutrition volunteers",
      ],
      outcomes: [
        "22% reduction in stunting achieved",
        "85% improvement in feeding practices",
        "50 community programs established",
        "600 volunteers trained and active",
      ],
    },
    {
      id: 6,
      title: "Climate Change and Health Adaptation Study",
      description:
        "Research initiative examining the health impacts of climate change in Ethiopia and developing adaptation strategies for vulnerable communities.",
      category: "Climate Change & Health",
      status: "ongoing",
      progress: 40,
      startDate: "October 2024",
      endDate: "September 2026",
      location: "Multiple regions, Ethiopia",
      partners: ["Climate Research Institute", "European Union", "Local Universities"],
      beneficiaries: "Research community & policymakers",
      budget: "$1.5M",
      image: "/placeholder.svg?height=300&width=400",
      objectives: [
        "Map climate-health vulnerabilities",
        "Develop adaptation strategies",
        "Build local research capacity",
        "Inform national climate policy",
      ],
      outcomes: [
        "Vulnerability assessment completed",
        "Research protocols developed",
        "Baseline data collection ongoing",
        "Stakeholder engagement initiated",
      ],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "ongoing":
        return "bg-blue-100 text-blue-800"
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "ongoing":
        return <Clock className="h-4 w-4" />
      case "planning":
        return <Target className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                Our Projects
              </Badge>
              {isAdmin && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  👑 Admin Access
                </Badge>
              )}
            </div>
            <UserProfile />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            🌍 Multi-Country Health Projects
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Discover our ongoing and completed health initiatives across Ethiopia and beyond, addressing critical health
            challenges through evidence-based interventions.
          </p>
          {isAdmin && (
            <p className="text-sm text-green-600 mt-4 font-medium">
              ✨ You have admin privileges - you can edit project progress and status
            </p>
          )}
        </div>
      </section>

      {/* Project Stats */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">30+</div>
              <p className="text-gray-600">Total Projects</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">200K+</div>
              <p className="text-gray-600">People Reached</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">15</div>
              <p className="text-gray-600">Partner Organizations</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">$25M+</div>
              <p className="text-gray-600">Total Investment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects by Status */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Health Projects</h2>
                <p className="text-gray-600">Browse projects by status and health focus area</p>
              </div>

              <TabsList className="grid w-full lg:w-auto grid-cols-4 mt-4 lg:mt-0">
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-8">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid lg:grid-cols-3 gap-0">
                    <div className="relative h-64 lg:h-auto">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">{project.status}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="lg:col-span-2 p-8">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">{project.category}</Badge>
                        <div className="text-sm text-gray-500">{project.budget}</div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{project.title}</h3>

                      <p className="text-gray-600 mb-6 leading-relaxed">{project.description}</p>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>
                              {project.startDate} - {project.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span>{project.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span>{project.beneficiaries}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-gray-600">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {project.partners.slice(0, 2).map((partner) => (
                            <Badge key={partner} variant="secondary" className="text-xs">
                              {partner}
                            </Badge>
                          ))}
                          {project.partners.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.partners.length - 2} more
                            </Badge>
                          )}
                        </div>

                        <Button onClick={() => handleViewDetails(project)}>
                          View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="ongoing">
              <div className="space-y-8">
                {projects
                  .filter((p) => p.status === "ongoing")
                  .map((project) => (
                    <Card key={project.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          <Clock className="h-4 w-4 mr-1" />
                          Ongoing
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Progress: {project.progress}%</div>
                        <Button size="sm">View Project</Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-8">
                {projects
                  .filter((p) => p.status === "completed")
                  .map((project) => (
                    <Card key={project.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Completed: {project.endDate}</div>
                        <Button size="sm">View Results</Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="planning">
              <div className="space-y-8">
                {projects
                  .filter((p) => p.status === "planning")
                  .map((project) => (
                    <Card key={project.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Target className="h-4 w-4 mr-1" />
                          Planning
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Expected start: {project.startDate}</div>
                        <Button size="sm">Learn More</Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Global Reach */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🌍 Our Global Reach</h2>
            <p className="text-gray-600">Collaborating with partners across continents to improve health outcomes</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { region: "Ethiopia", projects: 25, flag: "🇪🇹" },
              { region: "Africa", projects: 12, flag: "🌍" },
              { region: "Europe", projects: 8, flag: "🇪🇺" },
              { region: "USA", projects: 5, flag: "🇺🇸" },
              { region: "Asia", projects: 3, flag: "🌏" },
            ].map((location) => (
              <Card key={location.region} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2">{location.flag}</div>
                  <CardTitle className="text-lg">{location.region}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{location.projects}</div>
                  <p className="text-sm text-gray-600">Active Projects</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership CTA */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <Globe className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Partner With Us</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our network of partners working to improve health outcomes across Ethiopia and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Explore Partnership Opportunities
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              View Current Collaborators
            </Button>
          </div>
        </div>
      </section>

      {/* Project Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedProject.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Project Overview */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Project Overview</h3>
                      <p className="text-gray-600">{selectedProject.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Category</h4>
                        <Badge variant="outline">{selectedProject.category}</Badge>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm text-gray-500">Status</h4>
                          {!isEditingStatus && isAdmin && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleStatusEdit(selectedProject)}
                              className="text-xs h-6 px-2"
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                        
                        {isEditingStatus ? (
                          <div className="space-y-3">
                            <Select value={tempStatus} onValueChange={setTempStatus}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusUpdate(selectedProject.id, tempStatus)}
                                className="h-7 px-3 text-xs"
                              >
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleStatusCancel}
                                className="h-7 px-3 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Badge className={getStatusColor(selectedProject.status)}>
                            {getStatusIcon(selectedProject.status)}
                            <span className="ml-1 capitalize">{selectedProject.status}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-500">Progress</h4>
                        {!isEditingProgress && isAdmin && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleProgressEdit(selectedProject)}
                            className="text-xs h-6 px-2"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      {isEditingProgress ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={tempProgress}
                              onChange={(e) => setTempProgress(Number(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-sm font-medium w-12">{tempProgress}%</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleProgressUpdate(selectedProject.id, tempProgress)}
                              className="h-7 px-3 text-xs"
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleProgressCancel}
                              className="h-7 px-3 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Progress value={selectedProject.progress} className="h-3" />
                          <p className="text-sm text-gray-600">{selectedProject.progress}% Complete</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-500 mb-1">Duration</h4>
                        <p>{selectedProject.startDate} - {selectedProject.endDate}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500 mb-1">Budget</h4>
                        <p className="font-semibold">{selectedProject.budget}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500 mb-1">Location</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span>{selectedProject.location}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500 mb-1">Beneficiaries</h4>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span>{selectedProject.beneficiaries}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Project Objectives */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Project Objectives
                  </h3>
                  <ul className="space-y-2">
                    {selectedProject.objectives?.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Key Outcomes */}
                {selectedProject.outcomes && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Key Outcomes
                    </h3>
                    <ul className="space-y-2">
                      {selectedProject.outcomes.map((outcome: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Partners */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Partner Organizations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.partners?.map((partner: string, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {partner}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Login Modal */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              Admin Login
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAdminAccess()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={checkAdminAccess}
                className="flex-1"
                disabled={!adminPassword.trim()}
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAdminLogin(false)
                  setAdminPassword('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              💡 Demo password: <code className="bg-gray-100 px-1 rounded">admin123</code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

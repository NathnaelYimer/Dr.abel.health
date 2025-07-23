
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Users,
  Globe,
  Award,
  ArrowRight,
  Stethoscope,
  Microscope,
  Heart,
  TrendingUp,
  FileText,
  Calendar,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { HomeClientSections } from "@/components/home-client-sections"
import { prisma } from "@/lib/prisma"

interface Post {
  id: string
  title: string
  excerpt: string | null
  author: {
    name: string | null
  }
  publishedAt: Date | null
  category: string
  tags: string[]
  slug: string
  featuredImage?: string | null
}

export default async function HomePage() {
  // Fetch latest blog posts for the homepage
  const latestBlogPosts: Post[] = await prisma.post.findMany({
    where: {
      published: true,
      archived: false,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-sm font-medium">
                  🏥 Health Evidence & Consultancy
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Trusted Health Evidence and Consultancy for{" "}
                  <span className="text-blue-600">Policy, Practice, and People</span> in Ethiopia and beyond
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  A trusted platform for health research implementation, consulting, capacity building, monitoring and
                  evaluation, and advocacy led by Dr. Abel Gedefaw, Wassu Gedefaw & Dr. Birkneh Tilahun Tadesse.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Request Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline">
                    Explore Our Work
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Join as Partner
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <Image
                  src="/logo.png"
                  alt="Dr. Abel Gedefaw Health Consultancy Team"
                  width={500}
                  height={400}
                  className="rounded-lg"
                />
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Active Research Projects: 15+</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">40+ Peer-reviewed Publications</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">🔬 What We Do</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Evidence-based consulting and research for transforming health outcomes across Ethiopia and beyond
            </p>
          </div>

          <Accordion type="single" collapsible className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
  <AccordionItem value="maternal-child">
    <AccordionTrigger>
      <div className="flex flex-col items-center">
        <Heart className="h-12 w-12 text-pink-600 mb-4" />
        <span className="text-lg font-semibold">Maternal & Child Health</span>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent>
          <p className="text-gray-600">
            Comprehensive research and interventions for improving maternal and child health outcomes.
          </p>
        </CardContent>
      </Card>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="infectious-ncds">
    <AccordionTrigger>
      <div className="flex flex-col items-center">
        <Microscope className="h-12 w-12 text-green-600 mb-4" />
        <span className="text-lg font-semibold">Infectious & NCDs</span>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent>
          <p className="text-gray-600">
            Advanced research on communicable and non-communicable diseases prevention and treatment.
          </p>
        </CardContent>
      </Card>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="health-systems-policy">
    <AccordionTrigger>
      <div className="flex flex-col items-center">
        <Stethoscope className="h-12 w-12 text-blue-600 mb-4" />
        <span className="text-lg font-semibold">Health Systems & Policy</span>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent>
          <p className="text-gray-600">
            Strategic policy development and health system strengthening initiatives.
          </p>
        </CardContent>
      </Card>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="clinical-trials">
    <AccordionTrigger>
      <div className="flex flex-col items-center">
        <FileText className="h-12 w-12 text-purple-600 mb-4" />
        <span className="text-lg font-semibold">Clinical Trials</span>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent>
          <p className="text-gray-600">
            Full-service clinical trial implementation, monitoring, and regulatory compliance.
          </p>
        </CardContent>
      </Card>
    </AccordionContent>
  </AccordionItem>
</Accordion>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button size="lg" variant="outline">
                Learn More About Our Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Where We Work Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">🌍 Where We Work</h2>
            <p className="text-xl text-gray-600">
              Primary based in Ethiopia, but collaborating with institutions globally
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { region: "Ethiopia", flag: "🇪🇹", projects: "25+" },
              { region: "Africa", flag: "🌍", projects: "12+" },
              { region: "Europe", flag: "🇪🇺", projects: "8+" },
              { region: "USA", flag: "🇺🇸", projects: "5+" },
              { region: "Asia", flag: "🌏", projects: "3+" },
            ].map((location) => (
              <Card key={location.region} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2">{location.flag}</div>
                  <CardTitle className="text-lg">{location.region}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{location.projects} Projects</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/where-we-work">
              <Button size="lg" variant="outline">
                View Our Collaborators
                <Globe className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">📊 Our Impact So Far</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">30+</div>
              <p className="text-gray-600 font-medium">Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">10,000+</div>
              <p className="text-gray-600 font-medium">People Reached Through Education</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">10</div>
              <p className="text-gray-600 font-medium">PhD & MSc Mentees Supported</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">40+</div>
              <p className="text-gray-600 font-medium">Peer-reviewed Publications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Client-side sections (Latest Insights & Newsletter) */}
      <HomeClientSections blogPosts={latestBlogPosts} />

      {/* Quick Actions */}
      <section className="py-12 px-4 bg-white border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <Button variant="outline" size="lg" className="h-auto p-6 flex-col gap-2 bg-transparent">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="font-semibold">Book Consultation</span>
              <span className="text-sm text-gray-600">Schedule expert health advice</span>
            </Button>

            <Button variant="outline" size="lg" className="h-auto p-6 flex-col gap-2 bg-transparent">
              <FileText className="h-8 w-8 text-green-600" />
              <span className="font-semibold">Research Collaboration</span>
              <span className="text-sm text-gray-600">Partner with our team</span>
            </Button>

            <Button variant="outline" size="lg" className="h-auto p-6 flex-col gap-2 bg-transparent">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <span className="font-semibold">Capacity Building</span>
              <span className="text-sm text-gray-600">Training and mentorship</span>
            </Button>

            <Button variant="outline" size="lg" className="h-auto p-6 flex-col gap-2 bg-transparent">
              <Users className="h-8 w-8 text-orange-600" />
              <span className="font-semibold">Join Our Network</span>
              <span className="text-sm text-gray-600">Connect with experts</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

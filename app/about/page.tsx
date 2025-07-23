import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Eye, Heart, Users, Award, Globe, BookOpen, Microscope, TrendingUp } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            About Our Organization
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Who We Are</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A leading health consultancy bridging research with real-world solutions, combining deep local insight with
            global best practices to deliver impactful, contextually relevant health interventions.
          </p>
        </div>
      </section>

      {/* Vision, Mission, Values */}
      <section id="vision-mission" className="py-20 px-4 bg-white scroll-mt-20">
        {" "}
        {/* Added id and scroll-mt-20 */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To be a leading local health consultancy and knowledge hub shaping evidence-informed health practice
                  and policy in Ethiopia and beyond.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• Conduct and translate high-quality health research</li>
                  <li>• Strengthen capacity for clinical trial implementation</li>
                  <li>• Inform and influence health policies and strategies</li>
                  <li>• Support individuals and institutions through expert consultation</li>
                  <li>• Advocate for accessible, impactful, and ethical health systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Core Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline" className="block">
                    Scientific Integrity
                  </Badge>
                  <Badge variant="outline" className="block">
                    Equity
                  </Badge>
                  <Badge variant="outline" className="block">
                    Community Impact
                  </Badge>
                  <Badge variant="outline" className="block">
                    Innovation
                  </Badge>
                  <Badge variant="outline" className="block">
                    Collaboration
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="our-story" className="py-20 px-4 bg-gray-50 scroll-mt-20">
        {" "}
        {/* Added id and scroll-mt-20 */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Founded by <strong>Dr. Abel Gedefaw</strong>—a physician, academic, senior researcher, and public
                  health expert with over a decade of experience in Ethiopia's health sector—our consultancy bridges
                  research with real-world solutions.
                </p>
                <p>
                  Dr. Gedefaw currently serves as an Associate Professor specializing in maternal and child health and
                  has authored over 40 peer-reviewed publications. His academic background includes training at Hawassa
                  University and Addis Ababa University in Ethiopia, as well as doctoral studies at the globally
                  renowned Karolinska Institute in Sweden, where he earned his PhD.
                </p>
                <p>
                  He brings extensive leadership experience, having served as Chief Executive Director of Hawassa
                  University Comprehensive Specialized Hospital and held a vice president-level position at the
                  university.
                </p>
              </div>
              <Button className="mt-8" size="lg">
                Read More About Our Team
              </Button>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Dr. Abel Gedefaw and team"
                width={600}
                height={500}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section id="leadership-team" className="py-20 px-4 bg-white scroll-mt-20">
        {" "}
        {/* Added id and scroll-mt-20 */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
            <p className="text-xl text-gray-600">Experienced professionals dedicated to advancing health outcomes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Dr. Abel Gedefaw"
                  width={200}
                  height={200}
                  className="rounded-full mx-auto mb-4"
                />
                <CardTitle className="text-xl">Dr. Abel Gedefaw</CardTitle>
                <CardDescription>Founder & Lead Consultant</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Associate Professor, PhD from Karolinska Institute. Expert in maternal and child health with 40+
                  peer-reviewed publications.
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="secondary">PhD</Badge>
                  <Badge variant="secondary">40+ Publications</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Dr. Birkneh Tilahun Tadesse"
                  width={200}
                  height={200}
                  className="rounded-full mx-auto mb-4"
                />
                <CardTitle className="text-xl">Dr. Birkneh Tilahun Tadesse</CardTitle>
                <CardDescription>Co-Founder & Research Director</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Senior researcher with extensive experience in health systems research and clinical trial
                  implementation.
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="secondary">Research</Badge>
                  <Badge variant="secondary">Clinical Trials</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Wassu Gedefaw"
                  width={200}
                  height={200}
                  className="rounded-full mx-auto mb-4"
                />
                <CardTitle className="text-xl">Wassu Gedefaw</CardTitle>
                <CardDescription>Operations Manager</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Experienced in project management and operational excellence, ensuring efficient delivery of
                  consultancy services.
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="secondary">Operations</Badge>
                  <Badge variant="secondary">Management</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Achievements */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">40+</div>
              <p className="text-gray-600">Peer-reviewed Publications</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">10</div>
              <p className="text-gray-600">PhD & MSc Mentees</p>
            </div>
            <div className="text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">5</div>
              <p className="text-gray-600">Countries Collaborated</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">30+</div>
              <p className="text-gray-600">Projects Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Components */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Core Components</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Microscope className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Research Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Conducting high-quality research that addresses critical health challenges and informs evidence-based
                  decision making.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Capacity Building</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Strengthening local research capacity through training, mentorship, and knowledge transfer programs.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Policy Influence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Translating research findings into actionable policy recommendations and supporting implementation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

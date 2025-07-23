"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Microscope, Stethoscope, FileText, TrendingUp, Shield, BookOpen, ArrowRight, CheckCircle, X, Phone, Mail, Calendar } from "lucide-react"

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const serviceDetails = {
    research: {
      title: "Research Implementation & Evaluation",
      icon: Microscope,
      color: "text-blue-600",
      description: "Comprehensive research services from conception to publication, with expertise in Ethiopian health contexts.",
      features: [
        "Study protocol development and ethical approval support",
        "Data collection methodology and training",
        "Statistical analysis and interpretation",
        "Manuscript writing and publication support",
        "Grant writing and funding applications",
        "Research capacity building workshops",
        "Systematic reviews and meta-analyses",
        "Implementation science studies"
      ],
      pricing: "Starting from $2,500 per project",
      duration: "3-12 months depending on scope",
      deliverables: ["Research protocol", "Data collection tools", "Analysis reports", "Publication manuscripts"]
    },
    clinicalTrials: {
      title: "Clinical Trials Implementation Support",
      icon: FileText,
      color: "text-green-600",
      description: "Full-service clinical trial support with local expertise and regulatory compliance.",
      features: [
        "Context-based clinical trial protocol development",
        "Trial site readiness & capacity building",
        "GCP compliance training and monitoring",
        "Community engagement strategies",
        "Data safety monitoring support",
        "Ethical and regulatory compliance consultation",
        "Patient recruitment and retention strategies",
        "Quality assurance and audit support"
      ],
      pricing: "Custom pricing based on trial scope",
      duration: "6-36 months",
      deliverables: ["Trial protocols", "Training materials", "Monitoring reports", "Regulatory submissions"]
    },
    healthConsultations: {
      title: "Individual & Institutional Consultation Services",
      icon: Stethoscope,
      color: "text-red-600",
      description: "Expert health advice for individuals and organizations with specialized Ethiopian health expertise.",
      features: [
        "One-on-one health care and prevention consultations",
        "Maternal health, child health, infectious diseases",
        "Expert second opinions for complex cases",
        "Virtual consults for Ethiopian diaspora patients",
        "Treatment consultations across multiple disciplines",
        "Health system strengthening advice",
        "Institutional health program development",
        "Emergency health response planning"
      ],
      pricing: "$150-300 per consultation",
      duration: "1-2 hours per session",
      deliverables: ["Consultation reports", "Treatment recommendations", "Follow-up plans"]
    },
    policyAdvocacy: {
      title: "Policy & Advocacy Support",
      icon: TrendingUp,
      color: "text-purple-600",
      description: "Evidence-based policy development and implementation support for health systems.",
      features: [
        "Translating evidence to policy briefs",
        "Development of national/regional guidelines",
        "Stakeholder workshops and roundtables",
        "Technical assistance to health bureaus",
        "Ministry of Health collaboration",
        "Health system policy analysis",
        "Implementation strategy development",
        "Monitoring and evaluation frameworks"
      ],
      pricing: "$5,000-25,000 per project",
      duration: "6-18 months",
      deliverables: ["Policy briefs", "Guidelines", "Implementation plans", "Training materials"]
    },
    capacityBuilding: {
      title: "Capacity Building & Training",
      icon: BookOpen,
      color: "text-orange-600",
      description: "Comprehensive training programs to strengthen health workforce capabilities.",
      features: [
        "Research methodology training",
        "Clinical skills development",
        "Health system management training",
        "Leadership development programs",
        "Mentorship and coaching",
        "Curriculum development",
        "Train-the-trainer programs",
        "Continuing education workshops"
      ],
      pricing: "$1,500-5,000 per training program",
      duration: "1 day to 6 months",
      deliverables: ["Training materials", "Certificates", "Assessment reports", "Follow-up plans"]
    },
    regulatoryCompliance: {
      title: "Regulatory Compliance & Quality Assurance",
      icon: Shield,
      color: "text-indigo-600",
      description: "Ensuring health programs meet international standards and regulatory requirements.",
      features: [
        "Regulatory submission support",
        "Quality management system development",
        "Compliance audits and assessments",
        "Standard operating procedure development",
        "Risk management planning",
        "Documentation and record keeping",
        "International standards alignment",
        "Continuous improvement programs"
      ],
      pricing: "$3,000-15,000 per project",
      duration: "3-12 months",
      deliverables: ["Compliance reports", "SOPs", "Quality manuals", "Audit reports"]
    }
  }

  const handleLearnMore = (serviceKey: string) => {
    setSelectedService(serviceKey)
    setIsModalOpen(true)
  }

  const handleBookConsultation = () => {
    // Redirect to contact page with service pre-selected
    window.location.href = '/contact?service=consultation'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Our Services
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            🌟 Comprehensive Health Consultancy Services
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We provide practical, evidence-driven consultancy to health systems, institutions, and individuals, focusing
            on real-world challenges and measurable impact.
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section id="research" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-12">
            {/* Research Implementation & Evaluation */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid lg:grid-cols-2 gap-8">
                <CardHeader className="lg:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Microscope className="h-8 w-8 text-blue-600" />
                    <Badge variant="secondary">Research & Evaluation</Badge>
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl">🔍 Research Implementation & Evaluation</CardTitle>
                  <CardDescription className="text-lg">
                    Comprehensive research services from conception to publication
                  </CardDescription>
                </CardHeader>
                <CardContent className="lg:p-8">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Study protocol development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Research project design and implementation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Grant writing and coordination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Monitoring & evaluation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Impact assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Research grant budget preparation and reporting</span>
                    </li>
                  </ul>
                  <Button className="mt-6" size="lg" onClick={() => handleLearnMore('research')}>
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>

            <section id="clinical-trials" className="py-20 px-4 bg-white">
              {/* Clinical Trials */}
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid lg:grid-cols-2 gap-8">
                  <CardContent className="lg:p-8 order-2 lg:order-1">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Context-based clinical trial protocol development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Trial site readiness & capacity building</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Trial implementation and monitoring (GCP compliance)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Community engagement strategies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Data safety monitoring support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Ethical and regulatory compliance consultation</span>
                      </li>
                    </ul>
                    <Button className="mt-6" size="lg" onClick={() => handleLearnMore('clinicalTrials')}>
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                  <CardHeader className="lg:p-8 order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="h-8 w-8 text-green-600" />
                      <Badge variant="secondary">Clinical Trials</Badge>
                    </div>
                    <CardTitle className="text-2xl lg:text-3xl">
                      🧪 Clinical Trials Implementation Support in Ethiopia
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Full-service clinical trial support with local expertise
                    </CardDescription>
                  </CardHeader>
                </div>
              </Card>
            </section>

      {/* Health Consultations */}
      <section id="health-consultations" className="py-20 px-4 bg-white">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="grid lg:grid-cols-2 gap-8">
            <CardHeader className="lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope className="h-8 w-8 text-red-600" />
                <Badge variant="secondary">Health Consultations</Badge>
              </div>
              <CardTitle className="text-2xl lg:text-3xl">
                👩🏽‍⚕️ Individual & Institutional Consultation Services
              </CardTitle>
              <CardDescription className="text-lg">
                Expert health advice for individuals and organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="lg:p-8">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>One-on-one health care and prevention consultations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Maternal health, child health, infectious diseases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Expert second opinions for complex cases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Virtual consults for Ethiopian diaspora patients</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Treatment consultations across multiple disciplines</span>
                </li>
              </ul>
              <Button className="mt-6" size="lg" onClick={handleBookConsultation}>
                Book Consultation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </div>
        </Card>
      </section>

            {/* Policy & Advocacy */}
            <section id="policy-advocacy" className="scroll-mt-20">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid lg:grid-cols-2 gap-8">
                  <CardContent className="lg:p-8 order-2 lg:order-1">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Translating evidence to policy briefs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Development of national/regional guidelines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Stakeholder workshops and roundtables</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Technical assistance to health bureaus</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Ministry of Health collaboration</span>
                      </li>
                    </ul>
                    <Button className="mt-6" size="lg" onClick={() => handleLearnMore('policyAdvocacy')}>
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                  <CardHeader className="lg:p-8 order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <Badge variant="secondary">Policy & Advocacy</Badge>
                    </div>
                    <CardTitle className="text-2xl lg:text-3xl">📊 Policy & Advocacy Support</CardTitle>
                    <CardDescription className="text-lg">
                      Evidence-based policy development and implementation support
                    </CardDescription>
                  </CardHeader>
                </div>
              </Card>
            </section>

            {/* Capacity Building */}
            <section id="capacity-building" className="py-20 px-4 bg-white">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid lg:grid-cols-2 gap-8">
                  <CardHeader className="lg:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="h-8 w-8 text-orange-600" />
                      <Badge variant="secondary">Capacity Building</Badge>
                    </div>
                    <CardTitle className="text-2xl lg:text-3xl">🧠 Research Capacity Building</CardTitle>
                    <CardDescription className="text-lg">
                      Strengthening research capabilities across institutions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="lg:p-8">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Short-term training (research methods, trial coordination)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>MSc/PhD thesis supervision</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Training of trainers (ToT) modules</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Proposal and manuscript writing workshops</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Post-doctoral research support</span>
                      </li>
                    </ul>
                    <Button className="mt-6" size="lg" onClick={() => handleLearnMore('capacityBuilding')}>
                      Explore Training <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </section>

      {/* Regulatory & Compliance Services */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive GMP, GDP, QMS & Regulatory Compliance Services
            </h2>
            <p className="text-xl text-gray-600">For Pharmaceuticals & Medical Devices</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>GMP Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• GMP gap assessment and remediation planning</li>
                  <li>• Quality Management System implementation</li>
                  <li>• Personnel training on GMP requirements</li>
                  <li>• Data integrity audits</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Regulatory Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Medicine and device dossier compilation</li>
                  <li>• CTD format submissions</li>
                  <li>• Market entry strategy development</li>
                  <li>• Import/Export regulatory support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Quality Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• GDP compliance audits</li>
                  <li>• Cold chain management consulting</li>
                  <li>• ISO standards implementation</li>
                  <li>• Risk management systems</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Transform Your Health Initiative?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Contact us today to discuss how our expert consultancy services can support your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => window.location.href = '/contact'}>
              Request Consultation
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              Download Service Brochure
            </Button>
          </div>
        </div>
      </section>

      {/* Service Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedService && serviceDetails[selectedService as keyof typeof serviceDetails] && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  {(() => {
                    const service = serviceDetails[selectedService as keyof typeof serviceDetails]
                    const IconComponent = service.icon
                    return (
                      <>
                        <IconComponent className={`h-8 w-8 ${service.color}`} />
                        {service.title}
                      </>
                    )
                  })()}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {serviceDetails[selectedService as keyof typeof serviceDetails].description}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    What's Included
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {serviceDetails[selectedService as keyof typeof serviceDetails].features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing & Duration */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-600">💰</span> Pricing
                    </h4>
                    <p className="text-sm text-gray-700">
                      {serviceDetails[selectedService as keyof typeof serviceDetails].pricing}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      Duration
                    </h4>
                    <p className="text-sm text-gray-700">
                      {serviceDetails[selectedService as keyof typeof serviceDetails].duration}
                    </p>
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Key Deliverables
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {serviceDetails[selectedService as keyof typeof serviceDetails].deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {deliverable}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button 
                    size="lg" 
                    className="flex-1"
                    onClick={() => {
                      setIsModalOpen(false)
                      window.location.href = `/contact?service=${selectedService}`
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Get Quote & Consultation
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setIsModalOpen(false)
                      window.location.href = '/contact?inquiry=general'
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Schedule Call
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

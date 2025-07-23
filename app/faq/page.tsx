import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, HelpCircle, MessageCircle, Phone, Mail } from "lucide-react"

export default function FAQPage() {
  const faqCategories = [
    {
      id: "general",
      title: "General",
      icon: "❓",
      questions: [
        {
          question: "Who can request consultation services?",
          answer:
            "We serve individuals, research institutions, hospitals, NGOs, and international agencies. Both local Ethiopian clients and diaspora communities are welcome. Our services are designed for government health organizations, health managers, policy makers, universities, researchers, private health companies, and healthy individuals seeking expert health advice.",
        },
        {
          question: "What languages do you provide services in?",
          answer:
            "We provide services in four languages: English, Amharic (አማርኛ), Afaan Oromo, and Tigrinya (ትግርኛ). This ensures we can effectively communicate with diverse Ethiopian communities both locally and internationally.",
        },
        {
          question: "How do I get started with your services?",
          answer:
            "You can get started by contacting us through our website contact form, calling our office directly, or sending an email to info@drabelhealthconsulting.org. We'll schedule an initial consultation to understand your needs and recommend the most appropriate services.",
        },
        {
          question: "Do you work with international organizations?",
          answer:
            "Yes, we actively collaborate with international organizations including WHO, universities, research institutions, and NGOs across Africa, Europe, USA, and Asia. We have experience working on multi-country projects and understand international standards and requirements.",
        },
      ],
    },
    {
      id: "research",
      title: "Research Support",
      icon: "🔬",
      questions: [
        {
          question: "What types of research projects do you support?",
          answer:
            "We support a wide range of research projects including maternal and child health studies, communicable and non-communicable disease research, health systems research, epidemiological studies, clinical trials, and health policy research. We provide end-to-end support from protocol development to publication.",
        },
        {
          question: "Do you provide grant writing assistance?",
          answer:
            "Yes, we offer comprehensive grant writing services including proposal development, budget preparation, and submission support. Our team has experience with various funding agencies including international donors, government grants, and private foundations.",
        },
        {
          question: "Can you help with research ethics approval?",
          answer:
            "Absolutely. We provide support for ethical review processes including protocol preparation, submission to institutional review boards, and liaison with national research ethics committees. We ensure all research meets international ethical standards.",
        },
        {
          question: "Do you offer research mentorship?",
          answer:
            "Yes, we provide research mentorship for MSc and PhD students, early-career researchers, and institutions looking to build research capacity. This includes topic development, methodology guidance, data analysis support, and manuscript writing assistance.",
        },
      ],
    },
    {
      id: "consultations",
      title: "Health Consultations",
      icon: "👩🏽‍⚕️",
      questions: [
        {
          question: "Do you provide one-on-one health advice to patients?",
          answer:
            "Yes, Dr. Abel and his team offer individual health consultations for various conditions including maternal health, child health, infectious diseases, and chronic conditions. We provide both virtual and in-person consultations based on your needs and location.",
        },
        {
          question: "Can diaspora Ethiopians access your consultation services?",
          answer:
            "Absolutely. We provide virtual consultations specifically designed for Ethiopian diaspora communities worldwide. Our telemedicine services ensure you can access expert Ethiopian health professionals regardless of your location.",
        },
        {
          question: "What should I expect during a consultation?",
          answer:
            "During a consultation, our healthcare professionals will review your medical history, discuss your current concerns, provide expert advice, and develop a personalized care plan. We may also coordinate with your local healthcare providers when necessary.",
        },
        {
          question: "Are your consultation services confidential?",
          answer:
            "Yes, all consultations are strictly confidential and comply with international healthcare privacy standards. We use secure, HIPAA-compliant platforms for virtual consultations and maintain strict data protection protocols.",
        },
      ],
    },
    {
      id: "clinical-trials",
      title: "Clinical Trials",
      icon: "🧪",
      questions: [
        {
          question: "Can you assist with ethical and regulatory approval for trials?",
          answer:
            "Yes, we provide comprehensive support for clinical trial approvals including protocol development, regulatory submission, and liaison with Ethiopian regulatory authorities. Our team understands local requirements and international GCP standards.",
        },
        {
          question: "Do you provide clinical trial monitoring services?",
          answer:
            "Yes, we offer full clinical trial monitoring services including site monitoring, data quality assurance, safety monitoring, and regulatory compliance oversight. We ensure trials meet international standards while being culturally appropriate for Ethiopian contexts.",
        },
        {
          question: "Can you help with clinical trial site selection in Ethiopia?",
          answer:
            "Absolutely. We have extensive knowledge of Ethiopian healthcare facilities and can assist with site selection, feasibility assessments, and site readiness evaluations. We consider factors like patient population, infrastructure, and regulatory requirements.",
        },
        {
          question: "What is your experience with international clinical trials?",
          answer:
            "Our team has extensive experience with international multi-center clinical trials, including Phase I-IV studies. We understand ICH-GCP guidelines, regulatory requirements, and have worked with international sponsors and CROs.",
        },
      ],
    },
    {
      id: "capacity-building",
      title: "Capacity Building",
      icon: "🎓",
      questions: [
        {
          question: "What training programs do you offer?",
          answer:
            "We offer various training programs including research methodology workshops, clinical trial coordination training, GCP training, manuscript writing workshops, and proposal development courses. Programs can be customized based on institutional needs.",
        },
        {
          question: "Do you provide PhD and MSc supervision?",
          answer:
            "Yes, our senior team members provide academic supervision for PhD and MSc students, particularly in areas of maternal and child health, epidemiology, health systems research, and clinical trials. We also offer co-supervision arrangements with universities.",
        },
        {
          question: "Can you develop customized training for our organization?",
          answer:
            "Absolutely. We develop tailored training programs based on organizational needs assessments. This includes curriculum development, trainer preparation, and ongoing support to ensure sustainable capacity building.",
        },
        {
          question: "Do you offer online training options?",
          answer:
            "Yes, we provide both in-person and online training options to accommodate different learning preferences and geographical constraints. Our online programs are interactive and include practical exercises and case studies.",
        },
      ],
    },
    {
      id: "publications",
      title: "Publications & Resources",
      icon: "📚",
      questions: [
        {
          question: "Can I access publications without registration?",
          answer:
            "Yes, all our published materials are open-access and freely downloadable from our website. We believe in making health evidence accessible to all stakeholders without barriers.",
        },
        {
          question: "How often do you publish new content?",
          answer:
            "We regularly publish research articles, policy briefs, and blog posts. On average, we publish 2-3 peer-reviewed articles per month and weekly blog updates. We also release quarterly newsletters and annual reports.",
        },
        {
          question: "Can I cite your publications in my research?",
          answer:
            "Yes, all our publications are peer-reviewed and can be cited in academic and policy work. Each publication includes proper citation information and DOI when available. We encourage the use of our research to inform evidence-based decisions.",
        },
        {
          question: "Do you accept guest contributions?",
          answer:
            "We welcome guest contributions from qualified health professionals and researchers. Please contact us with your proposal, including topic, outline, and author credentials. All submissions undergo peer review before publication.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Help & Support
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">❓ Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Find answers to common questions about our health consultancy services, research support, and collaboration
            opportunities.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input placeholder="Search for answers to your questions..." className="pl-12 h-12 text-lg" />
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-12">
              {faqCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs lg:text-sm">
                  <span className="mr-1">{category.icon}</span>
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {faqCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-3xl">{category.icon}</span>
                    {category.title}
                  </h2>
                  <p className="text-gray-600">Common questions about {category.title.toLowerCase()}</p>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left hover:no-underline py-6">
                        <span className="font-medium text-gray-900">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Need More Help?</h2>
            <p className="text-gray-600">Can't find what you're looking for? Here are other ways to get support.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Live Chat Support</CardTitle>
                <CardDescription>
                  Get instant answers to your questions through our live chat support during business hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>
                  Speak directly with our team for personalized assistance and detailed consultations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent">
                  +251-XXX-XXXXXX
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Email Support</CardTitle>
                <CardDescription>
                  Send us detailed questions and we'll respond within 24 hours with comprehensive answers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Resources */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Resources</h2>
            <p className="text-gray-600">Helpful resources and guides for common inquiries</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Getting Started Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Complete guide to accessing our services and making the most of our consultancy offerings.
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  Download Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Research Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Learn how to partner with us on research projects and access our expertise.
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Service Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Transparent pricing information for all our consultancy and research services.
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  View Pricing
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Training Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Upcoming training programs, workshops, and capacity building opportunities.
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <HelpCircle className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Our team is here to help. Contact us for personalized assistance with your health consultancy needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Contact Our Team
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

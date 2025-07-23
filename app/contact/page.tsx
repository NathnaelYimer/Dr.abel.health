"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Clock, Facebook, Linkedin, Youtube, Twitter, Send, MessageSquare } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    serviceType: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    // Frontend validation
    if (!formData.name.trim()) {
      setSubmitStatus('error')
      setSubmitMessage('Please enter your name.')
      setIsSubmitting(false)
      return
    }
    
    if (!formData.email.trim()) {
      setSubmitStatus('error')
      setSubmitMessage('Please enter your email address.')
      setIsSubmitting(false)
      return
    }
    
    if (!formData.subject.trim() || formData.subject.length < 5) {
      setSubmitStatus('error')
      setSubmitMessage('Subject must be at least 5 characters long.')
      setIsSubmitting(false)
      return
    }
    
    if (!formData.message.trim() || formData.message.length < 10) {
      setSubmitStatus('error')
      setSubmitMessage('Message must be at least 10 characters long.')
      setIsSubmitting(false)
      return
    }
    
    if (!formData.serviceType) {
      setSubmitStatus('error')
      setSubmitMessage('Please select a service type.')
      setIsSubmitting(false)
      return
    }
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setSubmitMessage(data.message || 'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.')
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          serviceType: "",
          message: "",
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(data.error || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Sorry, there was an error sending your message. Please try again or contact us directly.')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
    
    // Real-time validation feedback
    if (field === 'subject' && value.length > 0 && value.length < 5) {
      setFieldErrors((prev) => ({ ...prev, [field]: 'Subject must be at least 5 characters' }))
    } else if (field === 'message' && value.length > 0 && value.length < 10) {
      setFieldErrors((prev) => ({ ...prev, [field]: 'Message must be at least 10 characters' }))
    } else if (field === 'email' && value.length > 0 && !value.includes('@')) {
      setFieldErrors((prev) => ({ ...prev, [field]: 'Please enter a valid email address' }))
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Contact Us
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">📬 Get in Touch</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We'd love to hear from you. Reach out for consultations, collaborations, or any questions about our health
            consultancy services.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  Send us a Message
                </CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        className={fieldErrors.name ? "border-red-500" : ""}
                        required
                      />
                      {fieldErrors.name && (
                        <p className="text-sm text-red-600">{fieldErrors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                        className={fieldErrors.email ? "border-red-500" : ""}
                        required
                      />
                      {fieldErrors.email && (
                        <p className="text-sm text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+251-XXX-XXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Interest</Label>
                      <Select onValueChange={(value) => handleInputChange("serviceType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONSULTATION">Health Consultation</SelectItem>
                          <SelectItem value="RESEARCH">Research Collaboration</SelectItem>
                          <SelectItem value="CLINICAL_TRIALS">Clinical Trials</SelectItem>
                          <SelectItem value="CAPACITY_BUILDING">Capacity Building</SelectItem>
                          <SelectItem value="POLICY">Policy & Advocacy</SelectItem>
                          <SelectItem value="REGULATORY">Regulatory Compliance</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Brief subject of your inquiry"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Please provide details about your inquiry, including any specific requirements or questions you may have..."
                      rows={6}
                      required
                    />
                  </div>

                  {/* Status Message */}
                  {submitStatus !== 'idle' && (
                    <div className={`p-4 rounded-lg ${
                      submitStatus === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {submitMessage}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Direct Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Direct Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Office Address</p>
                      <p className="text-gray-600">Health Evidence Post by Dr. Abel Gedefaw</p>
                      <p className="text-gray-600">Hawassa, Ethiopia</p>
                      <p className="text-gray-600">Addis Ababa Branch Office</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">+251 91 244 5575</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">nathnaelyimer@gmail.com</p>
                      <p className="text-gray-600">abel.gedefaw@gmail.com</p>
                      <p className="text-gray-600">diborawassu@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Office Hours</p>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                      <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Follow Us</CardTitle>
                  <CardDescription>Stay connected and get the latest updates on our work</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start gap-2 bg-transparent">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 bg-transparent">
                      <Linkedin className="h-4 w-4 text-blue-700" />
                      LinkedIn
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 bg-transparent">
                      <Youtube className="h-4 w-4 text-red-600" />
                      YouTube
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 bg-transparent">
                      <Twitter className="h-4 w-4 text-blue-400" />
                      Twitter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Quick Service Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    📅 Book Health Consultation
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    🤝 Partnership Inquiry
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    📚 Research Collaboration
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    🎓 Training Programs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Quick answers to common questions about our services</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How quickly do you respond to inquiries?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We typically respond to all inquiries within 24 hours during business days. Urgent health
                  consultations may receive faster response times.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer virtual consultations?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, we provide virtual consultations for both local and diaspora clients. We use secure,
                  HIPAA-compliant platforms for all health consultations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What languages do you support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We provide services in English, Amharic, Afaan Oromo, and Tigrinya to better serve our diverse
                  Ethiopian community.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you work with international organizations?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, we collaborate with international organizations including WHO, universities, research
                  institutions, and NGOs across Africa, Europe, USA, and Asia.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-12 px-4 bg-red-50 border-t border-red-200">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold text-red-800 mb-2">🚨 Emergency Health Consultation</h3>
          <p className="text-red-700 mb-4">
            For urgent health matters requiring immediate attention, please contact us directly.
          </p>
          <Button variant="destructive" size="lg">
            Emergency Contact: +251-XXX-XXXXXX
          </Button>
        </div>
      </section>
    </div>
  )
}

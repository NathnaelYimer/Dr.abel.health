import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Stethoscope, Mail, Phone, MapPin, Facebook, Linkedin, Youtube, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">Dr. Abel Health</div>
                <div className="text-sm text-gray-400">Consulting</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Trusted Health Evidence and Consultancy for Policy, Practice, and People in Ethiopia and beyond.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>Hawassa, Ethiopia</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>+251-XXX-XXXXXX</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>info@drabelhealthconsulting.org</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/publications" className="text-gray-400 hover:text-white transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={{ pathname: "/services", hash: "research" }} className="text-gray-400 hover:text-white transition-colors">
                  Research & Evaluation
                </Link>
              </li>
              <li>
                <Link href={{ pathname: "/services", hash: "clinical-trials" }} className="text-gray-400 hover:text-white transition-colors">
                  Clinical Trials
                </Link>
              </li>
              <li>
                <Link href={{ pathname: "/services", hash: "health-consultations" }} className="text-gray-400 hover:text-white transition-colors">
                  Health Consultations
                </Link>
              </li>
              <li>
                <Link href={{ pathname: "/services", hash: "capacity-building" }} className="text-gray-400 hover:text-white transition-colors">
                  Capacity Building
                </Link>
              </li>
              <li>
                <Link href={{ pathname: "/services", hash: "policy-advocacy" }} className="text-gray-400 hover:text-white transition-colors">
                  Policy & Advocacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-gray-400 text-sm">
              Subscribe to our newsletter for the latest health evidence and research updates.
            </p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Subscribe</Button>
            </div>

            {/* Social Media */}
            <div className="flex space-x-3 pt-4">
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Youtube className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Dr. Abel Gedefaw Ali Health Consultancy. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

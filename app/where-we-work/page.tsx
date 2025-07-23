"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"

export default function WhereWeWorkPage() {
  const locations = [
    { region: "Ethiopia", flag: "🇪🇹", projects: "25+" },
    { region: "Africa", flag: "🌍", projects: "12+" },
    { region: "Europe", flag: "🇪🇺", projects: "8+" },
    { region: "USA", flag: "🇺🇸", projects: "5+" },
    { region: "Asia", flag: "🌏", projects: "3+" },
  ]

  return (
    <div className="min-h-screen py-24 px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-4">
            <Globe className="h-10 w-10 text-blue-600 animate-pulse" />
            🌍 Where We Work
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Primarily based in Ethiopia, but collaborating with institutions globally to advance health research and consultancy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {locations.map((location) => (
            <Card
              key={location.region}
              className="text-center shadow-lg hover:shadow-2xl transition-shadow rounded-xl border border-gray-200"
            >
              <CardHeader className="pt-8">
                <div className="text-6xl mb-3">{location.flag}</div>
                <CardTitle className="text-xl font-semibold">{location.region}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {location.projects} Projects
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-24 max-w-4xl mx-auto text-left space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 border-b border-gray-300 pb-3 mb-6">Our Collaborators</h2>
          <ul className="list-disc list-inside text-gray-800 space-y-3 text-lg leading-relaxed">
            <li>
              Local: research universities, regional Health bureau, Ministry of Health, Private health clinics/hospitals,
              Public Health facilities, NGOs, Institutional review boards, National research ethics and review board,
              Local and international pharmaceuticals, clinical trial sponsors
            </li>
            <li>Africa</li>
            <li>Europe</li>
            <li>USA</li>
            <li>Asia</li>
            <li>Multi-country</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dr. Abel Gedefaw Ali Health Consultancy | Trusted Health Evidence & Consultancy",
  description:
    "Trusted Health Evidence and Consultancy for Policy, Practice, and People in Ethiopia and beyond. Expert health research, clinical trials, and policy consultation services.",
  keywords:
    "health consultancy, Ethiopia health, clinical trials, health research, policy consultation, maternal health, public health",
  authors: [{ name: "Dr. Abel Gedefaw Ali" }],
  openGraph: {
    title: "Dr. Abel Gedefaw Ali Health Consultancy",
    description: "Trusted Health Evidence and Consultancy for Policy, Practice, and People in Ethiopia and beyond",
    url: "https://drabelhealthconsulting.org",
    siteName: "Dr. Abel Health Consulting",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Abel Gedefaw Ali Health Consultancy",
    description: "Trusted Health Evidence and Consultancy for Policy, Practice, and People in Ethiopia and beyond",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await getServerSession(authOptions)
    return (
      <html lang="en">
        <body className={inter.className}>
          <Providers session={session}>
            <Header />
            <main className="min-h-[calc(100vh-160px)]">{children}</main>
            <Footer />
            <Toaster />
          </Providers>
        </body>
      </html>
    )
  } catch (err) {
    console.error('Top-level SSR error in RootLayout:', err)
    // Re-throw so Vercel logs the 500 and we still surface the error
    throw err
  }
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [language, setLanguage] = useState("EN")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
        })
        setEmail("")
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-white"
      />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-full sm:w-32 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="EN">English</SelectItem>
          <SelectItem value="AM">አማርኛ</SelectItem>
          <SelectItem value="OR">Afaan Oromo</SelectItem>
          <SelectItem value="TI">ትግርኛ</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={loading} size="lg">
        {loading ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  )
}

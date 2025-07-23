"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, ArrowRight, Filter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

// Define a type for the fetched publication data (similar to Post)
interface Publication {
  id: string
  title: string
  excerpt: string | null | undefined // Allow both null and undefined
  author: { name: string | null | undefined } // Allow both null and undefined
  publishedAt: string | null | undefined // Allow both null and undefined
  category: string
  tags: string[]
  readTime?: number
  featuredImage?: string
  slug: string
  publicationType?: string | null | undefined // Make optional and allow null/undefined
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Map publication types to categories for filtering
  const publicationCategories = [
    { value: "all", label: "All Publications" },
    { value: "RESEARCH", label: "Research Papers" },
    { value: "POLICY", label: "Policy Briefs" },
    { value: "REPORT", label: "Reports" },
    { value: "GUIDELINE", label: "Guidelines" },
    { value: "ARTICLE", label: "Articles" },
    { value: "PRESENTATION", label: "Presentations" },
    { value: "BOOK_CHAPTER", label: "Book Chapters" },
    { value: "THESIS", label: "Theses" },
    { value: "OTHER", label: "Other" },
  ]

  const fetchPublications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      params.append("limit", "6") // Display 6 publications per page

      if (searchQuery) {
        params.append("search", searchQuery)
      }
      if (selectedCategory !== "all") {
        // Assuming your backend API can filter by 'publicationType' or 'category'
        // based on the selectedCategory value.
        params.append("publicationType", selectedCategory)
      }
      if (sortBy === "newest") {
        params.append("orderBy", "publishedAt:desc")
      } else if (sortBy === "oldest") {
        params.append("orderBy", "publishedAt:asc")
      }

      const response = await fetch(`/api/publications?${params.toString()}`) // Using dedicated publications API
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPublications(data.publications) // API returns 'publications'
      setTotalPages(data.pagination.pages)
    } catch (err: any) {
      setError(err.message || "Failed to fetch publications.")
      toast({
        title: "Error fetching publications",
        description: err.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, selectedCategory, sortBy])

  useEffect(() => {
    fetchPublications()
  }, [fetchPublications])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page on search
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1) // Reset to first page on category change
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1) // Reset to first page on sort change
  }

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Our Work
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">📚 Publications & Research</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Explore our extensive collection of research papers, policy briefs, reports, and articles.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search publications..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Publication Type" />
                </SelectTrigger>
                <SelectContent>
                  {publicationCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Publications Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Latest Publications</h2>
            <p className="text-gray-600">Dive into our recent research and policy contributions.</p>
          </div>

          {loading && <div className="text-center py-8">Loading publications...</div>}
          {error && <div className="text-center py-8 text-red-500">{error}</div>}

          {!loading && !error && publications.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publications.map((publication) => (
                <Card key={publication.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={publication.featuredImage || "/placeholder.svg?height=300&width=400"}
                      alt={publication.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {publication.publicationType?.replace(/_/g, " ") || "Publication"}
                      </Badge>
                      <span className="text-xs text-gray-500">{publication.readTime || 5} min read</span>
                    </div>

                    <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                      {publication.title}
                    </CardTitle>

                    <CardDescription className="line-clamp-3">{publication.excerpt}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {publication.publishedAt ? new Date(publication.publishedAt).toLocaleDateString() : "N/A"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {publication.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Link href={`/publications/${publication.slug}`} passHref legacyBehavior>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Publication <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !loading &&
            !error && (
              <div className="text-center py-8 text-gray-500">No publications found matching your criteria.</div>
            )
          )}

          {/* Load More */}
          {!loading && currentPage < totalPages && (
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" onClick={handleLoadMore}>
                Load More Publications
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

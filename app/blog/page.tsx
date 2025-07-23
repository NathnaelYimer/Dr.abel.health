"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, User, ArrowRight, Filter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { NewsletterForm } from "@/components/newsletter-form"
import { toast } from "@/components/ui/use-toast" // Import toast from the correct path

// Define a type for the fetched post data
interface Post {
  id: string
  title: string
  description: string | null // Added description field
  excerpt: string | null
  author: { name: string | null }
  publishedAt: string | null
  category: string
  tags: string[]
  readTime?: number
  featuredImage?: string
  slug: string
  metaDescription?: string | null // Added for potential SEO use
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const categories = [
    { value: "all", label: "All" },
    { value: "CLINICAL_TRIALS", label: "Clinical Trials" },
    { value: "MATERNAL_HEALTH", label: "Maternal Health" },
    { value: "INFECTIOUS_DIASES", label: "Infectious Diseases" },
    { value: "NUTRITION", label: "Nutrition" },
    { value: "DIGITAL_HEALTH", label: "Digital Health" },
    { value: "RESEARCH", label: "Research" }, // Catch-all for other research-related topics
    { value: "HEALTH_POLICY", label: "Health Policy" },
    { value: "CAPACITY_BUILDING", label: "Capacity Building" },
  ]

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      params.append("limit", "6") // Display 6 posts per page

      if (searchQuery) {
        params.append("search", searchQuery)
      }
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      if (sortBy === "newest") {
        params.append("orderBy", "publishedAt:desc")
      } else if (sortBy === "oldest") {
        params.append("orderBy", "publishedAt:asc")
      }

      const response = await fetch(`/api/posts?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPosts(data.posts)
      setTotalPages(data.pagination.pages)
    } catch (err: any) {
      setError(err.message || "Failed to fetch posts.")
      toast({
        title: "Error fetching blog posts",
        description: err.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, selectedCategory, sortBy])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

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
            Health Insights & Updates
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">📝 Blog & Research Insights</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Health perspectives, stories from the field, expert commentary, and research summaries from our team of
            health professionals.
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
                  placeholder="Search articles, topics, or authors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
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
                  {/* "Most Popular" would require a different metric not currently in API */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article (first post if available) */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Article</h2>
            <p className="text-gray-600">Our latest and most impactful research insights</p>
          </div>

          {loading && <div className="text-center py-8">Loading featured article...</div>}
          {error && <div className="text-center py-8 text-red-500">{error}</div>}

          {!loading && !error && posts.length > 0 && (
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto">
                  <Image
                    src={posts[0].featuredImage || "/placeholder.svg?height=300&width=400"}
                    alt={posts[0].title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-blue-600">Featured</Badge>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{posts[0].category.replace(/_/g, " ")}</Badge>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{posts[0].readTime || 5} min read</span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{posts[0].title}</h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">{posts[0].excerpt}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        {posts[0].author.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {posts[0].publishedAt ? new Date(posts[0].publishedAt).toLocaleDateString() : "N/A"}
                      </div>
                    </div>

                    <Link href={`/blog/${posts[0].slug}`} passHref legacyBehavior>
                      <Button>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}
          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-8 text-gray-500">No featured articles found.</div>
          )}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Articles</h2>
            <p className="text-gray-600">Stay updated with our latest research findings and health insights</p>
          </div>

          {loading && <div className="text-center py-8">Loading articles...</div>}
          {error && <div className="text-center py-8 text-red-500">{error}</div>}

          {!loading && !error && posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(1).map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featuredImage || "/placeholder.svg?height=300&width=400"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {post.category.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-gray-500">{post.readTime || 5} min read</span>
                    </div>

                    <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>

                    <CardDescription className="line-clamp-3 min-h-[3.75rem] text-foreground/80">
                      {post.description || post.excerpt || 'No description available'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {post.author.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "N/A"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Link href={`/blog/${post.slug}`} passHref legacyBehavior>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Read Article <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !loading &&
            !error && <div className="text-center py-8 text-gray-500">No articles found matching your criteria.</div>
          )}

          {/* Load More */}
          {!loading && currentPage < totalPages && (
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" onClick={handleLoadMore}>
                Load More Articles
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">📨 Subscribe to Our Blog Updates</h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the latest health research insights and expert commentary delivered to your inbox.
          </p>

          <NewsletterForm />

          <p className="text-sm text-blue-200 mt-4">
            Join 2,000+ health professionals and researchers. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  )
}

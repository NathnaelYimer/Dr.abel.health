"use client"

import { NewsletterForm } from "@/components/newsletter-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface Post {
  id: string
  title: string
  excerpt: string | null
  author: {
    name: string | null
  }
  publishedAt: Date | null
  category: string
  tags: string[]
  slug: string
  featuredImage?: string | null
}

interface HomeClientSectionsProps {
  blogPosts: Post[]
}

export function HomeClientSections({ blogPosts }: HomeClientSectionsProps) {
  return (
    <>
      {/* Latest Insights Section with Tabs */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Latest Insights</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with our latest research, publications, and health insights
            </p>
          </div>
          
          <Tabs defaultValue="blog" className="w-full">
            <TabsList className="mb-6 flex justify-center gap-2">
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>
            <TabsContent value="blog">
              <div className="grid md:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit">
                        {post.category}
                      </Badge>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription>{post.excerpt || "Read more to discover insights..."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="outline" size="sm">
                          Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="publications">
              <div className="text-center py-8">
                <p className="text-gray-600">Publications coming soon...</p>
              </div>
            </TabsContent>
            <TabsContent value="news">
              <div className="text-center py-8">
                <p className="text-gray-600">News updates coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Get the latest health insights, research updates, and expert advice delivered to your inbox
          </p>
          
          <div className="max-w-md mx-auto">
            <NewsletterForm />
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-blue-600 hover:bg-white">
              LinkedIn
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-blue-600 hover:bg-white">
              Twitter
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

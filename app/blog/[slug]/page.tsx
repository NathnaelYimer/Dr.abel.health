import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, Tag, MessageSquare } from "lucide-react"
import { Icons } from "@/components/icons"
import Image from "next/image"
import Link from "next/link"
import dynamic from 'next/dynamic'

// Dynamically import the CommentSection component with SSR disabled
const CommentSection = dynamic(() => import('@/components/blog/comments/comment-section').then(mod => mod.CommentSection), {
  ssr: false,
  loading: () => (
    <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 text-gray-500 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-xl font-semibold">Loading comments...</h3>
      </div>
    </div>
  ),
})

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await prisma.post.findUnique({
    where: {
      slug: params.slug,
      published: true,
      archived: false,
    },
    include: {
      author: {
        select: { name: true, image: true },
      },
      citations: true, // Include citations if you want to display them
    },
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto py-12 px-4">
        {/* Hero Section for Blog Post */}
        <section className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            {post.category.replace(/_/g, " ")}
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">{post.excerpt}</p>
          <div className="flex items-center justify-center space-x-4 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              {post.author.image && (
                <Image
                  src={post.author.image || "/placeholder.svg"}
                  alt={post.author.name || "Author"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <User className="h-4 w-4" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.publishedAt!).toLocaleDateString()}</span>
            </div>
            {post.readTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime} min read</span>
              </div>
            )}
          </div>
        </section>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-12 relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <Image src={post.featuredImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
          </div>
        )}

        {/* Post Content */}
        <section className="prose prose-lg mx-auto text-gray-800 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </section>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Citations (if available) */}
        {post.citations && post.citations.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">References & Citations</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {post.citations.map((citation) => (
                <li key={citation.id}>
                  {citation.authors} ({citation.year}). {citation.title}.{" "}
                  {citation.journal && <em>{citation.journal}.</em>}{" "}
                  {citation.doi && (
                    <Link
                      href={`https://doi.org/${citation.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      DOI: {citation.doi}
                    </Link>
                  )}
                  {citation.url && !citation.doi && (
                    <Link
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Link
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Comments Section */}
        <div className="mt-16">
          <div className="flex items-center gap-2 text-gray-700 mb-8">
            <Icons.messageSquare className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Comments</h2>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <CommentSection postId={post.id} />
          </div>
        </div>

        {/* Back to Blog Button */}
        <div className="mt-12 text-center">
          <Link href="/blog" passHref legacyBehavior>
            <Button size="lg" variant="outline">
              ← Back to All Articles
            </Button>
          </Link>
        </div>
      </article>
    </div>
  )
}

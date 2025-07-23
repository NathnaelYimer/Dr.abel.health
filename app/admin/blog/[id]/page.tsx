import { notFound } from "next/navigation"
import { BlogPostForm } from "@/components/admin/blog/blog-post-form"
import { prisma } from "@/lib/prisma"

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string }
}) {
  // Get the blog post data
  const blogPost = await prisma.post.findUnique({
    where: { id: params.id },
  })

  if (!blogPost) {
    notFound()
  }

  // Format the data for the form
  const initialData = {
    ...blogPost,
    tags: blogPost.tags?.join(", ") || "",
    // Convert Date objects to strings for the form
    publishedAt: blogPost.publishedAt?.toISOString().split("T")[0],
    createdAt: blogPost.createdAt.toISOString().split("T")[0],
    updatedAt: blogPost.updatedAt.toISOString().split("T")[0],
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
      <BlogPostForm initialData={initialData} isEdit={true} />
    </div>
  )
}

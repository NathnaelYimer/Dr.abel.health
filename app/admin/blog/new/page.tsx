import { BlogPostForm } from "@/components/admin/blog/blog-post-form"

export default function NewBlogPostPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add New Blog Post</h1>
      <BlogPostForm />
    </div>
  )
}

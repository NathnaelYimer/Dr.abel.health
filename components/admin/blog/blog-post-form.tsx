"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Image as ImageIcon, Sparkles } from "lucide-react"
import { ImageUpload } from "@/components/admin/ImageUpload"
import { Badge } from "@/components/ui/badge"

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().min(50, "Description should be at least 50 characters").max(300, "Description should not exceed 300 characters"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  featuredImage: z.string().optional(),
  published: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  seoImage: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).default('DRAFT')
})

type BlogPostFormValues = z.infer<typeof formSchema>

interface BlogPostFormProps {
  initialData?: any
  isEdit?: boolean
}

export function BlogPostForm({ initialData, isEdit = false }: BlogPostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Create default values, spreading initialData first to allow overrides
  const defaultValues = {
    title: "",
    slug: "",
    description: "",
    excerpt: "",
    content: "",
    category: "GENERAL",
    tags: "",
    featuredImage: "",
    published: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    seoImage: "",
    featured: false,
    status: 'DRAFT' as const,
    ...initialData,
    // Handle tags specifically to avoid duplicate property
    ...(initialData?.tags ? { tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : initialData.tags } : {})
  }

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Generate slug from title if it's a new post
  const title = form.watch("title")
  useEffect(() => {
    if (!isEdit && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      form.setValue("slug", slug)
    }
  }, [title, form, isEdit])

  const analyzeContent = async () => {
    try {
      setIsAnalyzing(true)
      const { title, content, featuredImage } = form.getValues()
      
      const response = await fetch('/api/analyze-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          imageUrl: featuredImage
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze content')
      }

      const { summary, tags, metaDescription, altText } = await response.json()
      
      // Update form with analyzed data
      form.setValue('excerpt', summary)
      form.setValue('metaDescription', metaDescription)
      
      // Format tags if any
      if (tags) {
        const currentTags = form.getValues('tags') || ''
        const currentTagArray = typeof currentTags === 'string' 
          ? currentTags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [];
        
        const newTags = typeof tags === 'string' 
          ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [];
        
        const combinedTags = [...new Set([...currentTagArray, ...newTags])];
        form.setValue('tags', combinedTags.join(', '));
      }
      
      toast({
        title: "Content analyzed",
        description: "Your blog post has been analyzed and metadata has been generated.",
      })
      
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze content",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onSubmit = async (data: BlogPostFormValues) => {
    try {
      setLoading(true)
      
      const url = isEdit 
        ? `/api/admin/blog/${initialData.id}` 
        : '/api/admin/blog'
      
      const method = isEdit ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save blog post')
      }

      const result = await response.json()
      
      toast({
        title: isEdit ? "Blog post updated" : "Blog post created",
        description: isEdit 
          ? "Your changes have been saved." 
          : "The blog post has been created successfully.",
      })
      
      router.push("/admin/blog")
      router.refresh()
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'GENERAL', label: 'General' },
    { value: 'ANNOUNCEMENTS', label: 'Announcements' },
    { value: 'UPDATES', label: 'Updates' },
    { value: 'TUTORIALS', label: 'Tutorials' },
    { value: 'NEWS', label: 'News' },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Featured Image */}
            <div className="space-y-2">
              <FormLabel>Featured Image</FormLabel>
              <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a featured image for your blog post (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Blog post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Description</FormLabel>
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/300
                      </span>
                    </div>
                    <FormControl>
                      <Textarea 
                        disabled={loading} 
                        placeholder="A brief description of the blog post (50-300 characters)" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This will be used as a summary in blog listings and search results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Meta Description */}
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Meta Description</FormLabel>
                    <Badge variant="outline" className="text-xs">
                      {field.value?.length || 0}/160
                    </Badge>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="A short description for search engines"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be shown in search engine results.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        /blog/
                      </span>
                      <Input placeholder="blog-post-slug" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The URL-friendly version of the title. Only lowercase letters, numbers, and hyphens are allowed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Excerpt */}
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short excerpt for the blog post (optional)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your blog post content here..."
                      className="min-h-[300px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            {/* Publish */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Publish</h3>
              
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Published</FormLabel>
                      <FormDescription>
                        When checked, this post will be visible to the public.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Update" : "Publish"} Post
                </Button>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Category</h3>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Featured Image</h3>
              <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              field.onChange(reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Tags</h3>
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Add tags separated by commas" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate tags with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SEO */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">SEO</h3>
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Meta title for SEO (defaults to title)" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Meta description for SEO (defaults to excerpt)"
                        className="min-h-[80px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

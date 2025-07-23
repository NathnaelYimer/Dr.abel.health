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
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  category: z.enum([
    'RESEARCH',
    'CLINICAL_TRIALS',
    'HEALTH_POLICY',
    'CAPACITY_BUILDING',
    'MATERNAL_HEALTH',
    'INFECTIOUS_DISEASES',
    'NON_COMMUNICABLE_DISEASES',
    'DIGITAL_HEALTH',
    'NUTRITION',
    'OTHER'
  ]),
  tags: z.string().optional(),
  featuredImage: z.string().optional(),
  published: z.boolean().default(false),
  publishedAt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

type PublicationFormValues = z.infer<typeof formSchema>

interface PublicationFormProps {
  initialData?: any
  isEdit?: boolean
}

export function PublicationForm({ initialData, isEdit = false }: PublicationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const defaultValues = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "RESEARCH",
    tags: "",
    featuredImage: "",
    published: false,
    metaTitle: "",
    metaDescription: "",
    ...initialData,
  }

  const form = useForm<PublicationFormValues>({
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

  const onSubmit = async (data: PublicationFormValues) => {
    try {
      setLoading(true)
      
      const url = isEdit 
        ? `/api/admin/publications/${initialData.id}` 
        : '/api/admin/publications'
      
      const method = isEdit ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save publication')
      }

      const result = await response.json()
      
      toast({
        title: isEdit ? "Publication updated" : "Publication created",
        description: isEdit 
          ? "Your changes have been saved." 
          : "The publication has been created successfully.",
      })
      
      router.push("/admin/publications")
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
    { value: 'RESEARCH', label: 'Research Papers' },
    { value: 'CLINICAL_TRIALS', label: 'Clinical Trials' },
    { value: 'HEALTH_POLICY', label: 'Health Policy' },
    { value: 'CAPACITY_BUILDING', label: 'Capacity Building' },
    { value: 'MATERNAL_HEALTH', label: 'Maternal Health' },
    { value: 'INFECTIOUS_DISEASES', label: 'Infectious Diseases' },
    { value: 'NON_COMMUNICABLE_DISEASES', label: 'Non-communicable Diseases' },
    { value: 'DIGITAL_HEALTH', label: 'Digital Health' },
    { value: 'NUTRITION', label: 'Nutrition' },
    { value: 'OTHER', label: 'Other' },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter publication title" {...field} />
                  </FormControl>
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
                        /publications/
                      </span>
                      <Input placeholder="publication-slug" {...field} />
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
                      placeholder="A short excerpt for the publication (optional)"
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
                      placeholder="Write your publication content here..."
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
                        When checked, this publication will be visible to the public.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Update" : "Publish"} Publication
                </Button>
              </div>
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
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a high-quality image that represents this publication.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </div>
        </div>
      </form>
    </Form>
  )
}

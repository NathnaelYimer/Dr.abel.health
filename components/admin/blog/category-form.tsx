'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import * as z from 'zod'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Category } from '@prisma/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  id: z.string().min(1, 'Category is required'),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  postCount: z.number().optional()
})

interface CategoryFormValues {
  id: string
  name: string
  description: string
  postCount?: number
}

interface CategoryFormProps {
  initialData?: CategoryFormValues
  isEdit?: boolean
}

export function CategoryForm({ initialData, isEdit = true }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Get all valid category values from the enum
  const categories = Object.values(Category).map(category => ({
    id: category,
    name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }))

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      postCount: initialData?.postCount || 0
    },
  })

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    try {
      setLoading(true)
      const url = isEdit && data.id 
        ? `/api/admin/blog/categories/${data.id}`
        : '/api/admin/blog/categories'
      
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save category')
      }

      toast({
        title: 'Success',
        description: isEdit 
          ? 'Category updated successfully.'
          : 'Category created successfully.',
      })

      router.push('/admin/blog/categories')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          {!isEdit ? (
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Category name" 
                      {...field} 
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A brief description of this category"
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  This description may be used on category pages and in meta descriptions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {initialData?.postCount !== undefined && (
            <div className="text-sm text-muted-foreground">
              Used in {initialData.postCount} post{initialData.postCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/blog/categories')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? 'Update' : 'Create'} Category
          </Button>
        </div>
      </form>
    </Form>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  slug: z.string().min(2, {
    message: 'Slug must be at least 2 characters.',
  }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
  }),
})

type TagFormValues = z.infer<typeof formSchema>

interface TagFormProps {
  initialData?: {
    id?: string
    name: string
    slug: string
  }
  isEdit?: boolean
}

export function TagForm({ initialData, isEdit = false }: TagFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<TagFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      slug: '',
    },
  })

  // Generate slug from name
  useEffect(() => {
    if (!isEdit && !form.getValues('slug')) {
      const subscription = form.watch((value, { name }) => {
        if (name === 'name' && value.name) {
          const slug = value.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
          form.setValue('slug', slug, { shouldValidate: true })
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [form, isEdit])

  const onSubmit = async (data: TagFormValues) => {
    try {
      setLoading(true)
      const url = isEdit && initialData?.id 
        ? `/api/admin/blog/tags/${initialData.id}`
        : '/api/admin/blog/tags'
      
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save tag')
      }

      toast({
        title: 'Success',
        description: isEdit 
          ? 'Tag updated successfully.'
          : 'Tag created successfully.',
      })

      router.push('/admin/blog/tags')
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      #
                    </div>
                    <Input 
                      className="pl-6"
                      placeholder="tagname" 
                      {...field} 
                      disabled={loading} 
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  The name of your tag as it will appear on your site (without the #).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      /blog/tag/
                    </div>
                    <Input 
                      className="pl-24"
                      placeholder="tag-slug" 
                      {...field} 
                      disabled={loading}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  The URL-friendly version of the name. It should be all lowercase, contain only
                  letters, numbers, and hyphens.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/blog/tags')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? 'Update' : 'Create'} Tag
          </Button>
        </div>
      </form>
    </Form>
  )
}

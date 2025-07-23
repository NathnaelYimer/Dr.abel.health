'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { CommentFormData } from '@/types/comment'

const commentFormSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  postId: z.string().optional(),
  parentId: z.string().optional(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  authorEmail: z.string().optional(),
})

interface CommentFormProps {
  postId?: string
  parentId?: string | null
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  autoFocus?: boolean
  initialValues?: Partial<CommentFormData>
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  className = '',
  autoFocus = false,
  initialValues,
}: CommentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: initialValues?.content || '',
      postId: initialValues?.postId || postId,
      parentId: initialValues?.parentId || parentId || undefined,
      authorId: initialValues?.authorId,
      authorName: initialValues?.authorName,
      authorEmail: initialValues?.authorEmail,
    },
  })

  async function onSubmit(values: z.infer<typeof commentFormSchema>) {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/admin/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          status: 'APPROVED', // Admin comments are auto-approved
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit comment')
      }

      const data = await response.json()
      
      toast({
        title: 'Success',
        description: parentId ? 'Reply submitted' : 'Comment submitted',
      })

      // Reset form
      form.reset({
        content: '',
        postId: values.postId,
        parentId: values.parentId,
        authorId: values.authorId,
        authorName: values.authorName,
        authorEmail: values.authorEmail,
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Refresh the page to show the new comment
      router.refresh()
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit comment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-4 ${className}`}
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Write a comment..."
                  className="min-h-[100px]"
                  autoFocus={autoFocus}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.send className="mr-2 h-4 w-4" />
            )}
            {parentId ? 'Reply' : 'Comment'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

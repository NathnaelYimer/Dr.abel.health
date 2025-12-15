'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/components/icons'
import { Comment } from '@/types/comment'
import { formatDistanceToNow } from 'date-fns'

interface CommentSectionProps {
  postId: string
  initialComments?: Comment[]




  
}

export function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
          postId,
          authorId: session?.user?.id,
          authorName: session?.user?.name,
          authorEmail: session?.user?.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      const newComment = await response.json()
      setComments([newComment, ...comments])
      setComment('')
    } catch (error) {
      console.error('Error submitting comment:', error)
      // Handle error (e.g., show toast)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          postId,
          parentId,
          authorId: session?.user?.id,
          authorName: session?.user?.name,
          authorEmail: session?.user?.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post reply')
      }

      const newReply = await response.json()
      
      // Update the comments state to include the new reply
      setComments(comments.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] } 
          : comment
      ))
      
      setReplyingTo(null)
      setReplyContent('')
    } catch (error) {
      console.error('Error submitting reply:', error)
      // Handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="mb-6">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author?.image || ''} alt={comment.author?.name || 'User'} />
          <AvatarFallback>{(comment.author?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{comment.author?.name || 'Anonymous'}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-800">{comment.content}</p>
            
            {session && (
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                Reply
              </button>
            )}
            
            {replyingTo === comment.id && (
              <div className="mt-3 pl-4 border-l-2 border-gray-200">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={2}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleReply(comment.id)}
                    disabled={isSubmitting || !replyContent.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-6 border-l-2 border-gray-100">
              {comment.replies.map(reply => (
                <div key={reply.id} className="mt-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.author?.image || ''} alt={reply.author?.name || 'User'} />
                      <AvatarFallback>{(reply.author?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">{reply.author?.name || 'Anonymous'}</span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-6">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>
      
      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
              <AvatarFallback>{(session.user?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="mb-2"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !comment.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg mb-8">
          <p className="text-sm text-blue-800 mb-3">
            Please sign in to leave a comment.
          </p>
          <Button variant="outline" asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      )}
      
      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map(renderComment)
        ) : (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  )
}

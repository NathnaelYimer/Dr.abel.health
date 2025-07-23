import { prisma } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'
import { activityLog } from '@/lib/activity-log'
import { Role } from '@prisma/client'

/**
 * Sends a notification to admins about a new comment
 */
export async function notifyAdminsAboutNewComment(commentId: string) {
  try {
    // Get the comment with post and author details
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!comment) {
      console.error('Comment not found for notification:', commentId)
      return
    }

    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: Role.ADMIN,
        email: { not: { equals: '' } },
      },
      select: {
        email: true,
        name: true,
      },
    })

    // Prepare email data
    const postUrl = `${process.env.NEXTAUTH_URL}/blog/${comment.post.slug}`
    const moderationUrl = `${process.env.NEXTAUTH_URL}/admin/comments?commentId=${comment.id}`

    // Send email to each admin
    const emailPromises = admins.map((admin) => {
      if (!admin.email) return Promise.resolve()
      
      return sendEmail(
        admin.email,
        'newCommentNotification',
        {
          postTitle: comment.post.title,
          postUrl,
          authorName: comment.author?.name || 'Anonymous',
          content: comment.content,
          commentUrl: moderationUrl,
        }
      )
    })

    await Promise.all(emailPromises)
    console.log(`Sent new comment notifications to ${emailPromises.length} admins`)
  } catch (error) {
    console.error('Error sending admin notifications:', error)
    // Don't throw the error to avoid affecting the main comment creation flow
  }
}

/**
 * Sends a notification to a user about a reply to their comment
 */
export async function notifyUserAboutReply(replyCommentId: string) {
  try {
    // Get the reply comment with parent comment, post, and author details
    const reply = await prisma.comment.findUnique({
      where: { id: replyCommentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    if (!reply || !reply.authorId) {
      console.error('Reply or reply author not found:', replyCommentId)
      return
    }

    // Get the parent comment with its author
    // Get the parent comment ID first
    const parentCommentId = (reply as any).parentId;
    if (!parentCommentId) {
      console.error('Parent comment ID not found for reply:', replyCommentId);
      return;
    }

    const parentComment = await prisma.comment.findUnique({
      where: { id: parentCommentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!parentComment?.author?.email) {
      console.error('Parent comment or author not found for reply:', replyCommentId)
      return
    }

    // Don't notify if the user is replying to themselves
    if (reply.authorId === parentComment.author.id) {
      return
    }

    // Get the post URL
    const post = await prisma.post.findUnique({
      where: { id: reply.postId },
      select: { slug: true, title: true },
    })

    if (!post) {
      console.error('Post not found for comment:', reply.postId)
      return
    }

    const postUrl = `${process.env.NEXTAUTH_URL}/blog/${post.slug}#comment-${reply.id}`

    // Send email notification using the new sendEmail function
    await sendEmail(
      parentComment.author.email,
      'commentReplyNotification',
      {
        postTitle: post.title,
        postUrl,
        authorName: reply.author?.name || 'Someone',
        content: parentComment.content,
        replyContent: reply.content,
        commentUrl: postUrl,
      }
    )

    console.log(`Sent reply notification to ${parentComment.author.email}`)
  } catch (error) {
    console.error('Error sending reply notification:', error)
    // Don't throw the error to avoid affecting the main comment creation flow
  }
}

/**
 * Handles all notifications for a new comment
 */
export async function handleCommentNotifications(commentId: string, isReply: boolean = false) {
  try {
    // Always notify admins about new comments
    await notifyAdminsAboutNewComment(commentId)
    
    // If it's a reply, notify the parent comment author
    if (isReply) {
      await notifyUserAboutReply(commentId)
    }
  } catch (error) {
    console.error('Error in handleCommentNotifications:', error)
  }
}

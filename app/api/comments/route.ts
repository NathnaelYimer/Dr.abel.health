import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { activityLog } from '@/lib/activity-log'
import { handleCommentNotifications } from '@/lib/notifications'

// Comment validation schema
const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
  postId: z.string().min(1, 'Post ID is required'),
  parentId: z.string().optional(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional(),
})

// POST /api/comments
// Create a new comment (public endpoint)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated users to post comments
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    const body = commentSchema.parse(json)

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: body.postId },
      select: { id: true },
    })

    if (!post) {
      return new NextResponse('Post not found', { status: 404 })
    }

    // Check if parent comment exists if replying
    if (body.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: body.parentId },
        select: { id: true, postId: true },
      })

      if (!parentComment || parentComment.postId !== body.postId) {
        return new NextResponse('Invalid parent comment', { status: 400 })
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        post: { connect: { id: body.postId } },
        author: { connect: { id: session.user.id } },
        ...(body.parentId && { parent: { connect: { id: body.parentId } } }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        post: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    })

    // Log the comment creation
    await activityLog.comment.created(session.user.id, comment.id, comment.post.title)

    // Send notifications in the background (don't await to avoid delaying the response)
    handleCommentNotifications(comment.id, Boolean(body.parentId))
      .catch(error => {
        console.error('Error in handleCommentNotifications:', error)
      })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }
    
    return new NextResponse('Internal server error', { status: 500 })
  }
}

// GET /api/comments?postId=POST_ID
// Get comments for a specific post (public endpoint)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const parentId = searchParams.get('parentId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    if (!postId) {
      return new NextResponse('Post ID is required', { status: 400 })
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      return new NextResponse('Post not found', { status: 404 })
    }

    // Build the where clause
    const where: any = {
      postId,
      status: 'APPROVED', // Only show approved comments
    }

    // Filter by parent comment if provided
    if (parentId) {
      where.parentId = parentId
    } else {
      where.parentId = null // Only top-level comments
    }

    // Get total count for pagination
    const total = await prisma.comment.count({ where })

    // Get paginated comments
    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    })

    return NextResponse.json({
      data: comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

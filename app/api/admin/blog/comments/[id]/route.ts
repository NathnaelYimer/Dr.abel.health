import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Define types for raw SQL query results
interface CommentAuthor {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface CommentPost {
  id: string
  title: string
  slug: string
}

interface CommentWithRelations {
  id: string
  content: string
  postId: string
  authorId: string
  approved: boolean
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  author: CommentAuthor
  post: CommentPost
  replies?: Array<CommentWithRelations>
}

// GET /api/admin/blog/comments/[id]
// Get a single comment by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // First get the comment with its author and post info using a raw SQL query
    const [comment] = await prisma.$queryRaw<[CommentWithRelations]>`
      SELECT 
        c.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'image', u.image
        ) as author,
        json_build_object(
          'id', p.id,
          'title', p.title,
          'slug', p.slug
        ) as post
      FROM "Comment" c
      JOIN "User" u ON c."authorId" = u.id
      JOIN "Post" p ON c."postId" = p.id
      WHERE c.id = ${params.id}
    `;

    // Get replies for this comment
    const replies = await prisma.$queryRaw<Array<CommentWithRelations>>`
      SELECT 
        r.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'image', u.image
        ) as author,
        json_build_object(
          'id', p.id,
          'title', p.title,
          'slug', p.slug
        ) as post
      FROM "Comment" r
      JOIN "User" u ON r."authorId" = u.id
      JOIN "Post" p ON r."postId" = p.id
      WHERE r."parentId" = ${params.id}
      ORDER BY r."createdAt" ASC
    `;

    // Combine the comment with its replies
    const commentWithReplies = {
      ...comment,
      replies
    };

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 })
    }

    return NextResponse.json(commentWithReplies)
  } catch (error) {
    console.error('[ADMIN_COMMENT_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// PATCH /api/admin/blog/comments/[id]
// Update a comment
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    
    // Validate request body
    const body = z.object({
      content: z.string().min(1, 'Content is required').optional(),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SPAM']).optional(),
    }).parse(json)

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: params.id },
      data: {
        ...(body.content && { content: body.content }),
        ...(body.status && { status: body.status }),
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
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('[ADMIN_COMMENT_PATCH]', error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }
    return new NextResponse('Internal error', { status: 500 })
  }
}

// DELETE /api/admin/blog/comments/[id]
// Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or has the required role
    const isAdmin = session.user.role === 'ADMIN' || 
      ['admin@drabel.com', 'abel@drabel.com', 'admin@example.com']
        .includes(session.user.email || '');
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // First, delete all replies to this comment using raw SQL
    await prisma.$executeRaw`
      DELETE FROM "Comment"
      WHERE "parentId" = ${params.id}
    `;

    // Then delete the comment itself
    await prisma.comment.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[ADMIN_COMMENT_DELETE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

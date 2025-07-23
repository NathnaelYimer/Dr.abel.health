import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// GET /api/admin/blog/comments
// List comments with pagination and filtering
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: any = {}
    
    // Filter by status if provided
    if (status) {
      where.status = status
    }

    // Search in comment content or author name/email
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
        { author: { email: { contains: search, mode: 'insensitive' } } },
      ]
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
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        // Removed invalid replies include - we'll handle replies count separately
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get reply counts for all comments in a single query using raw SQL for better type safety
    const commentIds = comments.map(comment => `'${comment.id}'`).join(',');
    
    // Only run the query if we have comment IDs
    let replyCountMap = new Map<string, number>();
    
    if (commentIds) {
      const replyCounts = await prisma.$queryRaw<Array<{ parentId: string | null; count: bigint }>>`
        SELECT "parentId", COUNT(*)::int as count
        FROM "Comment"
        WHERE "parentId" IN (${commentIds})
        GROUP BY "parentId"
      `;
      
      // Create a map of parentId to reply count
      replyCountMap = new Map(
        replyCounts
          .filter(item => item.parentId !== null)
          .map(item => [item.parentId as string, Number(item.count)])
      );
    }

    // Transform the data to include reply count
    const commentsWithReplyCount = comments.map(comment => ({
      ...comment,
      replyCount: replyCountMap.get(comment.id) || 0
    }));

    return NextResponse.json({
      data: commentsWithReplyCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[ADMIN_COMMENTS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// POST /api/admin/blog/comments
// Create a new comment (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !['admin@drabel.com', 'abel@drabel.com', 'admin@example.com'].includes(session.user.email || '')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    
    // Validate request body
    const body = z.object({
      content: z.string().min(1, 'Content is required'),
      postId: z.string().min(1, 'Post ID is required'),
      authorId: z.string().min(1, 'Author ID is required'),
      parentId: z.string().optional(),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SPAM']).default('APPROVED'),
    }).parse(json)

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        approved: body.status === 'APPROVED',
        post: {
          connect: { id: body.postId },
        },
        author: {
          connect: { id: body.authorId },
        },
        ...(body.parentId && {
          parent: {
            connect: { id: body.parentId },
          },
        }),
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

    return NextResponse.json(comment)
  } catch (error) {
    console.error('[ADMIN_COMMENTS_POST]', error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }
    return new NextResponse('Internal error', { status: 500 })
  }
}

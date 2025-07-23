import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { contentId, contentType, action } = await req.json();

    if (!['post', 'comment', 'project'].includes(contentType)) {
      return new NextResponse('Invalid content type', { status: 400 });
    }

    if (!['like', 'unlike'].includes(action)) {
      return new NextResponse('Invalid action', { status: 400 });
    }

    const userId = session.user.id;
    const likeData = {
      userId,
      [`${contentType}Id`]: contentId,
    };

    // Check if the content exists using a type-safe approach
    let content;
    switch (contentType) {
      case 'post':
        content = await prisma.post.findUnique({ where: { id: contentId } });
        break;
      case 'comment':
        content = await prisma.comment.findUnique({ where: { id: contentId } });
        break;
      case 'project':
        content = await prisma.project.findUnique({ where: { id: contentId } });
        break;
      default:
        return new NextResponse('Invalid content type', { status: 400 });
    }

    if (!content) {
      return new NextResponse('Content not found', { status: 404 });
    }

    let result;
    
    if (action === 'like') {
      // Create the like
      await prisma.like.create({
        data: likeData,
      });
    } else {
      // Remove the like
      await prisma.like.deleteMany({
        where: likeData,
      });
    }

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { [`${contentType}Id`]: contentId },
    });

    return NextResponse.json({
      success: true,
      liked: action === 'like',
      likes: likeCount,
    });
  } catch (error) {
    console.error('Error in like API:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    
    if (!contentId || !contentType) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    if (!['post', 'comment', 'project'].includes(contentType)) {
      return new NextResponse('Invalid content type', { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get like count and check if current user has liked this content
    let likeCount: number;
    let userLiked = false;

    // Use type-safe approach for different content types
    switch (contentType) {
      case 'post':
        likeCount = await prisma.like.count({
          where: { postId: contentId },
        });
        if (userId) {
          const like = await prisma.like.findFirst({
            where: { userId, postId: contentId },
          });
          userLiked = !!like;
        }
        break;
      case 'comment':
        likeCount = await prisma.like.count({
          where: { commentId: contentId },
        });
        if (userId) {
          const like = await prisma.like.findFirst({
            where: { userId, commentId: contentId },
          });
          userLiked = !!like;
        }
        break;
      case 'project':
        likeCount = await prisma.like.count({
          where: { projectId: contentId },
        });
        if (userId) {
          const like = await prisma.like.findFirst({
            where: { userId, projectId: contentId },
          });
          userLiked = !!like;
        }
        break;
      default:
        return new NextResponse('Invalid content type', { status: 400 });
    }

    return NextResponse.json({
      likes: likeCount,
      hasLiked: userLiked,
    });
  } catch (error) {
    console.error('Error fetching like status:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { contentId, contentType, action, folder } = await req.json();

    if (!['post', 'project'].includes(contentType)) {
      return new NextResponse('Invalid content type', { status: 400 });
    }

    if (!['add', 'remove'].includes(action)) {
      return new NextResponse('Invalid action', { status: 400 });
    }

    const userId = session.user.id;
    const bookmarkData = {
      userId,
      [`${contentType}Id`]: contentId,
      ...(folder && { folder }),
    };

    // Check if the content exists using a type-safe approach
    let content;
    if (contentType === 'post') {
      content = await prisma.post.findUnique({
        where: { id: contentId },
      });
    } else if (contentType === 'project') {
      content = await prisma.project.findUnique({
        where: { id: contentId },
      });
    } else {
      return new NextResponse('Invalid content type', { status: 400 });
    }

    if (!content) {
      return new NextResponse('Content not found', { status: 404 });
    }

    let result;
    
    if (action === 'add') {
      // Check if already bookmarked
      const existingBookmark = await prisma.bookmark.findFirst({
        where: {
          userId,
          [`${contentType}Id`]: contentId,
        },
      });

      if (existingBookmark) {
        // Update existing bookmark
        result = await prisma.bookmark.update({
          where: { id: existingBookmark.id },
          data: {
            ...(folder && { folder }),
          },
        });
      } else {
        // Create new bookmark
        result = await prisma.bookmark.create({
          data: bookmarkData,
        });
      }
    } else {
      // Remove bookmark
      await prisma.bookmark.deleteMany({
        where: {
          userId,
          [`${contentType}Id`]: contentId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      bookmarked: action === 'add',
    });
  } catch (error) {
    console.error('Error in bookmark API:', error);
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

    if (!['post', 'project'].includes(contentType)) {
      return new NextResponse('Invalid content type', { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isBookmarked: false });
    }

    const userId = session.user.id;

    // Check if content is bookmarked by user
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId,
        [`${contentType}Id`]: contentId,
      },
      select: {
        id: true,
        folder: true,
      },
    });

    return NextResponse.json({
      isBookmarked: !!bookmark,
      folder: bookmark?.folder || null,
    });
  } catch (error) {
    console.error('Error fetching bookmark status:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

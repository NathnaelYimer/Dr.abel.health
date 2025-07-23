import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { activityLog } from '@/lib/activity-log'
import { Role } from '@prisma/client'

// PATCH /api/admin/comments/[id] - Update comment status
// DELETE /api/admin/comments/[id] - Delete a comment
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to moderate comments
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { status } = await request.json()
    
    if (!['APPROVED', 'REJECTED', 'PENDING', 'SPAM'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    // Get the comment with post details for activity logging
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: {
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 })
    }

    // Update the comment approval status
    const updatedComment = await prisma.comment.update({
      where: { id: params.id },
      data: { 
        approved: status === 'APPROVED' 
      },
      include: {
        post: {
          select: {
            title: true
          }
        }
      }
    })

    // Log the moderation action
    if (status === 'APPROVED') {
      await activityLog.comment.approved(
        session.user.id,
        comment.id,
        comment.post?.title
      )
    } else if (status === 'REJECTED') {
      await activityLog.comment.rejected(
        session.user.id,
        comment.id,
        'Moderator action'
      )
    } else if (status === 'SPAM') {
      await activityLog.comment.markedAsSpam(session.user.id, comment.id)
    }

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Error updating comment status:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to delete comments
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the comment with post details for activity logging
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: {
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 })
    }

    // Log the deletion before actually deleting
    await activityLog.comment.deleted(
      session.user.id,
      comment.id,
      true // permanent deletion
    )

    // Delete the comment
    await prisma.comment.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

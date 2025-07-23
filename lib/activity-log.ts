import { prisma } from './db'

// Activity types for better type safety
export type ActivityType = 
  | 'comment' 
  | 'post' 
  | 'user' 
  | 'project' 
  | 'publication' 
  | 'settings'
  | 'authentication'

export type ActivityAction = 
  // Generic actions
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'approved' 
  | 'rejected' 
  | 'published' 
  | 'unpublished'
  
  // User actions
  | 'logged_in' 
  | 'logged_out' 
  | 'registered'
  | 'password_changed'
  | 'profile_updated'
  
  // Status changes
  | 'status_changed' 
  | 'role_changed' 
  | 'role_updated'
  
  // Comment specific
  | 'replied'
  | 'flagged'
  | 'marked_as_spam'
  | 'marked_as_ham'
  | 'edited'

interface LogActivityParams {
  userId: string
  type: ActivityType
  action: ActivityAction
  title: string
  metadata?: Record<string, any>
}

export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        type: params.type,
        action: params.action,
        title: params.title,
        metadata: params.metadata || {},
      },
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw the error to avoid breaking the main functionality
  }
}

// Helper functions for common activities
export const activityLog = {
  // User activities
  user: {
    registered: (userId: string, email: string) =>
      logActivity({
        userId,
        type: 'user',
        action: 'registered',
        title: `New user registered: ${email}`,
      }),
    loggedIn: (userId: string) =>
      logActivity({
        userId,
        type: 'user',
        action: 'logged_in',
        title: 'User logged in',
      }),
    updatedProfile: (userId: string) =>
      logActivity({
        userId,
        type: 'user',
        action: 'updated',
        title: 'Profile updated',
      }),
    roleChanged: async (
      adminId: string, 
      targetUserId: string, 
      targetUserEmail: string, 
      oldRole: string, 
      newRole: string
    ) => {
      await logActivity({
        userId: adminId,
        type: 'user',
        action: 'role_updated',
        title: `User role changed from ${oldRole} to ${newRole}`,
        metadata: {
          targetUserId,
          targetUserEmail,
          oldRole,
          newRole,
          updatedAt: new Date().toISOString()
        }
      });
    },
  },

  // Comment activities
  comment: {
    created: (userId: string, commentId: string, postTitle: string, isReply: boolean = false) =>
      logActivity({
        userId,
        type: 'comment',
        action: isReply ? 'replied' : 'created',
        title: isReply 
          ? `Replied to a comment on post: ${postTitle}`
          : `New comment on post: ${postTitle}`,
        metadata: { 
          commentId, 
          postTitle,
          isReply,
          timestamp: new Date().toISOString() 
        },
      }),
      
    updated: (userId: string, commentId: string, postTitle: string, changes: Record<string, any>) =>
      logActivity({
        userId,
        type: 'comment',
        action: 'updated',
        title: `Comment updated on post: ${postTitle}`,
        metadata: { 
          commentId, 
          postTitle,
          changes,
          timestamp: new Date().toISOString() 
        },
      }),
      
    approved: (adminId: string, commentId: string, postTitle?: string) =>
      logActivity({
        userId: adminId,
        type: 'comment',
        action: 'approved',
        title: `Comment approved${postTitle ? ` on post: ${postTitle}` : ''}`,
        metadata: { 
          commentId, 
          postTitle,
          approvedAt: new Date().toISOString() 
        },
      }),
      
    rejected: (adminId: string, commentId: string, reason?: string) =>
      logActivity({
        userId: adminId,
        type: 'comment',
        action: 'rejected',
        title: `Comment rejected: #${commentId}`,
        metadata: { 
          commentId, 
          reason,
          rejectedAt: new Date().toISOString() 
        },
      }),
      
    deleted: (adminId: string, commentId: string, permanent: boolean = false) =>
      logActivity({
        userId: adminId,
        type: 'comment',
        action: 'deleted',
        title: `${permanent ? 'Permanently ' : ''}Deleted comment: #${commentId}`,
        metadata: { 
          commentId, 
          permanentDeletion: permanent,
          deletedAt: new Date().toISOString() 
        },
      }),
      
    flagged: (userId: string, commentId: string, reason: string) =>
      logActivity({
        userId,
        type: 'comment',
        action: 'flagged',
        title: `Comment flagged for review: #${commentId}`,
        metadata: { 
          commentId, 
          reason,
          flaggedAt: new Date().toISOString() 
        },
      }),
      
    markedAsSpam: (adminId: string, commentId: string) =>
      logActivity({
        userId: adminId,
        type: 'comment',
        action: 'marked_as_spam',
        title: `Comment marked as spam: #${commentId}`,
        metadata: { 
          commentId,
          markedAt: new Date().toISOString() 
        },
      }),
      
    markedAsHam: (adminId: string, commentId: string) =>
      logActivity({
        userId: adminId,
        type: 'comment',
        action: 'marked_as_ham',
        title: `Comment marked as not spam: #${commentId}`,
        metadata: { 
          commentId,
          markedAt: new Date().toISOString() 
        },
      }),
  },

  // Post activities
  post: {
    created: (userId: string, postId: string, title: string) =>
      logActivity({
        userId,
        type: 'post',
        action: 'created',
        title: `New post created: "${title}"`,
        metadata: { postId },
      }),
    updated: (userId: string, postId: string, title: string) =>
      logActivity({
        userId,
        type: 'post',
        action: 'updated',
        title: `Post updated: "${title}"`,
        metadata: { postId },
      }),
    published: (userId: string, postId: string, title: string) =>
      logActivity({
        userId,
        type: 'post',
        action: 'published',
        title: `Post published: "${title}"`,
        metadata: { postId },
      }),
  },

  // Project activities
  project: {
    created: (userId: string, projectId: string, title: string) =>
      logActivity({
        userId,
        type: 'project',
        action: 'created',
        title: `New project created: "${title}"`,
        metadata: { projectId },
      }),
    updated: (userId: string, projectId: string, title: string) =>
      logActivity({
        userId,
        type: 'project',
        action: 'updated',
        title: `Project updated: "${title}"`,
        metadata: { projectId },
      }),
  },

  // Settings activities
  settings: {
    updated: (userId: string, section: string) =>
      logActivity({
        userId,
        type: 'settings',
        action: 'updated',
        title: `Settings updated: ${section}`,
      }),
  },
}

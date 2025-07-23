/**
 * Email templates for the application
 * These templates use the nodemailer package for sending emails
 */

export type EmailTemplate = {
  subject: string
  html: string
  text: string
}

const templates = {
  /**
   * Template for notifying admins about a new comment
   */
  newCommentNotification: (data: {
    postTitle: string
    postUrl: string
    authorName: string
    content: string
    commentUrl: string
  }): EmailTemplate => {
    const { postTitle, postUrl, authorName, content, commentUrl } = data
    
    const textContent = `New comment on "${postTitle}" by ${authorName}\n\n${content}\n\nView comment: ${commentUrl}\nView post: ${postUrl}`;
    
    return {
      subject: `New Comment on "${postTitle}"`,
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f46e5; padding: 20px; color: white; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 15px 0;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              border-radius: 4px;
            }
            .footer { 
              margin-top: 20px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 14px; 
              color: #6b7280; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Comment on "${postTitle}"</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p>A new comment has been posted on the blog post <strong>${postTitle}</strong> by <strong>${authorName}</strong>.</p>
              
              <div style="background: white; padding: 15px; border-left: 4px solid #e5e7eb; margin: 15px 0;">
                <p>${content}</p>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${commentUrl}" class="button">Review Comment</a>
              </div>
              
              <p>Or visit the <a href="${postUrl}">blog post</a> to see the comment in context.</p>
              
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Dr. Abel Health Consultancy. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }
  },

  /**
   * Template for notifying users about a reply to their comment
   */
  commentReplyNotification: (data: {
    postTitle: string
    postUrl: string
    authorName: string
    content: string
    replyContent: string
    commentUrl: string
  }): EmailTemplate => {
    const { postTitle, postUrl, authorName, content, replyContent, commentUrl } = data
    
    const text = `${authorName} replied to your comment on "${postTitle}":

${replyContent}

View reply: ${commentUrl}`
    
    return {
      subject: `${authorName} replied to your comment on "${postTitle}"`,
      text,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f46e5; padding: 20px; color: white; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .comment {
              background: white;
              padding: 15px;
              border-left: 4px solid #e5e7eb;
              margin: 15px 0;
            }
            .reply {
              background: #f0f9ff;
              padding: 15px;
              border-left: 4px solid #7dd3fc;
              margin: 15px 0 15px 30px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 15px 0;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              border-radius: 4px;
            }
            .footer { 
              margin-top: 20px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 14px; 
              color: #6b7280; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Reply to Your Comment</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p><strong>${authorName}</strong> has replied to your comment on the blog post <strong>${postTitle}</strong>.</p>
              
              <div class="comment">
                <p><strong>Your comment:</strong></p>
                <p>${content}</p>
              </div>
              
              <div class="reply">
                <p><strong>${authorName} replied:</strong></p>
                <p>${replyContent}</p>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${commentUrl}" class="button">View Reply</a>
              </div>
              
              <p>Or visit the <a href="${postUrl}">blog post</a> to see the full conversation.</p>
              
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p> Dr. Abel Health Consultancy. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }
  },

  /**
   * Template for comment approval notification
   */
  commentApproved: (data: {
    authorName: string
    postTitle: string
    postUrl: string
    content: string
    commentUrl: string
  }): EmailTemplate => {
    const { authorName, postTitle, postUrl, content, commentUrl } = data
    
    return {
      subject: `Your comment on "${postTitle}" has been approved`,
      text: `Hello,

Your comment on the blog post "${postTitle}" has been approved and is now visible to other readers.

Your comment:
${content}

View your comment: ${commentUrl}
View the blog post: ${postUrl}

Best regards,
Dr. Abel Health Consultancy`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; padding: 20px; color: white; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .comment {
              background: white;
              padding: 15px;
              border-left: 4px solid #10b981;
              margin: 15px 0;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 15px 0;
              background-color: #10b981;
              color: white;
              text-decoration: none;
              border-radius: 4px;
            }
            .footer { 
              margin-top: 20px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 14px; 
              color: #6b7280; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Comment Approved</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your comment on the blog post <strong>${postTitle}</strong> has been approved and is now visible to other readers.</p>
              
              <div class="comment">
                <p>${content}</p>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${commentUrl}" class="button">View Comment</a>
              </div>
              
              <p>Or visit the <a href="${postUrl}">blog post</a> to see your comment in context.</p>
              
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Dr. Abel Health Consultancy. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }
  },

  /**
   * Template for comment rejection notification
   */
  commentRejected: (data: {
    postTitle: string
    reason?: string
  }): EmailTemplate => {
    const { postTitle, reason } = data
    const rejectionReason = reason || 'It did not meet our community guidelines.'
    
    return {
      subject: `Your comment on "${postTitle}" was not approved`,
      text: `Your comment on the blog post "${postTitle}" was not approved. ${rejectionReason}

Please review our community guidelines and try again.

Best regards,
Dr. Abel Health Consultancy`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ef4444; padding: 20px; color: white; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .reason {
              background: white;
              padding: 15px;
              border-left: 4px solid #ef4444;
              margin: 15px 0;
            }
            .footer { 
              margin-top: 20px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 14px; 
              color: #6b7280; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Comment Not Approved</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We're sorry, but your comment on the blog post <strong>${postTitle}</strong> could not be approved at this time.</p>
              
              ${reason ? `
                <div class="reason">
                  <p><strong>Reason:</strong></p>
                  <p>${reason}</p>
                </div>
              ` : ''}
              
              <p>Please review our community guidelines and feel free to submit another comment.</p>
              
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Dr. Abel Health Consultancy. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }
  },
} as const

export const emailTemplates = templates
export default templates

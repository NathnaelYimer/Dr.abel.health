import nodemailer from 'nodemailer'
import type { EmailTemplate } from '@/lib/email-templates'
import { emailTemplates as importedTemplates } from '@/lib/email-templates'

type EmailTemplateFunction = (params: any) => EmailTemplate

// Define individual parameter types for each template
interface NewCommentNotificationParams {
  postTitle: string
  postUrl: string
  authorName: string
  content: string
  commentUrl: string
}

interface CommentReplyNotificationParams extends NewCommentNotificationParams {
  replyContent: string
}

interface CommentApprovedParams {
  authorName: string
  postTitle: string
  postUrl: string
  content: string
}

interface CommentRejectedParams {
  postTitle: string
  reason?: string
}

type TemplateParams = {
  newCommentNotification: NewCommentNotificationParams
  commentReplyNotification: CommentReplyNotificationParams
  commentApproved: CommentApprovedParams
  commentRejected: CommentRejectedParams
}

type TemplateName = keyof TemplateParams

// Create a test account if in development and no SMTP server is configured
const createTestTransporter = async () => {
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVER_HOST) {
    const testAccount = await nodemailer.createTestAccount()
    return {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }
  }
  
  return {
    host: process.env.EMAIL_SERVER_HOST,
    port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  }
}

// Create transporter with proper error handling
let transporter: nodemailer.Transporter

try {
  const transporterConfig = await createTestTransporter()
  transporter = nodemailer.createTransport(transporterConfig)
  
  // Verify connection configuration
  await transporter.verify()
  console.log('Email server is ready to take our messages')
} catch (error) {
  console.error('Failed to create email transporter:', error)
  // Create a mock transporter that logs emails to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using mock email transporter in development mode')
    transporter = {
      sendMail: (mailOptions: MailOptions) => {
        console.log('\n--- EMAIL SENT ---')
        console.log('To:', mailOptions.to)
        console.log('Subject:', mailOptions.subject)
        console.log('Preview URL:', nodemailer.getTestMessageUrl({} as any) || 'N/A (not using ethereal)')
        return Promise.resolve({ messageId: 'mock-message-id', response: '250 OK' } as nodemailer.SentMessageInfo)
      },
    } as unknown as nodemailer.Transporter
  } else {
    throw new Error('Failed to initialize email service')
  }
}

interface MailOptions {
  from: string
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content?: string | Buffer
    path?: string
    contentType?: string
  }>
}

/**
 * Send an email using the configured transporter
 */
/**
 * Send an email using the specified template
 * @param to Recipient email address
 * @param templateName Name of the template to use
 * @param data Template-specific data
 */
export async function sendEmail<T extends TemplateName>(
  to: string,
  templateName: T,
  data: TemplateParams[T]
) {
  const templateFn = importedTemplates[templateName as keyof typeof importedTemplates] as (
    params: TemplateParams[TemplateName]
  ) => EmailTemplate
  
  if (!templateFn) {
    throw new Error(`Email template ${String(templateName)} not found`)
  }
  
  // Type assertion to ensure type safety - we know the data matches the template's expected params
  const template = templateFn(data as any)
  const mailOptions: MailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@drabel.com',
    to,
    subject: template.subject,
    html: template.html,
    text: template.text || ''
  }

  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized')
    }

    const info = await transporter.sendMail({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text || (mailOptions.html ? undefined : 'Please enable HTML to view this email'),
      replyTo: mailOptions.replyTo,
      attachments: mailOptions.attachments || [],
    })

    // Log successful email sending in development
    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        console.log(`Preview URL: ${previewUrl}`)
      }
    }

    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) }
  } catch (error) {
    console.error('Email sending failed:', error)
    
    // In development, log the error but don't fail the request
    if (process.env.NODE_ENV === 'development') {
      console.warn('Email sending failed, but continuing in development mode')
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        messageId: 'error-' + Date.now()
      }
    }
    
    // In production, rethrow the error
    throw error
  }
}

// Legacy templates (keep for backward compatibility)
const legacyEmailTemplates = {
  // Contact confirmation email
  contactConfirmation: (name: string) => ({
    subject: "Thank you for contacting Dr. Abel Health Consultancy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank you for your inquiry</h2>
        <p>Dear ${name},</p>
        <p>Thank you for contacting Dr. Abel Gedefaw Ali Health Consultancy. We have received your message and will respond within 24 hours.</p>
        <p>Our team of health professionals is committed to providing you with expert guidance and support.</p>
        <p>Best regards,<br>Dr. Abel Health Consultancy Team</p>
      </div>
    `,
  }),
  
  // New comment notification to admin
  newCommentNotification: (params: {
    postTitle: string
    postUrl: string
    authorName: string
    content: string
    commentUrl: string
  }) => ({
    subject: `New Comment on "${params.postTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Comment on "${params.postTitle}"</h2>
        <p><strong>From:</strong> ${params.authorName}</p>
        <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0;">
          ${params.content}
        </div>
        <div style="margin: 20px 0;">
          <a href="${params.commentUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View & Moderate
          </a>
        </div>
        <p>Or visit: <a href="${params.postUrl}">${params.postUrl}</a></p>
        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          This is an automated notification from Dr. Abel Health Consultancy.
        </p>
      </div>
    `,
  }),
  
  // Comment reply notification
  commentReplyNotification: (params: {
    postTitle: string
    postUrl: string
    authorName: string
    content: string
    replyContent: string
    commentUrl: string
  }) => ({
    subject: `New Reply to Your Comment on "${params.postTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Reply to Your Comment</h2>
        <p>Hello ${params.authorName},</p>
        <p>Someone has replied to your comment on the post "${params.postTitle}":</p>
        
        <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 3px solid #ddd;">
          <p><em>Your original comment:</em></p>
          <div style="padding: 10px; background: white; margin: 10px 0; border: 1px solid #eee;">
            ${params.content}
          </div>
          
          <p><em>New reply:</em></p>
          <div style="padding: 10px; background: white; margin: 10px 0; border: 1px solid #eee; border-left: 3px solid #2563eb;">
            ${params.replyContent}
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <a href="${params.commentUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Conversation
          </a>
        </div>
        
        <p>Or visit: <a href="${params.postUrl}">${params.postUrl}</a></p>
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          You're receiving this email because you commented on Dr. Abel Health Consultancy.
          <br>
          <a href="${process.env.NEXTAUTH_URL}/preferences" style="color: #2563eb;">Update notification preferences</a>
        </p>
      </div>
    `,
  }),

  appointmentConfirmation: (name: string, date: string) => ({
    subject: "Appointment Confirmation - Dr. Abel Health Consultancy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmed</h2>
        <p>Dear ${name},</p>
        <p>Your appointment has been scheduled for ${date}.</p>
        <p>We will contact you 24 hours before your appointment with further details.</p>
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <p>Best regards,<br>Dr. Abel Health Consultancy Team</p>
      </div>
    `,
  }),

  newsletterWelcome: (email: string) => ({
    subject: "Welcome to Dr. Abel Health Updates",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to our newsletter!</h2>
        <p>Thank you for subscribing to Dr. Abel Health Consultancy updates.</p>
        <p>You'll receive the latest health research insights, policy updates, and expert commentary.</p>
        <p>You can unsubscribe at any time by clicking the link in our emails.</p>
        <p>Best regards,<br>Dr. Abel Health Consultancy Team</p>
      </div>
    `,
  }),
}

const templateFunctions = {
  newsletterWelcome(email: string) {
    return {
      subject: 'Welcome to our newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to our newsletter!</h2>
          <p>Thank you for subscribing to the Dr. Abel Health Consultancy newsletter.</p>
          <p>You'll receive updates on our latest blog posts, health tips, and special offers.</p>
          <p>If you didn't subscribe, you can safely ignore this email.</p>
          <p>Best regards,<br>Dr. Abel Health Consultancy Team</p>
        </div>
      `,
      text: `Welcome to our newsletter!

Thank you for subscribing to the Dr. Abel Health Consultancy newsletter.

You'll receive updates on our latest blog posts, health tips, and special offers.

If you didn't subscribe, you can safely ignore this email.

Best regards,
Dr. Abel Health Consultancy Team`
    }
  },
}

// Export the email templates for backward compatibility
export const emailTemplates = {
  ...templateFunctions,
  ...legacyEmailTemplates
}

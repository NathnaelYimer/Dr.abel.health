import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { contactSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    if (!rateLimit(request, 5, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    // Save to database
    const contact = await prisma.contact.create({
      data: validatedData,
    })

    // Send notification to admin using the newCommentNotification template
    await sendEmail(
      process.env.ADMIN_EMAIL!,
      'newCommentNotification',
      {
        postTitle: 'New Contact Form Submission',
        postUrl: `${process.env.NEXTAUTH_URL}/admin/contacts`,
        authorName: validatedData.name,
        content: `New contact form submission from ${validatedData.name} (${validatedData.email})\n        \nSubject: ${validatedData.subject}\nMessage: ${validatedData.message}`,
        commentUrl: `${process.env.NEXTAUTH_URL}/admin/contacts`
      }
    );
    
    // For the user confirmation, we'll use the commentApproved template as it has a similar structure
    await sendEmail(
      validatedData.email,
      'commentApproved',
      {
        authorName: validatedData.name,
        postTitle: 'Your Contact Form Submission',
        postUrl: `${process.env.NEXTAUTH_URL}/contact`,
        content: 'Thank you for reaching out. We have received your message and will get back to you as soon as possible.'
      }
    );

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We will respond within 24 hours.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to submit contact form. Please try again." }, { status: 500 })
  }
}

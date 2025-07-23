import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { newsletterSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { emailTemplates } from "@/lib/email"
import { createTransport } from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(request, 3, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const validatedData = newsletterSchema.parse(body)

    // Check if already subscribed
    const existing = await prisma.newsletter.findUnique({
      where: { email: validatedData.email },
    })

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json({ error: "Email already subscribed to newsletter." }, { status: 400 })
      } else {
        // Resubscribe
        await prisma.newsletter.update({
          where: { email: validatedData.email },
          data: { subscribed: true, language: validatedData.language },
        })
      }
    } else {
      // New subscription
      await prisma.newsletter.create({
        data: validatedData,
      })
    }

    // Send welcome email using nodemailer directly
    const welcomeEmail = emailTemplates.newsletterWelcome(validatedData.email) as {
      subject: string;
      html: string;
      text?: string;
    };
    
    const transporter = createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Dr. Abel Health Consultancy" <${process.env.EMAIL_FROM || 'noreply@drabel.com'}>`,
      to: validatedData.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
      ...(welcomeEmail.text && { text: welcomeEmail.text })
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter!",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 })
    }

    await prisma.newsletter.update({
      where: { email },
      data: { subscribed: false },
    })

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from newsletter.",
    })
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error)
    return NextResponse.json({ error: "Failed to unsubscribe. Please try again." }, { status: 500 })
  }
}

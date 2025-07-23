import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { appointmentSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(request, 3, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const validatedData = appointmentSchema.parse(body)

    const appointment = await prisma.appointment.create({
      data: validatedData,
    })

    // Send confirmation email to user
    await sendEmail(
      validatedData.email,
      'commentApproved', // Using commentApproved as a fallback template
      {
        authorName: validatedData.name,
        postTitle: 'Your Appointment Request',
        postUrl: `${process.env.NEXTAUTH_URL}/appointments`,
        content: `We have received your appointment request for ${validatedData.serviceType} on ${validatedData.preferredDate.toLocaleDateString()}. We will contact you shortly to confirm the details.`
      }
    )

    // Send notification to admin using the same template
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        'newCommentNotification',
        {
          postTitle: `New Appointment: ${validatedData.serviceType}`,
          postUrl: `${process.env.NEXTAUTH_URL}/admin/appointments`,
          authorName: validatedData.name,
          content: `
            <p><strong>Name:</strong> ${validatedData.name}</p>
            <p><strong>Email:</strong> ${validatedData.email}</p>
            <p><strong>Phone:</strong> ${validatedData.phone || "Not provided"}</p>
            <p><strong>Service Type:</strong> ${validatedData.serviceType}</p>
            <p><strong>Preferred Date:</strong> ${validatedData.preferredDate.toLocaleDateString()}</p>
            <p><strong>Message:</strong> ${validatedData.message || "None"}</p>
          `,
          commentUrl: `${process.env.NEXTAUTH_URL}/admin/appointments`
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Appointment request submitted successfully. We will contact you within 24 hours.",
    })
  } catch (error) {
    console.error("Appointment booking error:", error)
    return NextResponse.json({ error: "Failed to book appointment. Please try again." }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Decode and verify the JWT token
    // 2. Check if the token is expired
    // 3. Update the user's email verification status in the database
    
    // For demonstration, we'll simulate the verification process
    try {
      // Simulate token verification
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
      
      if (!tokenData.email || !tokenData.exp) {
        return NextResponse.json(
          { error: "Invalid token format" },
          { status: 400 }
        )
      }

      // Check if token is expired
      if (Date.now() > tokenData.exp) {
        return NextResponse.json(
          { error: "expired" },
          { status: 400 }
        )
      }

      // Update user verification status in database
      await prisma.user.update({
        where: { email: tokenData.email },
        data: { 
          emailVerified: true,
          status: 'ACTIVE', // Update status to active when email is verified
          // You might also want to update other fields
        }
      })

      return NextResponse.json(
        { message: "Email verified successfully" },
        { status: 200 }
      )

    } catch (tokenError) {
      return NextResponse.json(
        { error: "Invalid or malformed token" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

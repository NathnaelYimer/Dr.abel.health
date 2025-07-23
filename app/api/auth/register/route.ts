import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role, UserStatus } from "@prisma/client"

interface RegisterData {
  name: string
  email: string
  // Note: Password is handled by NextAuth's Account model
}

export async function POST(request: Request) {
  try {
    const { name, email } = (await request.json()) as RegisterData

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Create user without password (handled by NextAuth's Account model)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        role: Role.VIEWER,  // Default role
        status: UserStatus.ACTIVE,
        emailVerified: false, // Will be set to true after email verification
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Note: In a real application, you would typically:
    // 1. Send a verification email
    // 2. Create an Account record with the hashed password (handled by NextAuth)
    // 3. Handle the authentication flow properly

    return NextResponse.json({ 
      user,
      message: "User created successfully. Please check your email to verify your account."
    }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}

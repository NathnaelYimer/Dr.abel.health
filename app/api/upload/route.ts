import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join, extname } from "path"
import { v4 as uuidv4 } from "uuid"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/db"

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
]

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

export async function POST(request: Request) {
  try {
    // Verify user session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only images (JPG, PNG, WEBP, GIF, SVG) are allowed.' 
        },
        { status: 400 }
      )
    }

    // Validate file extension
    const fileExtension = extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file extension. Only .jpg, .jpeg, .png, .webp, .gif, and .svg are allowed.' 
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` 
        },
        { status: 400 }
      )
    }

    // Generate unique filename with original extension
    const uniqueFilename = `${uuidv4()}${fileExtension}`
    const uploadDir = join(process.cwd(), 'public/uploads')
    const filePath = join(uploadDir, uniqueFilename)

    // Ensure upload directory exists
    const fs = await import('fs/promises')
    try {
      await fs.access(uploadDir)
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Write file to disk
    await writeFile(filePath, buffer)

    // Create file URL
    const fileUrl = `/uploads/${uniqueFilename}`

    // Log the upload in the database
    try {
      await prisma.upload.create({
        data: {
          url: fileUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedBy: {
            connect: { id: session.user.id }
          }
        }
      })
    } catch (error) {
      console.error('Failed to log upload to database:', error)
      // Don't fail the upload if logging fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred while uploading the file. Please try again.' 
      },
      { status: 500 }
    )
  }
}

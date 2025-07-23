import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { postSchema } from "@/lib/validations"
import { getReadingTimeMinutes } from "@/lib/reading-time"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const language = searchParams.get("language")
    const search = searchParams.get("search")

    const where: any = {
      published: true,
      archived: false,
    }

    if (category) where.category = category
    if (language) where.language = language
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { name: true, image: true },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Posts fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the session from the request
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a post" },
        { status: 401 }
      )
    }
    
    // Check if user has required role
    if (!["ADMIN", "EDITOR"].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = postSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        slug,
        authorId: session.user.id,
        publishedAt: validatedData.published ? new Date() : null,
        readTime: getReadingTimeMinutes(validatedData.content), // Calculate accurate reading time
      },
      include: {
        author: {
          select: { name: true, image: true },
        },
      },
    })

    // Create initial version
    await prisma.postVersion.create({
      data: {
        postId: post.id,
        title: post.title,
        content: post.content,
        version: 1,
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_POST",
        resource: "POST",
        details: { postId: post.id, title: post.title },
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Post creation error:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

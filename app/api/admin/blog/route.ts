import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all blog posts (non-publication posts)
    const blogPosts = await prisma.post.findMany({
      where: {
        category: {
          notIn: [
            'RESEARCH',
            'CLINICAL_TRIALS',
            'HEALTH_POLICY',
            'CAPACITY_BUILDING',
            'MATERNAL_HEALTH',
            'INFECTIOUS_DISEASES',
            'NON_COMMUNICABLE_DISEASES',
            'DIGITAL_HEALTH',
            'NUTRITION'
          ]
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(blogPosts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN" || 
      ["admin@drabel.com", "abel@drabel.com", "admin@example.com"].includes(session.user.email || "")
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()
    
    // Create new blog post
    const blogPost = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        featuredImage: data.featuredImage,
        published: data.published || false,
        publishedAt: data.published ? new Date() : null,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt?.substring(0, 160) || '',
        author: {
          connect: { email: session.user.email! }
        }
      }
    })

    return NextResponse.json(blogPost, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

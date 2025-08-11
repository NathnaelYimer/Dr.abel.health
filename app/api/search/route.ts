import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 })
    }

    const searchTerm = query.trim()

    // Build search queries based on type
    const searchQueries = []

    if (type === 'all' || type === 'posts') {
      searchQueries.push(
        prisma.post.findMany({
          where: {
            published: true,
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { content: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            content: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                name: true,
                email: true
              }
            },
            category: true,
            tags: true
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        })
      )
    }

    if (type === 'all' || type === 'projects') {
      searchQueries.push(
        prisma.project.findMany({
          where: {
            published: true,
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              { content: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            content: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            createdBy: {
              select: {
                name: true,
                email: true
              }
            },
            type: true,
            status: true,
            tags: true
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        })
      )
    }

    if (type === 'all' || type === 'publications') {
      searchQueries.push(
        prisma.post.findMany({
          where: {
            published: true,
            category: 'RESEARCH',
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { content: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            content: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                name: true,
                email: true
              }
            },
            category: true,
            tags: true
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        })
      )
    }

    // Execute searches based on type
    let results = []
    
    if (type === 'all') {
      const [posts, projects, publications] = await Promise.all(searchQueries)
      results = [
        ...posts.map((item: any) => ({ ...item, type: 'post' })),
        ...projects.map((item: any) => ({ ...item, type: 'project' })),
        ...publications.map((item: any) => ({ ...item, type: 'publication' }))
      ]
    } else {
      const searchResults = await Promise.all(searchQueries)
      results = searchResults.flat().map((item: any) => ({ ...item, type }))
    }

    // Sort by relevance and date
    results = results.sort((a: any, b: any) => {
      const aScore = (a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ? 2 : 0) +
                    (a.content?.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0)
      const bScore = (b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ? 2 : 0) +
                    (b.content?.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0)
      
      if (aScore !== bScore) return bScore - aScore
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Get total count for pagination
    const totalCount = results.length

    return NextResponse.json({
      results: results.slice(offset, offset + limit),
      total: totalCount,
      query,
      type,
      limit,
      offset
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

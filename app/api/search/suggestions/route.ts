import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const searchTerm = query.trim()

    // Get search suggestions from posts, projects, and tags
    const [postSuggestions, projectSuggestions, tagSuggestions] = await Promise.all([
      // Post titles
      prisma.post.findMany({
        where: {
          published: true,
          title: { contains: searchTerm, mode: 'insensitive' }
        },
        select: { title: true, slug: true },
        take: 5
      }),
      
      // Project titles
      prisma.project.findMany({
        where: {
          published: true,
          title: { contains: searchTerm, mode: 'insensitive' }
        },
        select: { title: true, slug: true },
        take: 5
      }),
      
      // Tags
      prisma.tag.findMany({
        where: {
          name: { contains: searchTerm, mode: 'insensitive' }
        },
        select: { name: true, slug: true },
        take: 5
      })
    ])

    // Combine and format suggestions
    const suggestions = [
      ...postSuggestions.map(item => ({
        text: item.title,
        type: 'post',
        slug: item.slug
      })),
      ...projectSuggestions.map(item => ({
        text: item.title,
        type: 'project',
        slug: item.slug
      })),
      ...tagSuggestions.map(item => ({
        text: item.name,
        type: 'tag',
        slug: item.slug
      }))
    ]

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => 
        index === self.findIndex(t => t.text === item.text)
      )
      .slice(0, limit)

    return NextResponse.json({
      suggestions: uniqueSuggestions,
      query: searchTerm
    })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

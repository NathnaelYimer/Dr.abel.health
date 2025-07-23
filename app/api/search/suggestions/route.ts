import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchQuery = `%${query}%`;

    // Search in posts
    const postResults = await prisma.$queryRaw`
      SELECT title as text, 'post' as type
      FROM "Post"
      WHERE title ILIKE ${searchQuery} AND published = true
      LIMIT ${limit}
    `;

    // Search in projects
    const projectResults = await prisma.$queryRaw`
      SELECT title as text, 'project' as type
      FROM "Project"
      WHERE title ILIKE ${searchQuery} AND status = 'ACTIVE'
      LIMIT ${limit}
    `;

    // Search in publications
    const publicationResults = await prisma.$queryRaw`
      SELECT title as text, 'publication' as type
      FROM "Publication"
      WHERE title ILIKE ${searchQuery}
      LIMIT ${limit}
    `;

    // Combine and deduplicate results
    const allResults = [
      ...(postResults as Array<{ text: string; type: string }>),
      ...(projectResults as Array<{ text: string; type: string }>),
      ...(publicationResults as Array<{ text: string; type: string }>),
    ];

    // Deduplicate and limit results
    const uniqueResults = Array.from(
      new Map(allResults.map((item) => [item.text, item])).values()
    ).slice(0, limit);

    // Extract just the text for suggestions
    const suggestions = uniqueResults.map((item) => item.text);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}

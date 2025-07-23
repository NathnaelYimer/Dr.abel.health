import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getReadingTimeMinutes } from "@/lib/reading-time"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const publicationType = searchParams.get("publicationType")
    const search = searchParams.get("search")
    const orderBy = searchParams.get("orderBy") || "publishedAt:desc"

    // Parse orderBy parameter
    const [orderField, orderDirection] = orderBy.split(":")
    const orderConfig = {
      [orderField]: orderDirection === "asc" ? "asc" : "desc"
    }

    // Map frontend publication types to Prisma category values
    const publicationTypeMap: Record<string, string | string[]> = {
      'RESEARCH': 'RESEARCH',
      'POLICY': 'HEALTH_POLICY',
      'REPORT': 'RESEARCH',
      'GUIDELINE': 'RESEARCH',
      'ARTICLE': 'RESEARCH',
      'PRESENTATION': 'RESEARCH',
      'BOOK_CHAPTER': 'RESEARCH',
      'THESIS': 'RESEARCH',
      'OTHER': [
        'CLINICAL_TRIALS',
        'CAPACITY_BUILDING',
        'MATERNAL_HEALTH',
        'INFECTIOUS_DISEASES',
        'NON_COMMUNICABLE_DISEASES',
        'DIGITAL_HEALTH',
        'NUTRITION'
      ]
    };

    // All valid publication categories in the Prisma schema
    const allPublicationCategories = [
      'RESEARCH',
      'CLINICAL_TRIALS',
      'HEALTH_POLICY',
      'CAPACITY_BUILDING',
      'MATERNAL_HEALTH',
      'INFECTIOUS_DISEASES',
      'NON_COMMUNICABLE_DISEASES',
      'DIGITAL_HEALTH',
      'NUTRITION'
    ] as const;

    const where: any = {
      published: true,
      archived: false,
    };

    // Filter by specific publication type if specified
    if (publicationType && publicationType !== "all") {
      const mappedCategory = publicationTypeMap[publicationType];
      
      if (Array.isArray(mappedCategory)) {
        // For 'OTHER' category, include all non-research categories
        where.category = {
          in: mappedCategory
        };
      } else if (mappedCategory) {
        // For specific publication types, map to the corresponding category
        where.category = mappedCategory;
      } else if (allPublicationCategories.includes(publicationType as any)) {
        // If it's already a valid category, use it directly
        where.category = publicationType;
      } else {
        // For unknown types, show no results
        where.id = 'none';
      }
    } else {
      // Default: show all publication categories
      where.category = {
        in: allPublicationCategories
      };
    }

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ]
    }

    const skip = (page - 1) * limit

    const [publications, total] = await Promise.all([
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
        orderBy: orderConfig,
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      publications,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching publications:", error)
    return NextResponse.json(
      { error: "Failed to fetch publications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create a new publication
    const publication = await prisma.post.create({
      data: {
        ...body,
        // Ensure the category is set when creating a publication
        category: body.category || 'RESEARCH',
        published: false, // Default to unpublished
        readTime: body.content ? getReadingTimeMinutes(body.content) : 1, // Calculate reading time
      },
      include: {
        author: {
          select: { name: true, image: true },
        },
      },
    })

    return NextResponse.json(publication, { status: 201 })
  } catch (error) {
    console.error("Error creating publication:", error)
    return NextResponse.json(
      { error: "Failed to create publication" },
      { status: 500 }
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results: any = {
      posts: [],
      pages: [],
      total: 0,
    }

    if (type === "all" || type === "posts") {
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          archived: false,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { tags: { has: query } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          publishedAt: true,
          author: {
            select: { name: true },
          },
        },
        take: 10,
        orderBy: { publishedAt: "desc" },
      })

      results.posts = posts.map((post) => ({
        ...post,
        type: "post",
        url: `/blog/${post.slug}`,
      }))
    }

    // Add static pages search
    const staticPages = [
      { title: "About Us", url: "/about", content: "vision mission values team leadership" },
      { title: "Services", url: "/services", content: "research clinical trials consultation capacity building" },
      { title: "Contact", url: "/contact", content: "contact phone email address consultation" },
      { title: "FAQ", url: "/faq", content: "frequently asked questions help support" },
    ]

    if (type === "all" || type === "pages") {
      const matchingPages = staticPages.filter(
        (page) =>
          page.title.toLowerCase().includes(query.toLowerCase()) ||
          page.content.toLowerCase().includes(query.toLowerCase()),
      )

      results.pages = matchingPages.map((page) => ({
        ...page,
        type: "page",
      }))
    }

    results.total = results.posts.length + results.pages.length

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}

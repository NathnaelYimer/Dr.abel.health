import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { content, title, imageUrl } = await request.json()

    if (!content || !title) {
      return NextResponse.json(
        { error: "Content and title are required" },
        { status: 400 }
      )
    }

    // Prepare the prompt for analysis
    const prompt = `Analyze the following blog post and provide:
1. A concise summary (2-3 sentences)
2. 3-5 relevant tags
3. An SEO-optimized meta description
4. Alt text for the featured image (if provided)

Title: ${title}
Content: ${content.slice(0, 4000)}...`

    // Call OpenAI API for analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes blog content and provides structured metadata.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    })

    const analysis = completion.choices[0]?.message?.content || ""

    // Parse the response into a structured format
    const result = {
      summary: extractSection(analysis, "summary"),
      tags: extractSection(analysis, "tags"),
      metaDescription: extractSection(analysis, "meta description"),
      altText: extractSection(analysis, "alt text") || generateDefaultAltText(title),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing blog content:", error)
    return NextResponse.json(
      { error: "Failed to analyze content" },
      { status: 500 }
    )
  }
}

// Helper function to extract sections from the AI response
function extractSection(text: string, section: string): string {
  const regex = new RegExp(`(?<=${section}:?\s*)([^\n]+)`, 'i');
  const match = text.match(regex);
  return match ? match[0].trim() : '';
}

// Generate a simple alt text if AI doesn't provide one
function generateDefaultAltText(title: string): string {
  return `Featured image for blog post: ${title}`;
}

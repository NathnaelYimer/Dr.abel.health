/**
 * Calculate reading time for content
 * Based on average reading speed of 200-250 words per minute
 */

export interface ReadingTimeResult {
  minutes: number
  words: number
  text: string
}

export function calculateReadingTime(content: string): ReadingTimeResult {
  if (!content || content.trim().length === 0) {
    return {
      minutes: 1,
      words: 0,
      text: "1 min read"
    }
  }

  // Remove HTML tags if present
  const plainText = content.replace(/<[^>]*>/g, '')
  
  // Split by whitespace and filter out empty strings
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0)
  const wordCount = words.length

  // Average reading speed: 200 words per minute
  // For technical content, we use 180 WPM (slightly slower)
  const wordsPerMinute = 180
  
  // Calculate minutes and round up to nearest minute
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  
  // Generate human-readable text
  const text = minutes === 1 ? "1 min read" : `${minutes} min read`

  return {
    minutes,
    words: wordCount,
    text
  }
}

/**
 * Calculate reading time for multiple content sections
 * Useful for posts with title, excerpt, and main content
 */
export function calculateReadingTimeFromSections(sections: {
  title?: string
  excerpt?: string
  content?: string
}): ReadingTimeResult {
  const combinedContent = [
    sections.title || '',
    sections.excerpt || '',
    sections.content || ''
  ].join(' ')

  return calculateReadingTime(combinedContent)
}

/**
 * Update reading time for existing content
 * Returns the calculated minutes for database storage
 */
export function getReadingTimeMinutes(content: string): number {
  return calculateReadingTime(content).minutes
}

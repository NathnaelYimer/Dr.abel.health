import type { NextRequest } from "next/server"

const rateLimitMap = new Map()

export function rateLimit(request: NextRequest, limit = 10, windowMs = 60000) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "anonymous"
  const now = Date.now()
  const windowStart = now - windowMs

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [])
  }

  const requests = rateLimitMap.get(ip)
  const requestsInWindow = requests.filter((timestamp: number) => timestamp > windowStart)

  if (requestsInWindow.length >= limit) {
    return false
  }

  requests.push(now)
  rateLimitMap.set(ip, requests)

  return true
}

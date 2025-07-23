"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, FileText, File } from "lucide-react"
import Link from "next/link"

interface SearchResult {
  id: string
  title: string
  url: string
  type: "post" | "page"
  excerpt?: string
  author?: { name: string }
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults([...data.posts, ...data.pages])
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search articles, pages, and more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <Link
                  key={result.id || result.url}
                  href={result.url}
                  onClick={() => onOpenChange(false)}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {result.type === "post" ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : (
                        <File className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
                      {result.excerpt && <p className="text-sm text-gray-600 line-clamp-2">{result.excerpt}</p>}
                      {result.author && <p className="text-xs text-gray-500 mt-1">By {result.author.name}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="text-center py-8 text-gray-500">No results found for "{query}"</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

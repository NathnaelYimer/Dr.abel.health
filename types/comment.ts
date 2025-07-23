export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM'

export interface CommentAuthor {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export interface Comment {
  id: string
  content: string
  status: CommentStatus
  author: CommentAuthor
  postId: string
  postTitle: string
  parentId: string | null
  replies: Comment[]
  createdAt: string
  updatedAt: string
}

export interface CommentFormData {
  content: string
  postId: string
  parentId?: string | null
  authorId?: string
  authorName?: string
  authorEmail?: string
}

export interface CommentUpdateData {
  content?: string
  status?: CommentStatus
}

export interface CommentFilters {
  status?: CommentStatus
  postId?: string
  authorId?: string
  search?: string
  page?: number
  limit?: number
}

export interface CommentsResponse {
  data: Comment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

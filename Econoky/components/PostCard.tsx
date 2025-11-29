'use client'

import { Heart, MessageCircle, Send, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    image_url?: string
    likes: number
    liked_by_user: boolean
    created_at: string
    profile?: {
      id: string
      full_name: string | null
      email: string | null
      avatar_url?: string | null
    }
  }
  isAdmin?: boolean
  onDeleteComment?: (commentId: string) => void
}

interface Comment {
  id: string
  content: string
  created_at: string
  profile?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url?: string | null
  }
}

export function PostCard({ post, isAdmin = false, onDeleteComment }: PostCardProps) {
  const router = useRouter()
  const [likes, setLikes] = useState(post.likes || 0)
  const [liked, setLiked] = useState(post.liked_by_user || false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    if (showComments) {
      loadComments()
    }
  }, [showComments, post.id])

  const loadComments = async () => {
    try {
      setCommentLoading(true)
      const response = await fetch(`/api/posts/${post.id}/comments`)
      const data = await response.json()
      if (response.ok) {
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      })
      const data = await response.json()
      if (response.ok) {
        setLiked(data.liked)
        setLikes(data.likesCount)
      }
    } catch (error) {
      console.error('Error al dar like:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      setCommentLoading(true)
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText }),
      })

      if (response.ok) {
        setCommentText('')
        loadComments()
        router.refresh()
      }
    } catch (error) {
      console.error('Error al comentar:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.profile?.avatar_url ? (
            <img 
              src={post.profile.avatar_url} 
              alt={post.profile.full_name || 'Usuario'} 
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              {(post.profile?.full_name || post.profile?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h3>
            <p className="text-sm text-gray-600">
              Por {post.profile?.full_name || post.profile?.email || 'Usuario'}
            </p>
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(post.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      
      <p className="text-gray-700 mb-4 whitespace-pre-line break-words text-sm sm:text-base">{post.content}</p>
      
      {post.image_url && (
        <div className="mb-4">
          <img
            src={post.image_url}
            alt="Post image"
            className="w-full h-auto rounded-lg object-cover max-h-96"
          />
        </div>
      )}
      
      <div className="flex items-center gap-4 pt-4 border-t">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 transition-colors ${
            liked 
              ? 'text-red-600 hover:text-red-700' 
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
        </button>
        <button 
          onClick={toggleComments}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comentar</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t">
          <div className="mb-4">
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                disabled={commentLoading}
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {commentLoading && comments.length === 0 ? (
            <p className="text-gray-500 text-sm">Cargando comentarios...</p>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.profile?.full_name || comment.profile?.email || 'Usuario'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {isAdmin && onDeleteComment && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                        title="Eliminar comentario"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay comentarios aún. ¡Sé el primero en comentar!</p>
          )}
        </div>
      )}
    </div>
  )
}

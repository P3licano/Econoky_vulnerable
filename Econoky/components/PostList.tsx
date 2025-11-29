'use client'

import { PostCard } from './PostCard'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Post {
  id: string
  title: string
  content: string
  image_url?: string
  likes: number
  liked_by_user: boolean
  created_at: string | Date
  profile?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url?: string | null
  }
}

export function PostList() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadPosts()
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setIsAdmin(data.user?.role === 'admin')
    } catch {
      setIsAdmin(false)
    }
  }

  const loadPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/posts')
      const data = await res.json()
      if (res.ok) {
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadPosts()
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600">Cargando publicaciones...</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600 text-sm sm:text-base">Aún no hay publicaciones. ¡Sé el primero en publicar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={{ 
            ...post, 
            created_at: post.created_at instanceof Date 
              ? post.created_at.toISOString() 
              : post.created_at 
          }}
          isAdmin={isAdmin}
          onDeleteComment={handleDeleteComment}
        />
      ))}
    </div>
  )
}

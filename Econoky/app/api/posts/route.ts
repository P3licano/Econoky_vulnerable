import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createPost, getPosts } from '@/lib/db/posts'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const posts = await getPosts(50, user?.id)
    
    return NextResponse.json({ posts })
  } catch (error: any) {
    console.error('Error obteniendo publicaciones:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener publicaciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { title, content, image_url } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos' },
        { status: 400 }
      )
    }

    const postId = await createPost({
      user_id: user.id,
      title,
      content,
      image_url,
    })

    return NextResponse.json({ id: postId, success: true })
  } catch (error: any) {
    console.error('Error creando publicación:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear la publicación' },
      { status: 500 }
    )
  }
}


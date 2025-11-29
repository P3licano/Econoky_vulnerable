import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getComments, createComment } from '@/lib/db/posts'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json(
        { error: 'ID de publicación requerido' },
        { status: 400 }
      )
    }

    const comments = await getComments(postId)

    return NextResponse.json({ comments })
  } catch (error: any) {
    console.error('Error al obtener comentarios:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener comentarios' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const postId = params.id
    const { content } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'ID de publicación requerido' },
        { status: 400 }
      )
    }

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'El contenido del comentario es requerido' },
        { status: 400 }
      )
    }

    const commentId = await createComment({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    })

    return NextResponse.json({ id: commentId, success: true })
  } catch (error: any) {
    console.error('Error al crear comentario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear comentario' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { toggleLikePost } from '@/lib/db/posts'

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

    if (!postId) {
      return NextResponse.json(
        { error: 'ID de publicación requerido' },
        { status: 400 }
      )
    }

    const result = await toggleLikePost(postId, user.id)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error al dar like:', error)
    return NextResponse.json(
      { error: error.message || 'Error al dar like' },
      { status: 500 }
    )
  }
}


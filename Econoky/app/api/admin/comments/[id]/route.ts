import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { deleteComment } from '@/lib/db/posts'

export async function DELETE(
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

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const commentId = params.id

    if (!commentId) {
      return NextResponse.json(
        { error: 'ID de comentario requerido' },
        { status: 400 }
      )
    }

    await deleteComment(commentId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al eliminar comentario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar comentario' },
      { status: 500 }
    )
  }
}


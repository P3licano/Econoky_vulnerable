import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { markMessagesAsRead } from '@/lib/db/messages'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { otherUserId } = await request.json()

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    await markMessagesAsRead(user.id, otherUserId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al marcar mensajes como leídos:', error)
    return NextResponse.json(
      { error: error.message || 'Error al marcar mensajes como leídos' },
      { status: 500 }
    )
  }
}


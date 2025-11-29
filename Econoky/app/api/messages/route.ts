import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getMessages, createMessage, getConversations } from '@/lib/db/messages'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('userId')
    const conversations = searchParams.get('conversations') === 'true'

    if (conversations) {
      const convs = await getConversations(user.id)
      return NextResponse.json({ conversations: convs })
    }

    const messages = await getMessages(user.id, otherUserId || undefined)
    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Error al obtener mensajes:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener mensajes' },
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

    const { receiver_id, content } = await request.json()

    if (!receiver_id || !content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Receptor y contenido son requeridos' },
        { status: 400 }
      )
    }

    const messageId = await createMessage({
      sender_id: user.id,
      receiver_id,
      content: content.trim(),
    })

    return NextResponse.json({ id: messageId, success: true })
  } catch (error: any) {
    console.error('Error al crear mensaje:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear mensaje' },
      { status: 500 }
    )
  }
}


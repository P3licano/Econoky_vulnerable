import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { searchProfiles } from '@/lib/db/profiles'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''

    if (query.trim().length < 2) {
      return NextResponse.json({ users: [] })
    }

    const users = await searchProfiles(query, 10, user.id)

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Error al buscar usuarios:', error)
    return NextResponse.json(
      { error: error.message || 'No se pudieron buscar usuarios' },
      { status: 500 }
    )
  }
}


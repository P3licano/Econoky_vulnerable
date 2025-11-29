import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const profile = await getProfile(user.id)
    return NextResponse.json({ 
      user: {
        ...user,
        role: profile?.role || 'user'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}


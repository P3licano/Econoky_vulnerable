import { NextRequest, NextResponse } from 'next/server'
import { clearAuthToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-token')
  return response
}


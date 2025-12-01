import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/db/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const { user, token } = await loginUser(email, password)
    
    // Establecer cookie de autenticación
    const response = NextResponse.json({ user, success: true })
    const isProduction = process.env.NODE_ENV === 'production'
    const useSecure = isProduction || process.env.ENABLE_SECURE_COOKIES === 'true'
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: useSecure,
      sameSite: useSecure ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: error.message || 'Error al iniciar sesión' },
      { status: 401 }
    )
  }
}


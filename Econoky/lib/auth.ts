import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import Profile from '@/lib/models/Profile'
import connectDB from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido. Por favor añádelo a tus variables de entorno (.env.local)')
}
const JWT_EXPIRES_IN = '7d'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  role?: 'user' | 'admin'
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET as string,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(
  token: string
): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as {
      userId: string
      email: string
    }
    return decoded
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) return null

    const decoded = verifyToken(token)
    if (!decoded) return null

    await connectDB()
    const profile = await Profile.findById(decoded.userId).select('-password').lean()

    if (!profile) return null

    return {
      id: profile._id!.toString(),
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role || 'user',
    }
  } catch {
    return null
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    await connectDB()
    const profile = await Profile.findById(userId).select('role').lean()
    return profile?.role === 'admin'
  } catch {
    return false
  }
}

export async function setAuthToken(token: string) {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  const useSecure = isProduction || process.env.ENABLE_SECURE_COOKIES === 'true'
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: useSecure,
    sameSite: useSecure ? 'none' : 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  })
}

export async function clearAuthToken() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}


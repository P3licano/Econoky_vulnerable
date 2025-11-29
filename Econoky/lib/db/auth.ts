import Profile from '@/lib/models/Profile'
import connectDB from '@/lib/mongodb'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import crypto from 'crypto'

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.toLowerCase())
}

export async function registerUser(data: {
  email: string
  password: string
  full_name?: string
}): Promise<{ user: any; token: string; verificationToken: string }> {
  await connectDB()

  if (!isValidEmail(data.email)) {
    throw new Error('El email no tiene un formato válido')
  }

  const existingUser = await Profile.findOne({ email: data.email.toLowerCase() })
  if (existingUser) {
    throw new Error('El email ya está registrado')
  }

  const hashedPassword = await hashPassword(data.password)
  const verificationToken = crypto.randomBytes(32).toString('hex')

  const profile = await Profile.create({
    email: data.email.toLowerCase(),
    password: hashedPassword,
    full_name: data.full_name,
    balance: 0.0,
    subscription_status: 'free',
    stats: {
      posts_count: 0,
      followers_count: 0,
      following_count: 0,
    },
    is_verified: false,
    verification_token: verificationToken,
  })

  const token = generateToken(profile._id.toString(), profile.email)

  return {
    user: {
      id: profile._id.toString(),
      email: profile.email,
      full_name: profile.full_name,
      is_verified: profile.is_verified,
    },
    token,
    verificationToken,
  }
}

export async function loginUser(email: string, password: string): Promise<{ user: any; token: string }> {
  await connectDB()

  if (!isValidEmail(email)) {
    throw new Error('El email no tiene un formato válido')
  }

  const profile = await Profile.findOne({ email: email.toLowerCase() }).select('+password')
  if (!profile) {
    throw new Error('Email o contraseña incorrectos')
  }

  const isValid = await verifyPassword(password, profile.password)
  if (!isValid) {
    throw new Error('Email o contraseña incorrectos')
  }

  if (!profile.is_verified) {
    throw new Error('Tu cuenta aún no está verificada. Revisa tu correo electrónico.')
  }

  const token = generateToken(profile._id.toString(), profile.email)

  return {
    user: {
      id: profile._id.toString(),
      email: profile.email,
      full_name: profile.full_name,
      is_verified: profile.is_verified,
    },
    token,
  }
}


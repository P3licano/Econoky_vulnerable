export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import Profile from '@/lib/models/Profile'
import connectDB from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación no proporcionado' },
        { status: 400 }
      )
    }

    await connectDB()

    const profile = await Profile.findOne({ verification_token: token })

    if (!profile) {
      return NextResponse.json(
        { error: 'Token de verificación no válido o ya utilizado' },
        { status: 400 }
      )
    }

    // Verificar si ya está verificado
    if (profile.is_verified) {
      return NextResponse.json({ 
        success: true, 
        message: 'Tu cuenta ya estaba verificada' 
      })
    }

    // Actualizar usando findOneAndUpdate para asegurar la actualización
    const updatedProfile = await Profile.findOneAndUpdate(
      { verification_token: token },
      { 
        $set: { 
          is_verified: true,
          verification_token: null 
        } 
      },
      { new: true }
    )

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'No se pudo actualizar la cuenta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Cuenta verificada correctamente' 
    })
  } catch (error: any) {
    console.error('Error verificando cuenta:', error)
    return NextResponse.json(
      { error: error.message || 'Error al verificar la cuenta' },
      { status: 500 }
    )
  }
}



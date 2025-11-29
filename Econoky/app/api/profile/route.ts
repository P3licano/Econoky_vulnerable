import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateProfile } from '@/lib/db/profiles'
import { hashPassword, verifyPassword } from '@/lib/auth'
import Profile from '@/lib/models/Profile'
import connectDB from '@/lib/mongodb'

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { full_name, avatar_url, bio, currentPassword, newPassword } = await request.json()

    const updateData: any = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (bio !== undefined) updateData.bio = bio

    // Si se quiere cambiar la contraseña
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'La contraseña actual es requerida' },
          { status: 400 }
        )
      }

      await connectDB()
      const profile = await Profile.findById(user.id).select('password')
      
      if (!profile) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }

      const isValid = await verifyPassword(currentPassword, profile.password)
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Contraseña actual incorrecta' },
          { status: 400 }
        )
      }

      updateData.password = await hashPassword(newPassword)
    }

    await updateProfile(user.id, updateData)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error actualizando perfil:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el perfil' },
      { status: 500 }
    )
  }
}


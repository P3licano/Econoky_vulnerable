import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getProfile, updateProfile } from '@/lib/db/profiles'

export async function POST(request: NextRequest) {
  try {
    const { planName, price } = await request.json()

    const user = await getCurrentUser()

    if (! user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener el perfil actual del usuario
    const profile = await getProfile(user.id)

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    // ✅ VALIDACIÓN: Verificar si tiene saldo suficiente
    if (profile.balance < price) {
      return NextResponse.json(
        { 
          error: 'Saldo insuficiente',
          message: `Tu saldo actual es €${profile.balance. toFixed(2)} y necesitas €${price.toFixed(2)}`,
          currentBalance: profile.balance,
          requiredAmount: price
        },
        { status: 400 }
      )
    }

    // ⚠️ VULNERABILIDAD: Se confía en el precio enviado por el cliente
    // No hay validación del lado del servidor sobre el precio REAL del plan
    
    // Calcular nuevo saldo
    const newBalance = profile.balance - price

    // Actualizar perfil: restar el precio y activar el plan Pro
    await updateProfile(user.id, {
      balance: newBalance,
      subscription_status: 'pro',
    })

    return NextResponse.json({
      success: true,
      message: `Plan ${planName} activado por €${price. toFixed(2)}`,
      newBalance: newBalance,
      plan: 'pro'
    })
  } catch (error) {
    console. error('Error en checkout vulnerable:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    )
  }
}

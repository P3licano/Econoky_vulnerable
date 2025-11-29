import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getFinancialDashboard, saveFinancialDashboard } from '@/lib/db/financial-dashboard'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const dashboard = await getFinancialDashboard(user.id)

    return NextResponse.json({ dashboard })
  } catch (error: any) {
    console.error('Error al obtener dashboard financiero:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener dashboard financiero' },
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

    const data = await request.json()

    if (!data || typeof data.ingresos !== 'number' || typeof data.gastos !== 'number') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    await saveFinancialDashboard(user.id, {
      ingresos: data.ingresos || 0,
      gastos: data.gastos || 0,
      ahorro: data.ahorro || 0,
      inversion: data.inversion || 0,
      deuda: data.deuda || 0,
      patrimonio: data.patrimonio || 0,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al guardar dashboard financiero:', error)
    return NextResponse.json(
      { error: error.message || 'Error al guardar dashboard financiero' },
      { status: 500 }
    )
  }
}


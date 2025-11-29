export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { callFinCal } from '@/lib/fincal'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const calendar = url.searchParams.get('calendar')
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')
    const monthsAhead = url.searchParams.get('months_ahead')

    if (!calendar) {
      return NextResponse.json(
        { error: 'El calendario es requerido' },
        { status: 400 }
      )
    }

    if (!startDate && !monthsAhead) {
      return NextResponse.json(
        { error: 'Debes proporcionar start_date o months_ahead' },
        { status: 400 }
      )
    }

    const query: Record<string, string> = {
      calendar,
    }

    if (startDate) {
      query.start_date = startDate
    }

    if (endDate) {
      query.end_date = endDate
    }

    if (monthsAhead) {
      query.months_ahead = monthsAhead
    }

    const holidays = await callFinCal('holidays/range', query)

    return NextResponse.json({
      holidays: Array.isArray(holidays) ? holidays : [],
    })
  } catch (error: any) {
    console.error('Error al obtener el calendario financiero:', error)
    return NextResponse.json(
      { error: error.message || 'No se pudo obtener el calendario' },
      { status: 500 }
    )
  }
}


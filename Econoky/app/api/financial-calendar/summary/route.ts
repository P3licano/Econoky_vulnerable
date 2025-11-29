export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { callFinCal } from '@/lib/fincal'

const parseInteger = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const calendar = url.searchParams.get('calendar')
    const date = url.searchParams.get('date')
    const tplus = parseInteger(url.searchParams.get('tplus'), 2)
    const nextHolidaysCount = parseInteger(url.searchParams.get('nholidays'), 3)

    if (!calendar || !date) {
      return NextResponse.json(
        { error: 'calendar y date son requeridos' },
        { status: 400 }
      )
    }

    const queries = [
      { key: 'dayStatus', endpoint: 'day_status' },
      { key: 'isEarlyClose', endpoint: 'is_early_close' },
      { key: 'isHoliday', endpoint: 'is_holiday' },
      { key: 'nextBusinessDay', endpoint: 'next_business_day' },
      { key: 'previousBusinessDay', endpoint: 'previous_business_day' },
      { key: 'nextSettlementDate', endpoint: 'next_settlement_date' },
      { key: 'isValidSettlementDate', endpoint: 'is_valid_settlement_date' },
    ] as const

    const requests = queries.map(async (entry) => {
      const result = await callFinCal(entry.endpoint, {
        calendar,
        date,
      })
      return [entry.key, result] as const
    })

    const settlementRequest = callFinCal('settlement_date', {
      calendar,
      date,
      tplus,
    })

    const nextNHolidaysRequest = callFinCal('next_n_holidays', {
      calendar,
      start_date: date,
      n: nextHolidaysCount,
    })

    const settled = await settlementRequest
    const nextHolidays = await nextNHolidaysRequest

    const resolved = await Promise.all(requests)
    const summary = Object.fromEntries(resolved) as Record<string, unknown>
    return NextResponse.json({
      summary: {
        ...summary,
        settlementDate: settled,
        nextNHolidays: nextHolidays,
        tplus,
      },
    })
  } catch (error: any) {
    console.error('Error al obtener el resumen financiero:', error)
    return NextResponse.json(
      { error: error.message || 'No se pudo obtener el resumen' },
      { status: 500 }
    )
  }
}


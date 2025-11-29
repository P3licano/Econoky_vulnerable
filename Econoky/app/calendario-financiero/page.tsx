 'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar as CalendarIcon, Loader2, RefreshCcw } from 'lucide-react'

const CALENDARS = {
  impuestos: {
    label: 'Pago impuestos',
    description: 'Declaración de la renta y recordatorios fiscales clave.',
    apiCalendar: 'SIFMA-US',
  },
  autonomos: {
    label: 'Autónomos',
    description: 'Pagos periódicos a la seguridad social y obligaciones trimestrales.',
    apiCalendar: 'NYSE',
  },
  familias: {
    label: 'Familias',
    description: 'Festivos y días no laborables para planificar finanzas del hogar.',
    apiCalendar: 'NASDAQ',
  },
} as const

type CalendarType = keyof typeof CALENDARS

type FinCalHolidayResponse = {
  date: string
  status: string
  close_time?: string | null
}

type Holiday = {
  date: string
  status: string
  name: string
  description?: string
  closing_time?: string | null
}

type FinancialSummary = {
  dayStatus?: {
    status: string
    close_time?: string | null
    is_holiday?: boolean
    is_weekend?: boolean
  }
  isEarlyClose?: {
    is_early_close: boolean
    close_time?: string | null
  }
  isHoliday?: {
    is_holiday: boolean
  }
  nextBusinessDay?: {
    next_business_day: string
  }
  previousBusinessDay?: {
    previous_business_day: string
  }
  nextSettlementDate?: {
    next_settlement_date: string
  }
  settlementDate?: {
    settlement_date: string
  }
  isValidSettlementDate?: {
    is_valid_settlement_date: boolean
  }
  nextNHolidays?: {
    holidays: string[]
  }
  tplus?: number
}

const SUMMARY_STATUS_LABELS: Record<string, string> = {
  open: 'Día operativo',
  closed: 'Cierre completo',
  full_close: 'Cierre total',
  early_close: 'Cierre temprano',
  weekday: 'Día hábil',
  weekend: 'Fin de semana',
}

const formatCurrencyDate = (date: Date) =>
  date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

const formatISODate = (date: Date) => date.toISOString().split('T')[0]

const getHolidayLabel = (status: string) =>
  SUMMARY_STATUS_LABELS[status] ||
  status
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : ''))
    .join(' ')

const formatSummaryBoolean = (value?: boolean) =>
  value === undefined ? '—' : value ? 'Sí' : 'No'

export default function CalendarioFinancieroPage() {
  const [calendarType, setCalendarType] = useState<CalendarType>('impuestos')
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [events, setEvents] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const monthStart = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    [currentDate]
  )
  const monthEnd = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    [currentDate]
  )

  const fetchEvents = useCallback(async () => {
    const { apiCalendar } = CALENDARS[calendarType]
    const startDate = formatISODate(monthStart)
    const endDate = formatISODate(monthEnd)

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/financial-calendar/holidays?calendar=${apiCalendar}&start_date=${startDate}&end_date=${endDate}`
      )

      if (!response.ok) {
        throw new Error('Error al conectar con la API de calendario')
      }

      const data = await response.json()
      const rawEvents = Array.isArray(data?.holidays) ? data.holidays : []
      const normalized = rawEvents.map((holiday: FinCalHolidayResponse): Holiday => {
        const descriptionParts: string[] = []
        if (holiday.status === 'full_close') {
          descriptionParts.push('Cierre total')
        } else if (holiday.status === 'early_close') {
          descriptionParts.push('Cierre anticipado')
        } else {
          descriptionParts.push('Día hábil')
        }
        if (holiday.close_time) {
          descriptionParts.push(`Cierra a las ${holiday.close_time}`)
        }

        return {
          date: holiday.date,
          status: holiday.status,
          name: getHolidayLabel(holiday.status),
          description: descriptionParts.join(' • '),
          closing_time: holiday.close_time ?? null,
        }
      })
      setEvents(normalized)
    } catch (err) {
      console.error(err)
      setError('No pudimos actualizar el calendario financiero. Inténtalo nuevamente.')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [calendarType, monthStart, monthEnd])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const fetchSummary = useCallback(async () => {
    const { apiCalendar } = CALENDARS[calendarType]
    const isoDate = formatISODate(currentDate)

    setSummaryLoading(true)
    setSummaryError(null)

    try {
      const response = await fetch(
        `/api/financial-calendar/summary?calendar=${apiCalendar}&date=${isoDate}`
      )

      if (!response.ok) {
        throw new Error('Resumen no disponible')
      }

      const data = await response.json()
      setSummary(data.summary || null)
    } catch (err) {
      console.error(err)
      setSummary(null)
      setSummaryError('No pudimos cargar el resumen del día.')
    } finally {
      setSummaryLoading(false)
    }
  }, [calendarType, currentDate])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const daysMatrix = useMemo(() => {
    const days: Array<{ date: Date; inMonth: boolean }> = []
    const firstWeekDay = (monthStart.getDay() + 6) % 7 // Lunes = 0

    for (let i = firstWeekDay - 1; i >= 0; i--) {
      const date = new Date(monthStart)
      date.setDate(date.getDate() - (i + 1))
      days.push({ date, inMonth: false })
    }

    for (let i = 0; i < monthEnd.getDate(); i++) {
      const date = new Date(monthStart)
      date.setDate(date.getDate() + i)
      days.push({ date, inMonth: true })
    }

    while (days.length % 7 !== 0) {
      const date = new Date(monthEnd)
      date.setDate(date.getDate() + (days.length % 7))
      days.push({ date, inMonth: false })
    }

    return days
  }, [monthStart, monthEnd])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Holiday[]>()
    events.forEach(event => {
      const list = map.get(event.date) || []
      list.push(event)
      map.set(event.date, list)
    })
    return map
  }, [events])

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const dayStatusLabel = summary?.dayStatus?.status
    ? getHolidayLabel(summary.dayStatus.status)
    : summaryLoading
      ? 'Cargando...'
      : 'No disponible'

  const summaryCards = [
    {
      title: 'Estado del día',
      value: dayStatusLabel,
      detail: summary?.dayStatus?.close_time
        ? `Cierra a las ${summary.dayStatus.close_time}`
        : summary?.dayStatus?.is_holiday
          ? 'Feriado'
          : 'Operativo normal',
    },
    {
      title: 'Próximo día hábil',
      value: summary?.nextBusinessDay?.next_business_day || '—',
      detail: 'Siguiente jornada operativa',
    },
    {
      title: 'Próxima liquidación',
      value: summary?.settlementDate?.settlement_date || '—',
      detail: `T+${summary?.tplus ?? 2}`,
    },
    {
      title: '¿Es feriado?',
      value: summaryLoading
        ? 'Cargando...'
        : formatSummaryBoolean(summary?.isHoliday?.is_holiday),
      detail: summary?.isHoliday?.is_holiday ? 'Mercado cerrado' : 'Mercado abierto',
      accent: summary?.isHoliday?.is_holiday ? 'text-rose-600' : 'text-emerald-600',
    },
  ]

  const upcomingHolidays = summary?.nextNHolidays?.holidays || []

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#eef4ff] to-white py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="bg-white/80 backdrop-blur rounded-3xl border border-white/60 shadow-glow-primary p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary-500 font-semibold">
                Herramienta inteligente
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Calendario financiero</h1>
              <p className="text-gray-600 max-w-2xl">
                Organiza tus obligaciones fiscales y personales con un calendario conectado a la API
                de{' '}
                <a
                  href="https://fincalapi.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 underline decoration-dotted"
                >
                  fincalapi.com
                </a>
                . Cambia entre modos para impuestos, autónomos o familias.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-primary-50 text-primary-700 rounded-2xl px-5 py-4">
              <CalendarIcon className="w-10 h-10" />
              <div>
                <p className="font-semibold text-lg">{formatCurrencyDate(currentDate)}</p>
                <p className="text-sm text-primary-500">Eventos sincronizados</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {(Object.keys(CALENDARS) as CalendarType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setCalendarType(type)}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-all border ${
                    calendarType === type
                      ? 'bg-primary-600 text-white shadow-glow-primary border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {CALENDARS[type].label}
                </button>
              ))}
            </div>
            <p className="text-gray-600">{CALENDARS[calendarType].description}</p>

            <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleMonthChange('prev')}
                    className="text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    ←
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formatCurrencyDate(currentDate)}
                  </h2>
                  <button
                    onClick={() => handleMonthChange('next')}
                    className="text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    →
                  </button>
                </div>
                <button
                  onClick={() => fetchEvents()}
                  className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Actualizar
                </button>
              </div>

              <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 border-b border-gray-100">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-100">
                {daysMatrix.map(({ date, inMonth }) => {
                  const isoDate = formatISODate(date)
                  const dateEvents = eventsByDate.get(isoDate) || []

                  return (
                    <div
                      key={isoDate + inMonth}
                      className={`min-h-[110px] bg-white p-3 flex flex-col rounded-none ${
                        inMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      <span className="text-sm font-semibold">{date.getDate()}</span>

                      <div className="mt-2 space-y-2">
                        {dateEvents.slice(0, 2).map((event, index) => (
                          <div
                            key={event.name + index}
                            className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-xl"
                          >
                            {event.name}
                          </div>
                        ))}
                        {dateEvents.length > 2 && (
                          <p className="text-[11px] text-primary-500">
                            +{dateEvents.length - 2} eventos
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="px-6 py-4 text-sm text-gray-500 border-t border-gray-100 flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sincronizando con fincalapi.com...
                  </>
                ) : error ? (
                  <span className="text-red-500">{error}</span>
                ) : (
                  <>Eventos actualizados automáticamente cada vez que cambias de mes o modo.</>
                )}
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-primary-500 font-semibold">Resumen del día</p>
                  <p className="text-gray-500 text-sm">Información actualizada para {formatCurrencyDate(currentDate)}</p>
                </div>
                {summaryLoading && <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />}
              </div>

              {summaryError ? (
                <p className="px-6 py-4 text-sm text-red-500">{summaryError}</p>
              ) : (
                <div className="px-6 pb-6 pt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {summaryCards.map(card => (
                      <div
                        key={card.title}
                        className="rounded-2xl bg-gray-50 p-4 border border-gray-100 shadow-sm"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">
                          {card.title}
                        </p>
                        <p className={`text-lg font-semibold ${card.accent || 'text-gray-900'}`}>
                          {card.value}
                        </p>
                        {card.detail && (
                          <p className="text-sm text-gray-500 mt-1">{card.detail}</p>
                        )}
                      </div>
                    ))}
                  </div>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Próximos días festivos</p>
                      {summaryLoading ? (
                        <p className="text-sm text-gray-500">Cargando próximos feriados...</p>
                      ) : upcomingHolidays.length > 0 ? (
                        <ul className="space-y-1 text-sm text-gray-600">
                          {upcomingHolidays.map(date => (
                            <li key={date}>
                              {new Date(date).toLocaleDateString('es-ES', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">Sin feriados cercanos registrados.</p>
                      )}
                    </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-3xl p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.3em] mb-2">Resumen</p>
              <h3 className="text-2xl font-bold mb-1">Eventos destacados</h3>
              <p className="text-primary-100 text-sm">
                Cada tarjeta incluye el nombre y el estado reportado por fincalapi.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary max-h-[600px] overflow-y-auto divide-y divide-gray-100">
              {events.length === 0 && !loading ? (
                <div className="p-6 text-gray-500">
                  No hay eventos registrados para este mes en el calendario seleccionado.
                </div>
              ) : (
                events.map(event => (
                  <div key={event.date + event.name} className="p-5">
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{event.name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {event.status?.replace(/_/g, ' ') || 'Evento financiero'}
                    </p>
                    {event.description && (
                      <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}



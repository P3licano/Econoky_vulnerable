'use client'

import { useMemo, useState, useEffect } from 'react'
import { PiggyBank, Wallet, TrendingUp, ShieldCheck, Save } from 'lucide-react'
import { sanitizeCurrencyInput } from '@/lib/utils/number'

const numberFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
})

const decimalFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type FinancialInputs = {
  ingresos: number
  gastos: number
  ahorro: number
  inversion: number
  deuda: number
  patrimonio: number
}

type MarketIndex = {
  symbol: string
  label: string
  value: number
  change: number
  date: string
}

type CryptoAsset = {
  symbol: string
  name: string
  eur: number | null
  usd: number | null
}

type MarketOverview = {
  indices: MarketIndex[]
  crypto: CryptoAsset[] | null
  gold: {
    ounceEur: number
    change: number | null
    updatedAt: string
  } | null
  fx: {
    eurUsd: number | null
    usdEur: number | null
    eurUsdDate: string | null
    usdEurDate: string | null
  } | null
  euribor: {
    value: number
    date: string | null
    source: string
    isFallback: boolean
  }
  fetchedAt: string
}

const INITIAL_STATE: FinancialInputs = {
  ingresos: 0,
  gastos: 0,
  ahorro: 0,
  inversion: 0,
  deuda: 0,
  patrimonio: 0,
}

export default function DashboardFinancieroPage() {
  const [inputs, setInputs] = useState<FinancialInputs>(INITIAL_STATE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesError, setRatesError] = useState<string | null>(null)
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null)
  const [marketLoading, setMarketLoading] = useState(false)
  const [marketError, setMarketError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
    loadRates()
    loadMarketOverview()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/financial-dashboard')
      const data = await response.json()
      
      if (response.ok && data.dashboard) {
        setInputs(data.dashboard)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRates = async () => {
    try {
      setRatesLoading(true)
      setRatesError(null)
      const res = await fetch('https://api.frankfurter.app/latest?base=EUR&symbols=USD,GBP,CHF,JPY')
      const data = await res.json()

      if (!res.ok || !data.rates) {
        throw new Error('No se pudieron cargar las divisas')
      }

      setRates(data.rates)
    } catch (error: any) {
      console.error('Error cargando divisas:', error)
      setRatesError(error.message || 'No se pudieron cargar las divisas')
    } finally {
      setRatesLoading(false)
    }
  }

  const loadMarketOverview = async () => {
    try {
      setMarketLoading(true)
      setMarketError(null)
      const response = await fetch('/api/market-overview')
      if (!response.ok) {
        throw new Error('No se pudo actualizar la información de mercado')
      }
      const data = (await response.json()) as MarketOverview
      setMarketOverview(data)
    } catch (error: any) {
      console.error('Error cargando mercados globales:', error)
      setMarketError(error.message || 'No se pudo cargar la información de mercado')
    } finally {
      setMarketLoading(false)
    }
  }

  const saveDashboard = async () => {
    try {
      setSaving(true)
      setSaveMessage('')
      const response = await fetch('/api/financial-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      })

      if (response.ok) {
        setSaveMessage('Datos guardados correctamente')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error al guardar los datos')
      }
    } catch (error) {
      setSaveMessage('Error al guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        saveDashboard()
      }
    }, 2000) // Auto-guardar después de 2 segundos de inactividad

    return () => clearTimeout(timer)
  }, [inputs, loading])

  const derivedData = useMemo(() => {
    const flujoCaja = inputs.ingresos - inputs.gastos
    const ahorroRate = inputs.ingresos ? (inputs.ahorro / inputs.ingresos) * 100 : 0
    const inversionRate = inputs.ingresos ? (inputs.inversion / inputs.ingresos) * 100 : 0
    const deudaSobrePatrimonio = inputs.patrimonio
      ? (inputs.deuda / inputs.patrimonio) * 100
      : 0
    const patrimonioNeto =
      inputs.patrimonio + inputs.ingresos - inputs.gastos + inputs.inversion - inputs.deuda

    return {
      flujoCaja,
      ahorroRate: Math.max(0, ahorroRate),
      inversionRate: Math.max(0, inversionRate),
      deudaSobrePatrimonio: Math.max(0, deudaSobrePatrimonio),
      patrimonioNeto,
    }
  }, [inputs])

  const handleChange = (field: keyof FinancialInputs, value: string) => {
    const numericValue = sanitizeCurrencyInput(value, 100_000_000)
    setInputs(prev => ({
      ...prev,
      [field]: numericValue,
    }))
    setSaveMessage('')
  }
       
  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-[#eef4ff] via-white to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </section>
    )
  }

  const progressClass = (value: number) => {
    if (value >= 60) return 'from-emerald-400 to-emerald-500'
    if (value >= 35) return 'from-amber-400 to-amber-500'
    return 'from-rose-400 to-rose-500'
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#eef4ff] via-white to-white py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="bg-white/80 backdrop-blur rounded-3xl border border-white/60 shadow-glow-primary p-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-primary-500 font-semibold">
            Finanzas personales
          </p>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard financiero interactivo</h1>
          <p className="text-gray-600 max-w-3xl">
            Ajusta tus cifras y obtén indicadores visuales al instante. Los campos de entrada cuentan
            con alto contraste para que puedas editar tus datos sin esfuerzo, tal como en el modelo
            proporcionado.
          </p>
          <div className="bg-primary-50/70 border border-primary-100 rounded-2xl p-4 text-sm text-gray-700 space-y-2">
            <p className="font-semibold text-primary-700">Dashboard financiero con:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Principales índices: IBEX35, NASDAQ100 y S&P500</li>
              <li>Criptomonedas clave: Bitcoin y Ethereum</li>
              <li>Precio del Euríbor a un año y de la onza de oro</li>
              <li>Tipo de cambio USD/EUR y EUR/USD actualizados</li>
              <li>Campos optimizados: hasta 100 millones, máximo 9 dígitos y decimales limitados</li>
            </ul>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Mi patrimonio"
            value={numberFormatter.format(inputs.patrimonio)}
            icon={<Wallet className="w-7 h-7" />}
            accent="from-sky-400 to-sky-500"
            detail={`Patrimonio neto proyectado: ${numberFormatter.format(derivedData.patrimonioNeto)}`}
          />
          <SummaryCard
            title="Ingresos mensuales"
            value={numberFormatter.format(inputs.ingresos)}
            icon={<TrendingUp className="w-7 h-7" />}
            accent="from-emerald-400 to-emerald-500"
            detail={`Flujo de caja: ${numberFormatter.format(derivedData.flujoCaja)}`}
          />
          <SummaryCard
            title="Ahorro disponible"
            value={numberFormatter.format(inputs.ahorro)}
            icon={<PiggyBank className="w-7 h-7" />}
            accent="from-violet-400 to-violet-500"
            detail={`Ahorro sobre ingresos: ${derivedData.ahorroRate.toFixed(1)}%`}
          />
          <SummaryCard
            title="Cobertura"
            value={numberFormatter.format(inputs.deuda)}
            icon={<ShieldCheck className="w-7 h-7" />}
            accent="from-amber-400 to-amber-500"
            detail={`Deuda / patrimonio: ${derivedData.deudaSobrePatrimonio.toFixed(1)}%`}
          />
        </div>

        {saveMessage && (
          <div className={`bg-white rounded-3xl border border-white/60 shadow-glow-primary p-4 flex items-center justify-between ${
            saveMessage.includes('Error') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
          }`}>
            <p className={`text-sm ${saveMessage.includes('Error') ? 'text-red-700' : 'text-green-700'}`}>
              {saveMessage}
            </p>
            <button
              onClick={saveDashboard}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar ahora'}
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Introduce tus datos</h2>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              {(
                [
                  ['ingresos', 'Ingresos mensuales'],
                  ['gastos', 'Gastos mensuales'],
                  ['ahorro', 'Ahorro objetivo'],
                  ['inversion', 'Inversión mensual'],
                  ['deuda', 'Deuda pendiente'],
                  ['patrimonio', 'Patrimonio actual'],
                ] as Array<[keyof FinancialInputs, string]>
              ).map(([field, label]) => (
                <label key={field} className="space-y-2 text-sm font-medium text-gray-700">
                  <span className="text-xs sm:text-sm">{label}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs[field] || ''}
                    onChange={event => handleChange(field, event.target.value)}
                    max={999999999}
                    className="w-full rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-500 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="0,00"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Indicadores rápidos</h3>
              <p className="text-sm text-gray-500">Valores basados en tus entradas actuales.</p>
            </div>

            <IndicatorBar
              label="Tasa de ahorro"
              value={derivedData.ahorroRate}
              colorClass={progressClass(derivedData.ahorroRate)}
            />
            <IndicatorBar
              label="Inversión sobre ingresos"
              value={derivedData.inversionRate}
              colorClass="from-blue-400 to-blue-500"
            />
            <IndicatorBar
              label="Deuda sobre patrimonio"
              value={derivedData.deudaSobrePatrimonio}
              colorClass="from-rose-400 to-rose-500"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Pronóstico de liquidez</h3>
                <p className="text-xs sm:text-sm text-gray-500">12 meses proyectados (cifra lineal).</p>
              </div>
              <span className="text-sm font-semibold text-primary-600">
                {numberFormatter.format(derivedData.flujoCaja)}
              </span>
            </div>
            <div className="h-56 w-full bg-gradient-to-b from-primary-50 to-white rounded-2xl p-4 flex items-end gap-1">
              {Array.from({ length: 12 }).map((_, index) => {
                const multiplier = 0.8 + (index / 15)
                const value = Math.max(0, derivedData.flujoCaja * multiplier)
                const height = Math.min(100, Math.abs(value) / 50)
                return (
                  <div
                    key={index}
                    className={`flex-1 rounded-full transition-all ${
                      value >= 0 ? 'bg-primary-500/80' : 'bg-rose-400/90'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Distribución rápida</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    className="text-primary-200"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="100, 100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary-500"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${Math.min(100, derivedData.ahorroRate)}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-500">Ahorro</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {derivedData.ahorroRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <Legend label="Ahorro" value={inputs.ahorro} color="bg-primary-500" />
                <Legend label="Inversión" value={inputs.inversion} color="bg-violet-500" />
                <Legend label="Gastos" value={inputs.gastos} color="bg-rose-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Divisas principales */}
        <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Divisas principales</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Tipos de cambio frente al EUR (fuente: Frankfurter API).
              </p>
            </div>
            <button
              type="button"
              onClick={loadRates}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
              disabled={ratesLoading}
            >
              {ratesLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {ratesError && (
            <p className="text-xs text-red-600">{ratesError}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {['USD', 'GBP', 'CHF', 'JPY'].map(code => (
              <div
                key={code}
                className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 flex flex-col"
              >
                <span className="text-xs font-semibold text-gray-500">{code}</span>
                <span className="text-lg font-bold text-gray-900">
                  {rates ? rates[code]?.toFixed(4) : '—'}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">1 EUR = {code}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Pulso del mercado</h3>
                <p className="text-sm text-gray-500">
                  Seguimiento ligero de índices, cripto, Euríbor y metales.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {marketOverview?.fetchedAt && (
                  <p className="text-xs text-gray-500">
                    Actualizado: {new Date(marketOverview.fetchedAt).toLocaleString('es-ES')}
                  </p>
                )}
                <button
                  type="button"
                  onClick={loadMarketOverview}
                  disabled={marketLoading}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  {marketLoading ? 'Cargando...' : 'Refrescar'}
                </button>
              </div>
            </div>

            {marketError && (
              <p className="text-sm text-red-600">{marketError}</p>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {(marketOverview?.indices || []).map(index => (
                <div key={index.symbol} className="rounded-2xl border border-gray-100 p-4 bg-gradient-to-br from-gray-50 to-white space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-500 uppercase">{index.label}</p>
                    <span className={`text-sm font-semibold ${index.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {index.change >= 0 ? '+' : ''}
                      {decimalFormatter.format(index.change)}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{decimalFormatter.format(index.value)}</p>
                  <p className="text-xs text-gray-500">{index.date}</p>
                </div>
              ))}
              {!marketOverview?.indices?.length && !marketLoading && (
                <p className="text-sm text-gray-500 md:col-span-3">
                  Aún no hay datos de índices disponibles. Intenta refrescar.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-5 space-y-3">
              <h4 className="text-base font-semibold text-gray-900">Criptomonedas (EUR)</h4>
              <div className="space-y-3">
                {(marketOverview?.crypto || []).map(asset => (
                  <div key={asset.symbol} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{asset.name}</p>
                      <p className="text-xs text-gray-500">{asset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary-600">
                        {asset.eur ? numberFormatter.format(asset.eur) : '—'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {asset.usd ? `$${asset.usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—'}
                      </p>
                    </div>
                  </div>
                ))}
                {!marketOverview?.crypto && !marketLoading && (
                  <p className="text-sm text-gray-500">Sin datos de cripto disponibles.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-5 space-y-4">
              <h4 className="text-base font-semibold text-gray-900">Euríbor 12M y oro</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Euríbor 12 meses</p>
                    <p className="text-xs text-gray-400">
                      Fuente: {marketOverview?.euribor?.source || '—'}{' '}
                      {marketOverview?.euribor?.isFallback && '(referencia)'}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {marketOverview?.euribor
                      ? `${decimalFormatter.format(marketOverview.euribor.value)}%`
                      : '—'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Onza de oro (EUR)</p>
                    <p className="text-xs text-gray-400">
                      {marketOverview?.gold?.updatedAt
                        ? new Date(marketOverview.gold.updatedAt).toLocaleString('es-ES')
                        : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {marketOverview?.gold
                        ? numberFormatter.format(marketOverview.gold.ounceEur)
                        : '—'}
                    </p>
                    {typeof marketOverview?.gold?.change === 'number' && (
                      <p
                        className={`text-xs ${
                          marketOverview.gold.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {marketOverview.gold.change >= 0 ? '+' : ''}
                        {decimalFormatter.format(marketOverview.gold.change)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-5 space-y-4">
              <h4 className="text-base font-semibold text-gray-900">Divisas USD ↔ EUR</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">EUR / USD</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {marketOverview?.fx?.eurUsd
                      ? decimalFormatter.format(marketOverview.fx.eurUsd)
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">USD / EUR</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {marketOverview?.fx?.usdEur
                      ? decimalFormatter.format(marketOverview.fx.usdEur)
                      : '—'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Última actualización:{' '}
                  {marketOverview?.fx?.eurUsdDate
                    ? new Date(marketOverview.fx.eurUsdDate).toLocaleDateString('es-ES')
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type SummaryCardProps = {
  title: string
  value: string
  icon: React.ReactNode
  accent: string
  detail: string
}

function SummaryCard({ title, value, icon, accent, detail }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-white/60 shadow-glow-primary p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <div className={`p-3 rounded-2xl text-white bg-gradient-to-br ${accent}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{detail}</p>
    </div>
  )
}

type IndicatorBarProps = {
  label: string
  value: number
  colorClass: string
}

function IndicatorBar({ label, value, colorClass }: IndicatorBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600 font-semibold">
        <span>{label}</span>
        <span>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

type LegendProps = {
  label: string
  value: number
  color: string
}

function Legend({ label, value, color }: LegendProps) {
  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-gray-900">{numberFormatter.format(value)}</span>
    </div>
  )
}



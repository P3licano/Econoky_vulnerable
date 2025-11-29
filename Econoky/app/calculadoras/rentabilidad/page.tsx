'use client'

import { useState } from 'react'
import { clampNumber, sanitizeCurrencyInput } from '@/lib/utils/number'

export default function RentabilidadPage() {
  const [rentabilidadAnual, setRentabilidadAnual] = useState(5)
  const [aportacionMensual, setAportacionMensual] = useState(1000)
  const [capitalInicial, setCapitalInicial] = useState(5000)
  const [plazo, setPlazo] = useState(30)
  const [resultados, setResultados] = useState<any>(null)

  const sanitizePorcentaje = (value: string | number) =>
    clampNumber(value, 0, 25, { decimals: 2 })
  const sanitizeEuros = (value: string | number, max = 999999999) =>
    sanitizeCurrencyInput(value, max)
  const sanitizePlazo = (value: string | number) => clampNumber(value, 1, 50)

  const calcular = () => {
    const tasaMensual = rentabilidadAnual / 100 / 12
    const numMeses = plazo * 12
    let capital = capitalInicial
    let totalInvertido = capitalInicial
    const datosAnuales: any[] = []

    for (let mes = 1; mes <= numMeses; mes++) {
      capital = capital * (1 + tasaMensual) + aportacionMensual
      totalInvertido += aportacionMensual

      if (mes % 12 === 0) {
        const año = mes / 12
        const interesesAnuales = capital - totalInvertido
        datosAnuales.push({
          año,
          dineroDisponible: capital,
          dineroInvertido: totalInvertido,
          interesesRecibidos: interesesAnuales,
        })
      }
    }

    const interesesTotal = capital - totalInvertido
    const interesesUltimoAño = datosAnuales.length > 0 
      ? datosAnuales[datosAnuales.length - 1].interesesRecibidos 
      : 0

    setResultados({
      dineroDisponible: capital.toFixed(2),
      interesesAno: interesesUltimoAño.toFixed(2),
      inversionReal: totalInvertido.toFixed(2),
      interesesTotal: interesesTotal.toFixed(2),
      datosAnuales: datosAnuales.slice(0, 10), // Primeros 10 años para el gráfico
    })
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Calculadora de Rentabilidad</h1>
        <p className="text-gray-600 mb-8">
          Esta calculadora indica cuánto esperas ganar con tu inversión a lo largo del tiempo, teniendo en cuenta el capital inicial, el plazo, las aportaciones y la rentabilidad esperada. La calculadora no incluye aspectos fiscales e inflación.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Datos de tu inversión</h2>
          <p className="text-sm text-gray-600 mb-4">Completa los datos asociados a tu inversión.</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rentabilidad anual NETA</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={25}
                  value={rentabilidadAnual}
                  onChange={(e) => setRentabilidadAnual(sanitizePorcentaje(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aportación mensual</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999999999}
                  value={aportacionMensual}
                  onChange={(e) => setAportacionMensual(sanitizeEuros(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capital inicial</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999999999}
                  value={capitalInicial}
                  onChange={(e) => setCapitalInicial(sanitizeEuros(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plazo</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={plazo}
                  onChange={(e) => setPlazo(sanitizePlazo(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">años</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={calcular}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Calcular
            </button>
          </div>
        </div>

        {resultados && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rentabilidad</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600">Dinero disponible</p>
                  <p className="text-2xl font-bold text-primary-600">{resultados.dineroDisponible} €</p>
                </div>
                <div>
                  <p className="text-gray-600">Intereses recibidos en el año</p>
                  <p className="text-2xl font-bold text-primary-600">{resultados.interesesAno} €</p>
                </div>
                <div>
                  <p className="text-gray-600">Inversión real</p>
                  <p className="text-2xl font-bold text-primary-600">{resultados.inversionReal} €</p>
                </div>
                <div>
                  <p className="text-gray-600">Intereses recibidos en total</p>
                  <p className="text-2xl font-bold text-primary-600">{resultados.interesesTotal} €</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Evolución</h3>
              <div className="space-y-2">
                {resultados.datosAnuales.map((dato: any, index: number) => {
                  const maxValor = Math.max(
                    ...resultados.datosAnuales.map((d: any) => d.dineroDisponible)
                  )
                  const alturaDisponible = (dato.dineroDisponible / maxValor) * 100
                  const alturaInvertido = (dato.dineroInvertido / maxValor) * 100
                  const alturaIntereses = (dato.interesesRecibidos / maxValor) * 100

                  return (
                    <div key={index} className="flex items-end gap-1 h-20">
                      <div className="flex-1 flex flex-col justify-end">
                        <div className="flex gap-0.5 items-end h-full">
                          <div
                            className="bg-purple-500 flex-1"
                            style={{ height: `${alturaDisponible}%` }}
                            title={`Disponible: ${dato.dineroDisponible.toFixed(0)}€`}
                          ></div>
                          <div
                            className="bg-red-500 flex-1"
                            style={{ height: `${alturaInvertido}%` }}
                            title={`Invertido: ${dato.dineroInvertido.toFixed(0)}€`}
                          ></div>
                          <div
                            className="bg-blue-300 flex-1"
                            style={{ height: `${alturaIntereses}%` }}
                            title={`Intereses: ${dato.interesesRecibidos.toFixed(0)}€`}
                          ></div>
                        </div>
                        <p className="text-xs text-center mt-1 font-bold text-primary-600">{dato.año} año{dato.año > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4 mt-4 text-black">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-purple-500"></div>
                  <span>Dinero disponible</span>
                </div>
                <div className="flex items-center gap-1 text-black">
                  <div className="w-4 h-4 bg-red-500"></div>
                  <span>Dinero invertido</span>
                </div>
                <div className="flex items-center gap-1 text-black">
                  <div className="w-4 h-4 bg-blue-300"></div>
                  <span>Intereses recibidos</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

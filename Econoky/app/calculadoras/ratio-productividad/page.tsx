'use client'

import { useState } from 'react'
import { clampNumber, sanitizeCurrencyInput } from '@/lib/utils/number'

export default function RatioProductividadPage() {
  const [ingresos, setIngresos] = useState(1000)
  const [tiempo, setTiempo] = useState(8)
  const [resultado, setResultado] = useState<number | null>(null)

  const calcular = () => {
    const ratio = ingresos / tiempo
    setResultado(ratio)
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Calculadora de Ratio de Productividad</h1>
        <p className="text-gray-600 mb-8">
          Esta calculadora te permite saber cuánto vale una unidad de tu tiempo, teniendo en cuenta los ingresos que has producido en un periodo de tiempo.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Datos de productividad</h2>
          <p className="text-sm text-gray-600 mb-4">Completa los datos asociados a tu ratio de productividad.</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingresos producidos</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999999999}
                  value={ingresos}
                  onChange={(e) => setIngresos(sanitizeCurrencyInput(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo empleado</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={320}
                  value={tiempo}
                  onChange={(e) => setTiempo(clampNumber(e.target.value, 1, 320))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">h</span>
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

        {resultado !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tu ratio de productividad</h3>
            <p className="text-sm text-gray-600 mb-4">
              Aquí se muestra la cantidad económica producida en una hora de tu tiempo.
            </p>
            <div className="bg-white border border-blue-300 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Resultados</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Ratio de productividad</span>
                <span className="text-2xl font-bold text-primary-600">
                  {resultado.toFixed(2)} €/h
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { clampNumber, sanitizeCurrencyInput } from '@/lib/utils/number'

export default function InteresCompuestoPage() {
  const [valorActual, setValorActual] = useState(100000)
  const [tasaCapitalizar, setTasaCapitalizar] = useState(3)
  const [plazoCapitalizar, setPlazoCapitalizar] = useState(10)
  const [valorFuturo, setValorFuturo] = useState(100000)
  const [tasaActualizar, setTasaActualizar] = useState(3)
  const [plazoActualizar, setPlazoActualizar] = useState(10)
  const [resultadoCapitalizar, setResultadoCapitalizar] = useState<number | null>(null)
  const [resultadoActualizar, setResultadoActualizar] = useState<number | null>(null)

  const sanitizeEuros = (value: string | number) => sanitizeCurrencyInput(value)
  const sanitizeTasa = (value: string | number) => clampNumber(value, 0, 25, { decimals: 2 })
  const sanitizePlazo = (value: string | number) => clampNumber(value, 1, 50)

  const calcularCapitalizar = () => {
    const tasa = tasaCapitalizar / 100
    const valorFuturo = valorActual * Math.pow(1 + tasa, plazoCapitalizar)
    setResultadoCapitalizar(valorFuturo)
  }

  const calcularActualizar = () => {
    const tasa = tasaActualizar / 100
    const valorActual = valorFuturo / Math.pow(1 + tasa, plazoActualizar)
    setResultadoActualizar(valorActual)
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Calculadora de Interés Compuesto</h1>
        <p className="text-gray-600 mb-8">
          Esta calculadora te permite capitalizar y actualizar una cantidad económica.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Capitalizar */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Capitalizar</h2>
            <p className="text-sm text-gray-600 mb-4">
              Conoce el valor futuro de una cantidad inicial dados un tipo de interés y un plazo.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Actual</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                  max={999999999}
                    value={valorActual}
                    onChange={(e) => setValorActual(sanitizeEuros(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de interés/inflación</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={25}
                    value={tasaCapitalizar}
                    onChange={(e) => setTasaCapitalizar(sanitizeTasa(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plazo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={plazoCapitalizar}
                    onChange={(e) => setPlazoCapitalizar(sanitizePlazo(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">años</span>
                </div>
              </div>

              <button
                onClick={calcularCapitalizar}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Calcular
              </button>
            </div>
          </div>

          {/* Actualizar */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Actualizar</h2>
            <p className="text-sm text-gray-600 mb-4">
              Conoce el valor presente de una cantidad final dados un tipo de interés y un plazo.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Futuro</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                  max={999999999}
                    value={valorFuturo}
                    onChange={(e) => setValorFuturo(sanitizeEuros(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de interés/inflación</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={25}
                    value={tasaActualizar}
                    onChange={(e) => setTasaActualizar(sanitizeTasa(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plazo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={plazoActualizar}
                    onChange={(e) => setPlazoActualizar(sanitizePlazo(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">años</span>
                </div>
              </div>

              <button
                onClick={calcularActualizar}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Calcular
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resultados Capitalización */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Resultados de la capitalización</h3>
            <p className="text-sm text-gray-600 mb-4">
              Este es el valor futuro de tu cantidad inicial al cabo del plazo seleccionado.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor futuro</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={resultadoCapitalizar !== null ? resultadoCapitalizar.toFixed(2) : ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                />
                <span className="text-gray-600">€</span>
              </div>
            </div>
          </div>

          {/* Resultados Actualización */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Resultados de la actualización</h3>
            <p className="text-sm text-gray-600 mb-4">
              Este es el valor actual de tu cantidad futura en base al plazo seleccionado.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor actual</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={resultadoActualizar !== null ? resultadoActualizar.toFixed(2) : ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                />
                <span className="text-gray-600">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

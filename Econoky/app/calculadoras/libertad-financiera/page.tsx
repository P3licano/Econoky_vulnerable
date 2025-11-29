'use client'

import { useState } from 'react'
import { clampNumber, sanitizeCurrencyInput } from '@/lib/utils/number'

export default function LibertadFinancieraPage() {
  const [ingresosPasivos, setIngresosPasivos] = useState(1000)
  const [gastosCorrientes, setGastosCorrientes] = useState(500)
  const [activosLiquidos, setActivosLiquidos] = useState(5000)
  const [edad, setEdad] = useState(30)
  const [esperanzaVida, setEsperanzaVida] = useState(80)
  const [resultados, setResultados] = useState<any>(null)

  const calcular = () => {
    if (gastosCorrientes > ingresosPasivos) {
      alert('Los gastos no pueden superar los ingresos para calcular los años de libertad financiera.')
      return
    }

    const diferenciaMensual = ingresosPasivos - gastosCorrientes
    const mesesDisponibles = activosLiquidos / gastosCorrientes
    const añosLibertad = mesesDisponibles / 12
    const añosRestantes = esperanzaVida - edad
    const porcentajeVida = añosRestantes > 0 ? (añosLibertad / añosRestantes) * 100 : 0

    setResultados({
      años: añosLibertad.toFixed(2),
      porcentaje: porcentajeVida.toFixed(2),
    })
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Calculadora de Libertad Financiera</h1>
        <p className="text-gray-600 mb-8">
          Esta calculadora indica el tiempo durante el que puedes mantener el nivel de vida actual en ausencia de ingresos provenientes de un trabajo.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Datos de tu inversión</h2>
          <p className="text-sm text-gray-600 mb-4">
            Completa los datos asociados a tu inversión. Para calcular los años de libertad financiera los gastos no pueden superar los ingresos.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingresos pasivos mensuales</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999999999}
                  value={ingresosPasivos}
                  onChange={(e) => setIngresosPasivos(sanitizeCurrencyInput(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gastos corrientes mensuales</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999999999}
                  value={gastosCorrientes}
                  onChange={(e) => setGastosCorrientes(sanitizeCurrencyInput(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activos líquidos</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999999999}
                  value={activosLiquidos}
                  onChange={(e) => setActivosLiquidos(sanitizeCurrencyInput(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={edad}
                  onChange={(e) => setEdad(clampNumber(e.target.value, 18, Math.min(esperanzaVida - 5, 80)))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
                <span className="text-gray-600">años</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Esperanza de vida</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={60}
                  max={100}
                  value={esperanzaVida}
                  onChange={(e) => setEsperanzaVida(clampNumber(e.target.value, Math.max(edad + 5, 60), 100))}
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">Libertad financiera en años</h3>
              <p className="text-3xl font-bold text-primary-600">{resultados.años}</p>
              <p className="text-gray-600 mt-2">Años</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Porcentaje de libertad financiera</h3>
              <p className="text-3xl font-bold text-primary-600">{resultados.porcentaje}</p>
              <p className="text-gray-600 mt-2">%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

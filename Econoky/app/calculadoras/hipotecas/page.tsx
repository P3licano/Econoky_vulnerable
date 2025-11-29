'use client'

import { useState } from 'react'
import { clampNumber, sanitizeCurrencyInput } from '@/lib/utils/number'

export default function HipotecasPage() {
  const [capital, setCapital] = useState(100000)
  const [plazo, setPlazo] = useState(10)
  const [tipoInteres, setTipoInteres] = useState(3)
  const [cantidadAmortizar, setCantidadAmortizar] = useState(30000)
  const [anoAmortizar, setAnoAmortizar] = useState(5)
  const [mesAmortizar, setMesAmortizar] = useState(2)
  const [resultados, setResultados] = useState<any>(null)

  const sanitizeCapital = (value: string | number) => sanitizeCurrencyInput(value)
  const sanitizePlazo = (value: string | number) => clampNumber(value, 1, 40)
  const sanitizeInteres = (value: string | number) => clampNumber(value, 0, 20, { decimals: 2 })
  const sanitizeAno = (value: string | number) => clampNumber(value, 1, plazo)
  const sanitizeMes = (value: string | number) => clampNumber(value, 1, 12)

  const calcular = () => {
    // Convertir tasa anual a mensual
    const tasaMensual = tipoInteres / 100 / 12
    const numCuotas = plazo * 12

    // Calcular cuota mensual inicial
    const cuotaInicial = capital * (tasaMensual * Math.pow(1 + tasaMensual, numCuotas)) / 
                         (Math.pow(1 + tasaMensual, numCuotas) - 1)

    // Calcular total a pagar sin amortización
    const totalSinAmortizar = cuotaInicial * numCuotas
    const interesesSinAmortizar = totalSinAmortizar - capital

    // Calcular cuota en la que se amortiza
    const cuotaAmortizar = (anoAmortizar - 1) * 12 + mesAmortizar

    // Capital pendiente antes de la amortización
    const capitalPendiente = capital * (Math.pow(1 + tasaMensual, cuotaAmortizar) - 1) / 
                            (Math.pow(1 + tasaMensual, numCuotas) - 1) * 
                            (Math.pow(1 + tasaMensual, numCuotas) - Math.pow(1 + tasaMensual, cuotaAmortizar))
    
    const capitalRestante = capital - (capital * cuotaAmortizar / numCuotas) - cantidadAmortizar
    const nuevoCapital = Math.max(0, capitalRestante)
    const nuevoPlazo = numCuotas - cuotaAmortizar

    // Calcular nueva cuota después de amortización
    const nuevaCuota = nuevoCapital > 0 && nuevoPlazo > 0
      ? nuevoCapital * (tasaMensual * Math.pow(1 + tasaMensual, nuevoPlazo)) / 
        (Math.pow(1 + tasaMensual, nuevoPlazo) - 1)
      : 0

    // Calcular total con amortización
    const totalConAmortizar = (cuotaInicial * cuotaAmortizar) + (nuevaCuota * nuevoPlazo) + cantidadAmortizar
    const interesesConAmortizar = totalConAmortizar - capital
    const ahorroIntereses = interesesSinAmortizar - interesesConAmortizar

    setResultados({
      cuota: cuotaInicial.toFixed(2),
      numCuotas: numCuotas,
      tipoMensual: (tipoInteres / 12).toFixed(2),
      totalPagar: totalSinAmortizar.toFixed(2),
      interesesPagar: interesesSinAmortizar.toFixed(2),
      sobreCapital: ((interesesSinAmortizar / capital) * 100).toFixed(2),
      nuevaCuota: nuevaCuota.toFixed(2),
      ahorroIntereses: ahorroIntereses.toFixed(2),
      ahorroPorcentaje: ((ahorroIntereses / interesesSinAmortizar) * 100).toFixed(2),
    })
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Calculadora de Hipotecas</h1>
        <p className="text-gray-600 mb-8">
          Esta calculadora te permite determinar cuánto puedes ahorrar en intereses al amortizar una hipoteca anticipadamente, ya sea reduciendo la cuota mensual o el plazo del préstamo.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Datos de tu hipoteca */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-purple-600 mb-2">Datos de tu hipoteca</h2>
            <p className="text-sm text-gray-600 mb-4">Completa los datos asociados a tu hipoteca.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capital</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                  max={999999999}
                    inputMode="decimal"
                    value={capital}
                    onChange={(e) => setCapital(sanitizeCapital(e.target.value))}
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
                    max={40}
                    value={plazo}
                    onChange={(e) => setPlazo(sanitizePlazo(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">años</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de interés</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={20}
                    value={tipoInteres}
                    onChange={(e) => setTipoInteres(sanitizeInteres(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">%</span>
                </div>
              </div>

              {resultados && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cuota:</span>
                    <span className="font-semibold text-black">{resultados.cuota} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de cuotas:</span>
                    <span className="font-semibold text-black">{resultados.numCuotas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo mensual:</span>
                    <span className="font-semibold text-black">{resultados.tipoMensual} %</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagarás en total:</span>
                    <span className="font-semibold text-black">{resultados.totalPagar} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intereses que pagarás:</span>
                    <span className="font-semibold text-black">{resultados.interesesPagar} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sobre el capital supone:</span>
                    <span className="font-semibold text-black">{resultados.sobreCapital} %</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amortización parcial */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-purple-600 mb-2">Amortización parcial</h2>
            <p className="text-sm text-gray-600 mb-4">Completa los datos asociados a la amortización (devolución de una parte de la hipoteca).</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad que amortizas</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={capital}
                    value={cantidadAmortizar}
                  onChange={(e) =>
                    setCantidadAmortizar(
                      sanitizeCurrencyInput(e.target.value, Math.max(0, capital) || 0)
                    )
                  }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">En el año</label>
                <input
                  type="number"
                  min="1"
                  max={plazo}
                  value={anoAmortizar}
                    onChange={(e) => setAnoAmortizar(sanitizeAno(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">En el mes</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={mesAmortizar}
                    onChange={(e) => setMesAmortizar(sanitizeMes(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <button
            onClick={calcular}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Calcular
          </button>
        </div>

        {resultados && resultados.ahorroIntereses && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resultados de la amortización</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Nueva cuota mensual:</p>
                <p className="text-2xl font-bold text-primary-600">{resultados.nuevaCuota} €</p>
              </div>
              <div>
                <p className="text-gray-600">Ahorro en intereses:</p>
                <p className="text-2xl font-bold text-green-600">{resultados.ahorroIntereses} €</p>
                <p className="text-sm text-gray-500">({resultados.ahorroPorcentaje}% de ahorro)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

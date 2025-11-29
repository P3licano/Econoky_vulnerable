'use client'

import { useState } from 'react'
import { clampNumber, sanitizeCurrencyInput } from '@/lib/utils/number'

const formatoEUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const MAX_PENSION_ANUAL = 42823 // límite aproximado 2025 contributiva

export default function JubilacionPensionPage() {
  const [edadActual, setEdadActual] = useState(30)
  const [edadJubilacion, setEdadJubilacion] = useState(67)
  const [salarioAnual, setSalarioAnual] = useState(30000)
  const [aportacionMensual, setAportacionMensual] = useState(200)
  const [rentabilidadEsperada, setRentabilidadEsperada] = useState(5)
  const [capitalActual, setCapitalActual] = useState(0)
  const [resultados, setResultados] = useState<any>(null)

  const sanitizeEdadActual = (value: string | number) => clampNumber(value, 18, 60)
  const sanitizeEdadJubilacion = (value: string | number) => clampNumber(value, 61, 75)
  const sanitizeSalario = (value: string | number) =>
    sanitizeCurrencyInput(value, 999999999, { min: 0 })
  const sanitizeAportacion = (value: string | number) =>
    sanitizeCurrencyInput(value, 999999999)
  const sanitizeRentabilidad = (value: string | number) =>
    clampNumber(value, 0, 12, { decimals: 2 })
  const sanitizeCapital = (value: string | number) =>
    sanitizeCurrencyInput(value, 999999999)

  const calcularPensionPublica = (salario: number, edadTrabajador: number, edadJub: number) => {
    const anosCotizadosEstimados = clampNumber(edadJub - Math.max(22, edadTrabajador - 5), 15, 36)
    const porcentajeReguladora = Math.min(50 + (anosCotizadosEstimados - 15) * 0.7, 100)
    const baseReguladora = salario * 0.85
    const pensionAnual = Math.min(baseReguladora * (porcentajeReguladora / 100), MAX_PENSION_ANUAL)
    return pensionAnual / 12
  }

  const calcular = () => {
    const edadHoy = sanitizeEdadActual(edadActual)
    const edadJub = sanitizeEdadJubilacion(edadJubilacion)
    const sueldo = sanitizeSalario(salarioAnual)
    const aporte = sanitizeAportacion(aportacionMensual)
    const rentabilidad = sanitizeRentabilidad(rentabilidadEsperada)
    const capitalInicial = sanitizeCapital(capitalActual)

    setEdadActual(edadHoy)
    setEdadJubilacion(edadJub)
    setSalarioAnual(sueldo)
    setAportacionMensual(aporte)
    setRentabilidadEsperada(rentabilidad)
    setCapitalActual(capitalInicial)

    const añosRestantes = Math.max(edadJub - edadHoy, 1)
    const mesesRestantes = añosRestantes * 12
    const tasaMensual = rentabilidad / 100 / 12

    // Calcular capital acumulado al jubilarse
    let capital = capitalInicial
    let totalAportado = capitalInicial

    for (let mes = 1; mes <= mesesRestantes; mes++) {
      capital = capital * (1 + tasaMensual) + aporte
      totalAportado += aporte
    }

    const interesesGenerados = capital - totalAportado

    // Calcular pensión mensual estimada (usando regla del 4% - retiro seguro)
    const tasaRetiroSeguro = 0.04 / 12 // 4% anual dividido entre 12 meses
    const pensionMensualEstimada = capital * tasaRetiroSeguro

    // Calcular pensión pública estimada siguiendo normativa española
    const pensionPublicaEstimada = calcularPensionPublica(sueldo, edadHoy, edadJub)

    // Calcular pensión total
    const pensionTotalMensual = pensionMensualEstimada + pensionPublicaEstimada

    // Calcular años que durará el capital privado (asumiendo retiro del 4% anual)
    const añosDuracionCapital = capital > 0 ? capital / (pensionMensualEstimada * 12) : 0

    // Calcular cuánto necesitas ahorrar para una pensión objetivo
    const pensionObjetivoMensual = sueldo * 0.7 / 12 // 70% del salario actual
    const pensionObjetivoPrivada = pensionObjetivoMensual - pensionPublicaEstimada
    const capitalNecesario = pensionObjetivoPrivada > 0 
      ? pensionObjetivoPrivada * 12 / 0.04 
      : 0

    setResultados({
      capitalAcumulado: capital,
      totalAportado,
      interesesGenerados,
      pensionMensualPrivada: pensionMensualEstimada,
      pensionMensualPublica: pensionPublicaEstimada,
      pensionTotalMensual,
      añosDuracionCapital,
      pensionObjetivoMensual,
      capitalNecesario,
      añosRestantes,
      datosAnuales: calcularEvolucionAnual(capitalInicial, aporte, tasaMensual, añosRestantes),
    })
  }

  const calcularEvolucionAnual = (capitalInicial: number, aportacionMensual: number, tasaMensual: number, años: number) => {
    const datos: any[] = []
    let capital = capitalInicial
    let totalAportado = capitalInicial

    for (let año = 1; año <= Math.min(años, 30); año++) {
      for (let mes = 1; mes <= 12; mes++) {
        capital = capital * (1 + tasaMensual) + aportacionMensual
        totalAportado += aportacionMensual
      }
      datos.push({
        año,
        capital: capital,
        aportado: totalAportado,
        intereses: capital - totalAportado
      })
    }

    return datos
  }

  const maxCapital = resultados?.datosAnuales?.reduce(
    (max: number, dato: any) => Math.max(max, dato.capital),
    0
  )

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-secondary-dark">Calculadora de Jubilación y Pensión</h1>
        <p className="text-secondary-dark/80 mb-4">
          Esta calculadora te permite estimar tu pensión de jubilación considerando tus ahorros privados y la pensión pública estimada. 
          Te ayuda a planificar cuánto necesitas ahorrar para alcanzar tus objetivos de jubilación.
        </p>
        <p className="text-sm text-secondary-dark/70 mb-8">
          Las estimaciones siguen las reglas generales de la Seguridad Social española: topes de pensión contributiva,
          porcentajes dependiendo de los años cotizados y edad ordinaria de jubilación.
        </p>

        <div className="bg-white/90 backdrop-blur rounded-2xl border border-secondary-light shadow-glow-primary p-6 mb-8">
          <h2 className="text-xl font-bold text-secondary-dark mb-4">Datos Personales</h2>
          <p className="text-sm text-secondary-dark/70 mb-4">Completa los datos asociados a tu situación actual y objetivos de jubilación.</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Edad actual</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={edadActual}
                  onChange={(e) => setEdadActual(sanitizeEdadActual(e.target.value))}
                  className="flex-1 px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
                />
                <span className="text-secondary-dark/70">años</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Edad de jubilación deseada</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="60"
                  max="75"
                  value={edadJubilacion}
                  onChange={(e) => setEdadJubilacion(sanitizeEdadJubilacion(e.target.value))}
                  className="flex-1 px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
                />
                <span className="text-secondary-dark/70">años</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Salario anual bruto</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={12000}
                  max={999999999}
                  value={salarioAnual}
                  onChange={(e) => setSalarioAnual(sanitizeSalario(e.target.value))}
                  className="flex-1 px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
                />
                <span className="text-secondary-dark/70">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Aportación mensual a la jubilación</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999999999}
                  value={aportacionMensual}
                  onChange={(e) => setAportacionMensual(sanitizeAportacion(e.target.value))}
                  className="flex-1 px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
                />
                <span className="text-secondary-dark/70">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Capital actual ahorrado</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999999999}
                  value={capitalActual}
                  onChange={(e) => setCapitalActual(sanitizeCapital(e.target.value))}
                  className="flex-1 px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
                />
                <span className="text-secondary-dark/70">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Rentabilidad anual esperada</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={12}
                  value={rentabilidadEsperada}
                  onChange={(e) => setRentabilidadEsperada(sanitizeRentabilidad(e.target.value))}
                  className="flex-1 px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
                />
                <span className="text-secondary-dark/70">%</span>
              </div>
              <p className="text-xs text-secondary-dark/60 mt-1">Rentabilidad neta esperada de tus inversiones</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={calcular}
              className="cta-button px-10 py-3 rounded-full inline-flex items-center justify-center"
            >
              Calcular
            </button>
          </div>
        </div>

        {resultados && (
          <div className="space-y-6">
            {/* Resultados Principales */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/90 border border-secondary-light rounded-2xl p-6 shadow-glow-primary">
                <h3 className="text-xl font-bold text-secondary-dark mb-4">Capital Acumulado</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-secondary-dark/70">Capital al jubilarse</p>
                    <p className="text-3xl font-bold text-primary-600">{formatoEUR.format(resultados.capitalAcumulado)}</p>
                  </div>
                  <div className="pt-3 border-t border-secondary-light">
                    <p className="text-sm text-secondary-dark/70">Total aportado</p>
                    <p className="text-lg font-semibold text-secondary-dark">{formatoEUR.format(resultados.totalAportado)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-dark/70">Intereses generados</p>
                    <p className="text-lg font-semibold text-green-600">{formatoEUR.format(resultados.interesesGenerados)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 border border-secondary-light rounded-2xl p-6 shadow-glow-primary">
                <h3 className="text-xl font-bold text-secondary-dark mb-4">Pensión Estimada</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-secondary-dark/70">Pensión mensual total</p>
                    <p className="text-3xl font-bold text-primary-600">{formatoEUR.format(resultados.pensionTotalMensual)}</p>
                  </div>
                  <div className="pt-3 border-t border-secondary-light">
                    <p className="text-sm text-secondary-dark/70">Pensión privada (de tus ahorros)</p>
                    <p className="text-lg font-semibold text-secondary-dark">{formatoEUR.format(resultados.pensionMensualPrivada)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-dark/70">Pensión pública estimada</p>
                    <p className="text-lg font-semibold text-secondary-dark">{formatoEUR.format(resultados.pensionMensualPublica)}</p>
                    <p className="text-xs text-secondary-dark/60 mt-1">Estimación basada en el 80% del salario</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/90 border border-secondary-light rounded-2xl p-6 shadow-glow-primary">
                <h3 className="text-xl font-bold text-secondary-dark mb-4">Duración del Capital</h3>
                <p className="text-secondary-dark/80 mb-2">
                  Con una retirada del 4% anual, tu capital privado durará aproximadamente:
                </p>
                <p className="text-2xl font-bold text-primary-600">{resultados.añosDuracionCapital.toFixed(1)} años</p>
                <p className="text-xs text-secondary-dark/60 mt-2">
                  Esto es una estimación. La duración real dependerá de la rentabilidad de tus inversiones durante la jubilación.
                </p>
              </div>

              <div className="bg-white/90 border border-secondary-light rounded-2xl p-6 shadow-glow-violet">
                <h3 className="text-xl font-bold text-secondary-dark mb-4">Objetivo de Pensión</h3>
                <p className="text-secondary-dark/80 mb-2">
                  Para obtener una pensión del 70% de tu salario actual ({formatoEUR.format(resultados.pensionObjetivoMensual)} /mes):
                </p>
                <p className="text-2xl font-bold text-primary-600">{formatoEUR.format(resultados.capitalNecesario)}</p>
                <p className="text-xs text-secondary-dark/60 mt-2">
                  Capital adicional necesario en tu cuenta de jubilación (además de la pensión pública).
                </p>
              </div>
            </div>

            {/* Evolución Anual */}
            {resultados.datosAnuales && resultados.datosAnuales.length > 0 && (
              <div className="bg-white/90 border border-secondary-light rounded-2xl p-6 shadow-glow-primary">
                <h3 className="text-xl font-bold text-secondary-dark mb-4">Evolución del Capital</h3>
                <p className="text-sm text-secondary-dark/70 mb-4">
                  Visualiza cómo crece tu capital año a año combinando tus aportaciones e intereses estimados.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-secondary-dark/70 uppercase tracking-wide text-xs">
                      <tr>
                        <th className="pb-3">Año</th>
                        <th className="pb-3">Capital total</th>
                        <th className="pb-3">Aportado acumulado</th>
                        <th className="pb-3">Intereses estimados</th>
                        <th className="pb-3 w-48">Progresión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.datosAnuales.map((dato: any) => (
                        <tr key={dato.año} className="border-t border-secondary-light">
                          <td className="py-3 font-semibold text-secondary-dark">Año {dato.año}</td>
                          <td className="py-3 text-secondary-dark/80">{formatoEUR.format(dato.capital)}</td>
                          <td className="py-3 text-secondary-dark/80">{formatoEUR.format(dato.aportado)}</td>
                          <td className="py-3 text-primary-600 font-medium">{formatoEUR.format(dato.intereses)}</td>
                          <td className="py-3">
                            <div className="h-2 w-full bg-secondary-light rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-accent-aqua via-accent-sky to-accent-indigo"
                                style={{ width: maxCapital ? `${(dato.capital / maxCapital) * 100}%` : '0%' }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Nota Importante */}
            <div className="bg-secondary-light/70 border border-secondary-light rounded-2xl p-6">
              <h4 className="font-bold text-secondary-dark mb-2">⚠️ Nota Importante</h4>
              <p className="text-sm text-secondary-dark/80">
                Esta calculadora proporciona estimaciones basadas en los datos proporcionados. Los resultados reales pueden variar 
                debido a cambios en las rentabilidades, inflación, cambios en la legislación de pensiones públicas, y otros factores. 
                Se recomienda consultar con un asesor financiero para una planificación más precisa de tu jubilación.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

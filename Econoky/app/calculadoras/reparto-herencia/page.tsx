'use client'

import { useState } from 'react'
import { clampNumber, sanitizeCurrencyInput } from '@/lib/utils/number'

const euro = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)

export default function RepartoHerenciaPage() {
  const [activoNeto, setActivoNeto] = useState(250000)
  const [edadConyuge, setEdadConyuge] = useState(45)
  const [numeroHijos, setNumeroHijos] = useState(2)
  const [tieneAscendientes, setTieneAscendientes] = useState(true)
  const [tieneConyuge, setTieneConyuge] = useState(true)
  const [resultados, setResultados] = useState<any>(null)

  const sanitizeMoneda = (value: string | number, max = 999999999) =>
    sanitizeCurrencyInput(value, max)
  const sanitizeEntero = (value: string | number, min = 0, max = 10) =>
    Math.round(clampNumber(value, min, max))

  const calcular = () => {
    const capital = sanitizeMoneda(activoNeto)
    const hijos = sanitizeEntero(numeroHijos, 0, 10)
    const edad = tieneConyuge ? clampNumber(edadConyuge, 18, 99) : null

    setActivoNeto(capital)
    setNumeroHijos(hijos)
    if (tieneConyuge && edad !== null) {
      setEdadConyuge(edad)
    }

    const gananciales = tieneConyuge ? capital * 0.5 : 0
    const masaHereditaria = capital - gananciales

    if (hijos > 0) {
      const tercioLegitima = masaHereditaria / 3
      const tercioMejora = masaHereditaria / 3
      const tercioLibre = masaHereditaria / 3

      const repartoLegitima = Array.from({ length: hijos }, () => tercioLegitima / hijos)

      setResultados({
        tipo: 'descendientes',
        gananciales,
        masaHereditaria,
        hijos,
        tieneConyuge,
        opciones: {
          A: {
            descripcion: 'Tercio libre y de mejora para el cónyuge. Hijos solo legítima estricta.',
            conyuge: tieneConyuge ? gananciales + tercioLibre + tercioMejora : 0,
            hijos: repartoLegitima,
          },
          B: {
            descripcion: 'Libre y mejora para los hijos a partes iguales.',
            conyuge: tieneConyuge ? gananciales + tercioLibre : 0,
            hijos: Array.from({ length: hijos }, () => (tercioLegitima + tercioMejora) / hijos),
          },
          C: {
            descripcion: 'Libre y mejora al hijo 1 (habitual en negocios familiares).',
            conyuge: tieneConyuge ? gananciales + tercioLibre : 0,
            hijos: Array.from({ length: hijos }, (_, i) =>
              tercioLegitima / hijos + (i === 0 ? tercioMejora : 0)
            ),
          },
        },
      })
    } else {
      const legitimaAscendientes = tieneAscendientes
        ? masaHereditaria * (gananciales > 0 ? 1 / 3 : 1 / 2)
        : 0
      const libreDisposicion = masaHereditaria - legitimaAscendientes
      const edadReferencia = edad ?? 65
      const porcentajeUsufructo = tieneConyuge ? clampNumber(89 - edadReferencia, 10, 70) / 100 : 0
      const baseUsufructo = tieneAscendientes ? masaHereditaria / 2 : masaHereditaria
      const valorUsufructo = tieneConyuge ? baseUsufructo * porcentajeUsufructo : 0

      setResultados({
        tipo: 'ascendientes',
        tieneConyuge,
        gananciales,
        masaHereditaria,
        legitimaAscendientes,
        libreDisposicion,
        valorUsufructo,
        porcentajeUsufructo: porcentajeUsufructo * 100,
        mensaje: tieneConyuge
          ? tieneAscendientes
            ? 'Se calcula la legítima estricta para los ascendientes y el usufructo del 50% para el cónyuge (art. 834 CC).'
            : 'Sin descendientes ni ascendientes, el cónyuge puede recibir el resto de la herencia en plena propiedad.'
          : 'Sin cónyuge, la herencia se reparte entre ascendientes o queda libre según el Código Civil.',
      })
    }
  }

  const renderDescendientes = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          El cónyuge recibe automáticamente el 50% ({euro(resultados.gananciales)}) como gananciales y se reparten los tercios de la masa hereditaria
          ({euro(resultados.masaHereditaria)}) según el Código Civil español.
        </p>
      </div>

      {Object.entries(resultados.opciones).map(([clave, opcion]: any) => (
        <div key={clave} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-secondary-dark">
              Opción {clave}
            </h4>
            <p className="text-sm text-secondary-dark/70">{opcion.descripcion}</p>
          </div>

          <div className="space-y-3">
            {resultados.tieneConyuge ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Cónyuge</span>
                <span className="font-semibold">{euro(opcion.conyuge)}</span>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Sin cónyuge registrado para este escenario.</p>
            )}
            {opcion.hijos.map((cantidad: number, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>Hijo {index + 1}</span>
                <span className="font-semibold text-primary-700">{euro(cantidad)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderAscendientes = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-900">
        {resultados.mensaje}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Legítima de ascendientes</span>
          <span className="font-semibold">{euro(resultados.legitimaAscendientes)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Libre disposición</span>
          <span className="font-semibold">{euro(resultados.libreDisposicion)}</span>
        </div>
        {resultados.tieneConyuge ? (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">
              Valor del usufructo conyugal ({resultados.porcentajeUsufructo.toFixed(2)}%)
            </span>
            <span className="font-semibold text-primary-700">{euro(resultados.valorUsufructo)}</span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No se aplica usufructo conyugal al no haber cónyuge.</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-secondary-dark">Calculadora de Reparto de Herencia</h1>
        <p className="text-secondary-dark/80 mb-8">
          Simula el reparto del patrimonio bajo las reglas del Código Civil español: legítima estricta, tercio de mejora y libre disposición.
        </p>

        <div className="bg-white/90 rounded-2xl border border-secondary-light shadow-glow-primary p-6 mb-8">
          <h2 className="text-xl font-bold text-secondary-dark mb-4">Datos familiares</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Activo neto</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999999999}
                  value={activoNeto}
                  onChange={(e) => setActivoNeto(sanitizeMoneda(e.target.value))}
                  className="flex-1 px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
                />
                <span className="text-secondary-dark/70">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Edad del cónyuge</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={tieneConyuge ? edadConyuge : ''}
                  onChange={(e) => setEdadConyuge(clampNumber(e.target.value, 18, 99))}
                  disabled={!tieneConyuge}
                  className="flex-1 px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark disabled:bg-secondary-light/50 disabled:cursor-not-allowed"
                  placeholder="—"
                />
                <span className="text-secondary-dark/70">años</span>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-secondary-dark/70 mt-2">
                <input
                  type="checkbox"
                  checked={!tieneConyuge}
                  onChange={(e) => setTieneConyuge(!e.target.checked)}
                  className="rounded border-secondary-light text-primary-600 focus:ring-primary-500"
                />
                No tengo cónyuge
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Número de hijos</label>
              <input
                type="number"
                min={0}
                max={10}
                value={numeroHijos}
                onChange={(e) => setNumeroHijos(sanitizeEntero(e.target.value))}
                className="w-full px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-secondary-dark">
                <input
                  type="checkbox"
                  checked={tieneAscendientes}
                  onChange={(e) => setTieneAscendientes(e.target.checked)}
                  className="rounded border-secondary-light text-primary-600 focus:ring-primary-500"
                  disabled={numeroHijos > 0}
                />
                Hay ascendientes vivos (padres)
              </label>
              <p className="text-xs text-secondary-dark/60 mt-1">
                Solo se aplica cuando no hay descendientes.
              </p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={calcular}
              className="cta-button px-10 py-3 rounded-full text-base font-semibold"
            >
              Calcular reparto
            </button>
          </div>
        </div>

        {resultados && (
          resultados.tipo === 'descendientes' ? renderDescendientes() : renderAscendientes()
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { clampNumber, sanitizeCurrencyInput } from '@/lib/utils/number'

const formatoEUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatoPorcentaje = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

interface Producto {
  id: string
  nombre: string
  precioAnterior: number | null
  precioActual: number | null
}

const productosIniciales: Producto[] = [
  { id: '1', nombre: 'Hipoteca/Mensualidad vivienda', precioAnterior: null, precioActual: null },
  { id: '2', nombre: 'Transporte (gasolina/transporte público)', precioAnterior: null, precioActual: null },
  { id: '3', nombre: 'Luz', precioAnterior: null, precioActual: null },
  { id: '4', nombre: 'Agua', precioAnterior: null, precioActual: null },
  { id: '5', nombre: 'Ropa', precioAnterior: null, precioActual: null },
  { id: '6', nombre: 'Alimentación/Supermercado', precioAnterior: null, precioActual: null },
  { id: '7', nombre: 'Gas/Combustible calefacción', precioAnterior: null, precioActual: null },
  { id: '8', nombre: 'Internet/Teléfono', precioAnterior: null, precioActual: null },
  { id: '9', nombre: 'Seguro (coche/hogar/salud)', precioAnterior: null, precioActual: null },
  { id: '10', nombre: 'Ocio/Entretenimiento', precioAnterior: null, precioActual: null },
]

export default function IPCIPage() {
  const [productos, setProductos] = useState<Producto[]>(productosIniciales)
  const [añoAnterior, setAñoAnterior] = useState(new Date().getFullYear() - 1)
  const [añoActual, setAñoActual] = useState(new Date().getFullYear())
  const [resultados, setResultados] = useState<any>(null)

const clampGasto = (valor: string) => sanitizeCurrencyInput(valor, 20000)
  const clampYear = (valor: string | number, fallback: number) =>
    clampNumber(valor, 2000, 2100) || fallback

  const actualizarProducto = (id: string, campo: 'precioAnterior' | 'precioActual', valor: string) => {
    setProductos(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          [campo]: valor === '' ? null : clampGasto(valor)
        }
      }
      return p
    }))
  }

  const calcularIPCI = () => {
    const productosConDatos = productos.filter(p => 
      p.precioAnterior !== null && p.precioAnterior > 0 && 
      p.precioActual !== null && p.precioActual > 0
    )

    if (productosConDatos.length === 0) {
      alert('Por favor, introduce al menos un producto con precios válidos en ambos años.')
      return
    }

    const resultadosProductos = productosConDatos.map(producto => {
      const precioAnterior = producto.precioAnterior!
      const precioActual = producto.precioActual!
      const variacion = precioActual - precioAnterior
      const ipci = ((precioActual - precioAnterior) / precioAnterior) * 100

      return {
        ...producto,
        variacion,
        ipci
      }
    })

    // Calcular IPCI general (promedio simple de todos los IPCI individuales)
    const sumaIPCI = resultadosProductos.reduce((suma, p) => suma + p.ipci, 0)
    const ipciGeneral = sumaIPCI / resultadosProductos.length

    setResultados({
      productos: resultadosProductos,
      ipciGeneral,
      totalProductos: resultadosProductos.length
    })
  }

  const limpiarDatos = () => {
    setProductos(productosIniciales)
    setResultados(null)
  }

  const getIconoVariacion = (ipci: number) => {
    if (ipci > 0) return <TrendingUp className="w-5 h-5 text-red-500" />
    if (ipci < 0) return <TrendingDown className="w-5 h-5 text-green-500" />
    return <Minus className="w-5 h-5 text-gray-500" />
  }

  const getColorVariacion = (ipci: number) => {
    if (ipci > 0) return 'text-red-600'
    if (ipci < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-secondary-dark">Calculadora de IPCI</h1>
        <p className="text-secondary-dark/80 mb-8">
          Calcula el Índice de Precios al Consumo Individual (IPCI) comparando el precio de productos y servicios 
          entre dos años. El IPCI muestra el porcentaje de variación del precio de cada producto y un índice general.
        </p>

        <div className="bg-white/90 backdrop-blur rounded-2xl border border-secondary-light shadow-glow-primary p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Año Anterior</label>
              <input
                type="number"
                min={2000}
                max={añoActual}
                value={añoAnterior}
                onChange={(e) => {
                  const nuevo = clampYear(e.target.value, añoAnterior)
                  setAñoAnterior(Math.min(nuevo, añoActual - 1))
                }}
                className="w-full px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Año Actual</label>
              <input
                type="number"
                min={añoAnterior + 1}
                max={2100}
                value={añoActual}
                onChange={(e) => {
                  const nuevo = clampYear(e.target.value, añoActual)
                  setAñoActual(Math.max(nuevo, añoAnterior + 1))
                }}
                className="w-full px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-secondary-dark mb-4">Productos y Servicios</h2>
          <p className="text-sm text-secondary-dark/70 mb-6">
            Introduce el precio mensual o anual de cada producto/servicio en ambos años. Puedes usar decimales.
          </p>

          <div className="space-y-4 mb-6">
            {productos.map((producto) => (
              <div key={producto.id} className="bg-secondary-light/30 rounded-lg p-4 border border-secondary-light/50">
                <label className="block text-sm font-medium text-secondary-dark mb-2">{producto.nombre}</label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-secondary-dark/70 mb-1">
                      Precio en {añoAnterior} (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="20000"
                      value={producto.precioAnterior ?? ''}
                      onChange={(e) => actualizarProducto(producto.id, 'precioAnterior', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary-dark/70 mb-1">
                      Precio en {añoActual} (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="20000"
                      value={producto.precioActual ?? ''}
                      onChange={(e) => actualizarProducto(producto.id, 'precioActual', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-secondary-light rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-secondary-dark"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={calcularIPCI}
              className="cta-button px-10 py-3 rounded-full inline-flex items-center justify-center"
            >
              Calcular IPCI
            </button>
            <button
              onClick={limpiarDatos}
              className="px-6 py-3 rounded-full border border-secondary-light text-secondary-dark hover:bg-secondary-light transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        {resultados && (
          <div className="space-y-6">
            {/* IPCI General */}
            <div className="bg-white/90 border border-secondary-light rounded-2xl p-6 shadow-glow-primary">
              <h3 className="text-2xl font-bold text-secondary-dark mb-4">IPCI General</h3>
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold ${getColorVariacion(resultados.ipciGeneral)}`}>
                  {resultados.ipciGeneral > 0 ? '+' : ''}{resultados.ipciGeneral.toFixed(2)}%
                </div>
                <div>
                  {getIconoVariacion(resultados.ipciGeneral)}
                </div>
              </div>
              <p className="text-sm text-secondary-dark/70 mt-2">
                Variación promedio del precio de {resultados.totalProductos} producto{resultados.totalProductos !== 1 ? 's' : ''} 
                {' '}entre {añoAnterior} y {añoActual}
              </p>
            </div>

            {/* Resultados por Producto */}
            <div className="bg-white/90 border border-secondary-light rounded-2xl p-6 shadow-glow-primary">
              <h3 className="text-xl font-bold text-secondary-dark mb-4">IPCI por Producto</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-secondary-dark/70 uppercase tracking-wide text-xs border-b border-secondary-light">
                    <tr>
                      <th className="pb-3 pr-4">Producto</th>
                      <th className="pb-3 pr-4 text-right">Precio {añoAnterior}</th>
                      <th className="pb-3 pr-4 text-right">Precio {añoActual}</th>
                      <th className="pb-3 pr-4 text-right">Variación</th>
                      <th className="pb-3 text-right">IPCI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.productos.map((producto: any) => (
                      <tr key={producto.id} className="border-b border-secondary-light/50">
                        <td className="py-3 font-medium text-secondary-dark">{producto.nombre}</td>
                        <td className="py-3 text-right text-secondary-dark/80">
                          {formatoEUR.format(producto.precioAnterior)}
                        </td>
                        <td className="py-3 text-right text-secondary-dark/80">
                          {formatoEUR.format(producto.precioActual)}
                        </td>
                        <td className={`py-3 text-right font-medium ${getColorVariacion(producto.variacion)}`}>
                          {producto.variacion > 0 ? '+' : ''}{formatoEUR.format(producto.variacion)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-bold ${getColorVariacion(producto.ipci)}`}>
                              {producto.ipci > 0 ? '+' : ''}{producto.ipci.toFixed(2)}%
                            </span>
                            {getIconoVariacion(producto.ipci)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leyenda */}
            <div className="bg-secondary-light/50 border border-secondary-light rounded-2xl p-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="text-secondary-dark/80">Incremento de precio</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-secondary-dark/80">Reducción de precio</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-gray-500" />
                  <span className="text-secondary-dark/80">Sin variación</span>
                </div>
              </div>
            </div>

            {/* Nota Informativa */}
            <div className="bg-secondary-light/70 border border-secondary-light rounded-2xl p-6">
              <h4 className="font-bold text-secondary-dark mb-2">ℹ️ Información sobre el IPCI</h4>
              <p className="text-sm text-secondary-dark/80">
                El IPCI (Índice de Precios al Consumo Individual) mide la variación porcentual de los precios 
                de productos y servicios entre dos períodos. Un IPCI positivo indica inflación (aumento de precios), 
                mientras que un IPCI negativo indica deflación (disminución de precios). El IPCI general se calcula 
                como el promedio simple de los IPCI individuales de todos los productos introducidos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


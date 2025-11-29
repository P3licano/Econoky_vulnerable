'use client'

import { useState } from 'react'
import { clampNumber, sanitizeCurrencyInput } from '@/lib/utils/number'

export default function InversionInmobiliariaPage() {
  const [precioCompra, setPrecioCompra] = useState(100000)
  const [ahorros, setAhorros] = useState(100000)
  const [porcentajeFinanciado, setPorcentajeFinanciado] = useState(70)
  const [tipo, setTipo] = useState(2)
  const [plazo, setPlazo] = useState(10)
  const [tasaGestionInmobiliaria, setTasaGestionInmobiliaria] = useState(2)
  const [tasaGestionPrestamo, setTasaGestionPrestamo] = useState(2)
  const [impuestosCompra, setImpuestosCompra] = useState(0)
  const [tasacion, setTasacion] = useState(1000)
  const [obraMuebles, setObraMuebles] = useState(10000)
  const [comisionAgencia, setComisionAgencia] = useState(0)
  const [comisionFinanciera, setComisionFinanciera] = useState(0)
  const [ibi, setIbi] = useState(500)
  const [comunidad, setComunidad] = useState(100)
  const [seguroHogar, setSeguroHogar] = useState(100)
  const [seguroVida, setSeguroVida] = useState(100)
  const [suministros, setSuministros] = useState(100)
  const [alquilerMensual, setAlquilerMensual] = useState(1000)
  const [imprevistos, setImprevistos] = useState(10)
  const [resultados, setResultados] = useState<any>(null)

  const sanitizeEuro = (value: string | number, max = 999999999) =>
    sanitizeCurrencyInput(value, max)
  const sanitizePercent = (value: string | number, max = 100) =>
    clampNumber(value, 0, max, { decimals: 2 })
  const sanitizeTipo = (value: string | number) => clampNumber(value, 0, 15, { decimals: 2 })
  const sanitizePlazo = (value: string | number) => clampNumber(value, 1, 40)

  const calcular = () => {
    const capitalFinanciado = precioCompra * (porcentajeFinanciado / 100)
    const capitalPropio = precioCompra - capitalFinanciado
    
    // Gastos iniciales
    const gastosGestionInmobiliaria = precioCompra * (tasaGestionInmobiliaria / 100)
    const gastosGestionPrestamo = capitalFinanciado * (tasaGestionPrestamo / 100)
    const gastosImpuestos = precioCompra * (impuestosCompra / 100)
    const gastosIniciales = gastosGestionInmobiliaria + gastosGestionPrestamo + gastosImpuestos + tasacion + obraMuebles + comisionAgencia + comisionFinanciera
    
    // Cuota mensual del préstamo
    const tasaMensual = tipo / 100 / 12
    const numCuotas = plazo * 12
    const cuotaMensual = capitalFinanciado > 0 && numCuotas > 0
      ? capitalFinanciado * (tasaMensual * Math.pow(1 + tasaMensual, numCuotas)) / 
        (Math.pow(1 + tasaMensual, numCuotas) - 1)
      : 0
    
    // Gastos mensuales
    const gastosMensuales = ibi / 12 + comunidad + seguroHogar + seguroVida + suministros + (cuotaMensual * (imprevistos / 100))
    
    // Ingresos y beneficios
    const ingresosAnuales = alquilerMensual * 12
    const gastosAnuales = gastosMensuales * 12
    const beneficioNetoAnual = ingresosAnuales - gastosAnuales
    const inversionTotal = capitalPropio + gastosIniciales
    const rentabilidadAnual = inversionTotal > 0 ? (beneficioNetoAnual / inversionTotal) * 100 : 0

    setResultados({
      inversionTotal: inversionTotal.toFixed(2),
      gastosIniciales: gastosIniciales.toFixed(2),
      cuotaMensual: cuotaMensual.toFixed(2),
      gastosMensuales: gastosMensuales.toFixed(2),
      ingresosAnuales: ingresosAnuales.toFixed(2),
      gastosAnuales: gastosAnuales.toFixed(2),
      beneficioNetoAnual: beneficioNetoAnual.toFixed(2),
      rentabilidadAnual: rentabilidadAnual.toFixed(2),
    })
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Calculadora de Inversión Inmobiliaria</h1>
        <p className="text-gray-600 mb-8">
          Esta calculadora te permite conocer la rentabilidad de alquilar una vivienda teniendo en cuenta todos los ingresos y gastos asociados a la compra.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Datos de compra */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Datos de compra</h2>
            <p className="text-sm text-gray-600 mb-4">Completa los datos asociados a la compra de la vivienda.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de compra</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                  max={999999999}
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(sanitizeEuro(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ahorros</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                  max={999999999}
                    value={ahorros}
                    onChange={(e) => setAhorros(sanitizeEuro(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Financiado</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={porcentajeFinanciado}
                    onChange={(e) => setPorcentajeFinanciado(sanitizePercent(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={15}
                    value={tipo}
                    onChange={(e) => setTipo(sanitizeTipo(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plazo</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={plazo}
                    onChange={(e) => setPlazo(sanitizePlazo(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">años</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa gestión inmobiliaria</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={15}
                    value={tasaGestionInmobiliaria}
                    onChange={(e) => setTasaGestionInmobiliaria(sanitizePercent(e.target.value, 20))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa gestión préstamo</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    value={tasaGestionPrestamo}
                    onChange={(e) => setTasaGestionPrestamo(sanitizePercent(e.target.value, 15))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impuestos compra</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={20}
                    value={impuestosCompra}
                    onChange={(e) => setImpuestosCompra(sanitizePercent(e.target.value, 20))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasación</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={20000}
                    value={tasacion}
                    onChange={(e) => setTasacion(sanitizeEuro(e.target.value, 20000))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Obra y muebles</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={200000}
                    value={obraMuebles}
                    onChange={(e) => setObraMuebles(sanitizeEuro(e.target.value, 200000))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comisión agencia</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={15}
                    value={comisionAgencia}
                    onChange={(e) => setComisionAgencia(sanitizePercent(e.target.value, 15))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comisión financiera</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={15}
                    value={comisionFinanciera}
                    onChange={(e) => setComisionFinanciera(sanitizePercent(e.target.value, 15))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-xs text-gray-600">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gastos mensuales */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gastos mensuales</h2>
            <p className="text-sm text-gray-600 mb-4">Completa los gastos mensuales asociados a la vivienda.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IBI</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={ibi}
                    onChange={(e) => setIbi(sanitizeEuro(e.target.value, 10000))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comunidad</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={2000}
                    value={comunidad}
                    onChange={(e) => setComunidad(sanitizeEuro(e.target.value, 2000))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seguro de hogar</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={2000}
                    value={seguroHogar}
                    onChange={(e) => setSeguroHogar(sanitizeEuro(e.target.value, 2000))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seguro de vida</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={2000}
                    value={seguroVida}
                    onChange={(e) => setSeguroVida(sanitizeEuro(e.target.value, 2000))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suministros</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={2000}
                    value={suministros}
                    onChange={(e) => setSuministros(sanitizeEuro(e.target.value, 2000))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posible alquiler mensual</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={alquilerMensual}
                    onChange={(e) => setAlquilerMensual(sanitizeEuro(e.target.value, 10000))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imprevistos</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={30}
                    value={imprevistos}
                    onChange={(e) => setImprevistos(sanitizePercent(e.target.value, 30))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  />
                  <span className="text-gray-600">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <button
            onClick={calcular}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Calcular PRO
          </button>
        </div>

        {resultados && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resultados</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Inversión total</p>
                <p className="text-2xl font-bold text-primary-600">{resultados.inversionTotal} €</p>
              </div>
              <div>
                <p className="text-gray-600">Rentabilidad anual</p>
                <p className="text-2xl font-bold text-green-600">{resultados.rentabilidadAnual} %</p>
              </div>
              <div>
                <p className="text-gray-600">Beneficio neto anual</p>
                <p className="text-xl font-bold text-primary-600">{resultados.beneficioNetoAnual} €</p>
              </div>
              <div>
                <p className="text-gray-600">Ingresos anuales</p>
                <p className="text-xl font-bold text-primary-600">{resultados.ingresosAnuales} €</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export function VulnerableCheckoutButton({ planName, price }: { planName: string; price: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // VULNERABLE: El precio se envía desde el cliente sin validación
      const response = await fetch('/api/vulnerable-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          price, // ⚠️ VULNERABILIDAD: Se confía en el precio del cliente
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirigir al dashboard con mensaje de éxito
        window. location.href = '/dashboard? upgraded=true'
      } else {
        // Mostrar error si hay saldo insuficiente u otro problema
        setError(data.message || data.error || 'Error al procesar el pago')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error de conexión al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="block w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors text-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ?  'Procesando...' : 'Obtener Pro'}
      </button>
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}

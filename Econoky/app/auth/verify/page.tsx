'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verificando tu cuenta...')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no encontrado.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'No se pudo verificar la cuenta')
        }

        setStatus('success')
        setMessage('¡Tu cuenta ha sido verificada correctamente! Ya puedes iniciar sesión.')
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'No se pudo verificar la cuenta.')
      }
    }

    verify()
  }, [searchParams])

  return (
    <div className="max-w-md w-full space-y-6 bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-center text-gray-900">Verificación de cuenta</h1>
      <p
        className={`text-center text-sm ${
          status === 'success'
            ? 'text-green-700'
            : status === 'error'
            ? 'text-red-700'
            : 'text-gray-700'
        }`}
      >
        {message}
      </p>
      {status !== 'loading' && (
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-2 rounded-full cta-button text-sm"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      )}
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-md w-full space-y-6 bg-white rounded-2xl shadow-md p-8 text-center text-gray-700">
            Verificando tu cuenta...
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { VulnerableCheckoutButton } from '@/components/VulnerableCheckoutButton'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'

export default async function PlansPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)

  const plans = [
    {
      name: 'Gratis',
      price: 0,
      period: 'Siempre',
      features: [
        'Acceso a calculadoras financieras',
        'Participación en la comunidad',
        'Herramientas básicas',
      ],
      current: profile?. subscription_status === 'free',
    },
    {
      name: 'Pro',
      price: 4.99,
      period: 'mes',
      features: [
        'Todo lo del plan Gratis',
        'Diagnóstico personalizado',
        'Análisis detallado de finanzas',
        'Seguimiento avanzado',
        'Soporte prioritario',
      ],
      current: profile?.subscription_status === 'pro',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center text-white">Planes y Precios</h1>
      <p className="text-gray-600 mb-12 text-center">
        Elige el plan que mejor se adapte a tus necesidades
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white p-8 rounded-lg shadow-md ${
              plan.name === 'Pro' ? 'border-2 border-primary-500' : ''
            }`}
          >
            {plan.name === 'Pro' && (
              <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                Recomendado
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-black">{plan.name}</h2>
            <div className="mb-6">
              <span className="text-4xl font-bold text-black">€{plan.price}</span>
              {plan.period !== 'Siempre' && (
                <span className="text-gray-600">/{plan.period}</span>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features. map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            {plan.current ?  (
              <div className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-center font-semibold">
                Plan actual
              </div>
            ) : plan.name === 'Pro' ?  (
              <VulnerableCheckoutButton planName={plan.name} price={plan.price} />
            ) : (
              <Link
                href="/auth/register"
                className="block w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors text-center font-semibold"
              >
                Empezar
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

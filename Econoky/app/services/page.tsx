import Link from 'next/link'
import { Calculator, Users, TrendingUp } from 'lucide-react'

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">Nuestros Servicios</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Calculator className="w-12 h-12 text-primary-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-black">Calculadoras Financieras</h2>
          <p className="text-gray-700 mb-6">
            Toma decisiones informadas con nuestras calculadoras financieras gratuitas. 
            Desde el cálculo de préstamos hasta la planificación de ahorros, te ayudamos 
            a manejar tus finanzas con confianza.
          </p>
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Usar calculadoras →
          </Link>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Users className="w-12 h-12 text-primary-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-black">Conecta y aprende</h2>
          <p className="text-gray-700 mb-6">
            Únete a nuestra red social y comparte tus éxitos y desafíos en un espacio 
            seguro y estimulante. Aprende de la comunidad y encuentra apoyo en tu 
            camino hacia la salud financiera.
          </p>
          <Link
            href="/community"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Ver comunidad →
          </Link>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md border-2 border-primary-500">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-12 h-12 text-primary-600" />
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Pro
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-black">Diagnóstico Personalizado</h2>
          <p className="text-gray-700 mb-6">
            Descubre cómo están tus finanzas con nuestra herramienta de análisis por suscripción. 
            Por solo 4.99 euros al mes, recibirás un diagnóstico detallado e información real 
            para mejorar tus finanzas.
          </p>
          <Link
            href="/plans"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Ver planes →
          </Link>
        </div>
      </div>
    </div>
  )
}

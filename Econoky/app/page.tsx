import Link from 'next/link'
import { Calculator, Users, TrendingUp, Shield, Sparkles, Heart } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-accent-aqua via-accent-sky to-accent-indigo text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Ejercita tu músculo financiero en Econoky
          </h1>
          <p className="text-xl mb-8 text-white/80">
            La nueva plataforma online para gestionar tu dinero de manera sencilla y efectiva.
          </p>
          <Link
            href="/auth/register"
            className="inline-block cta-button px-8 py-3 rounded-full"
          >
            ¡Empieza hoy mismo!
          </Link>
        </div>
      </section>

      {/* ¿Qué es Econoky? */}
      <section className="py-16 px-4 bg-secondary-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-secondary-dark">¿Qué es Econoky?</h2>
          <p className="text-lg text-secondary-dark/80 text-center max-w-3xl mx-auto mb-8">
            Econoky es una plataforma global que transforma la forma en que interactúas con tu dinero. 
            Ofrecemos herramientas gratuitas, una red social para compartir experiencias relacionadas 
            con las finanzas y un diagnóstico personalizado de tu salud financiera.
          </p>
          <div className="text-center">
            <Link
              href="/services"
              className="inline-block cta-button px-8 py-3 rounded-full"
            >
              Ver servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Nuestros servicios */}
      <section className="py-16 px-4 bg-secondary-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-secondary-dark">Nuestros servicios</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-glow-primary border border-white/40">
              <Calculator className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-secondary-dark">Calculadoras Financieras</h3>
              <p className="text-secondary-dark/80">
                Toma decisiones informadas con nuestras calculadoras financieras gratuitas. 
                Desde el cálculo de préstamos hasta la planificación de ahorros, te ayudamos 
                a manejar tus finanzas con confianza.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-glow-primary border border-white/40">
              <Users className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-secondary-dark">Conecta y aprende</h3>
              <p className="text-secondary-dark/80">
                Únete a nuestra red social y comparte tus éxitos y desafíos en un espacio 
                seguro y estimulante. Aprende de la comunidad y encuentra apoyo en tu 
                camino hacia la salud financiera.
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-glow-violet border-2 border-primary-500">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-12 h-12 text-primary-600" />
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-glow-primary">
                  Pro
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-secondary-dark">Diagnóstico Personalizado</h3>
              <p className="text-secondary-dark/80 mb-4">
                Descubre cómo están tus finanzas con nuestra herramienta de análisis por suscripción. 
                Por solo 4.99 euros al mes, recibirás un diagnóstico detallado e información real 
                para mejorar tus finanzas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Por qué Econoky? */}
      <section className="py-16 px-4 bg-secondary-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-secondary-dark">¿Por qué Econoky?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-secondary-dark">Accesibilidad</h3>
              <p className="text-secondary-dark/80">
                Herramientas financieras gratuitas y una red social inclusiva.
              </p>
            </div>
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-secondary-dark">Personalización</h3>
              <p className="text-secondary-dark/80">
                Diagnósticos y seguimiento personalizados.
              </p>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-secondary-dark">Comunidad</h3>
              <p className="text-secondary-dark/80">
                Un entorno de apoyo y aprendizaje continuo.
              </p>
            </div>
            <div className="text-center">
              <Heart className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-secondary-dark">Innovación</h3>
              <p className="text-secondary-dark/80">
                Soluciones creativas y disruptivas para tus finanzas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 px-4 bg-secondary-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-secondary-dark">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-accent-aqua via-accent-sky to-accent-indigo text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-glow-primary">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-secondary-dark">Regístrate Gratis</h3>
              <p className="text-secondary-dark/80">
                Crea tu cuenta en pocos pasos.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-accent-aqua via-accent-sky to-accent-indigo text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-glow-primary">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-secondary-dark">Usa las herramientas</h3>
              <p className="text-secondary-dark/80">
                Prueba nuestras calculadoras financieras y conéctate con otros usuarios.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-accent-aqua via-accent-sky to-accent-indigo text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-glow-primary">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-secondary-dark">Mejora tus finanzas</h3>
              <p className="text-secondary-dark/80">
                Obtén un diagnóstico personalizado y mejora tu salud financiera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-br from-accent-aqua via-accent-sky to-accent-indigo text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Transformando tu Salud Financiera</h2>
          <p className="text-xl mb-8 text-white/80">
            Regístrate ahora y da el primer paso hacia una mejor salud financiera. 
            Con Econoky, tienes todas las herramientas para gestionar tu dinero de manera 
            efectiva y sin complicaciones.
          </p>
          <Link
            href="/auth/register"
            className="inline-block cta-button px-8 py-3 rounded-full"
          >
            ¡Empieza hoy mismo!
          </Link>
        </div>
      </section>
    </div>
  )
}

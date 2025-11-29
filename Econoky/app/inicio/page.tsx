import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'
import { getPosts } from '@/lib/db/posts'
import { PostList } from '@/components/PostList'
import { CreatePost } from '@/components/CreatePost'
import { User, Globe, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'

export default async function InicioPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  
  // Calcular porcentaje de perfil completado
  let profileComplete = 0
  let detailsComplete = 0
  let photoComplete = 0
  
  if (profile) {
    if (profile.full_name) detailsComplete++
    if (profile.bio) detailsComplete++
    if (profile.avatar_url) photoComplete++
    detailsComplete = Math.min(detailsComplete, 3) // Máximo 3 detalles
    profileComplete = Math.round(((detailsComplete / 3) + (photoComplete / 1)) / 2 * 100)
  }

  // Grupos de ejemplo (en el futuro esto vendría de la BD)
  const grupos = [
    {
      id: '1',
      name: 'Finanzas Personales Inteligentes para una Vida de Libertad - Julio 2024',
      icon: User,
      active: 'hace una semana',
      type: 'active'
    },
    {
      id: '2',
      name: 'Finanzas Internacionales',
      icon: Globe,
      active: 'hace una semana',
      type: 'active'
    }
  ]

  // Discusiones recientes (en el futuro esto vendría de la BD)
  const discusiones = [
    { id: '1', title: 'Crear SL patrimonial', time: 'hace 9 meses, 3 semanas' },
    { id: '2', title: 'Revolut', time: 'hace 9 meses, 3 semanas' },
    { id: '3', title: 'Dashboard', time: 'hace 10 meses, 2 semanas' },
    { id: '4', title: 'Inversión inmobiliaria', time: 'hace 11 meses, 1 semana' },
    { id: '5', title: 'Devolución de gastos hipotecarios.', time: 'hace 11 meses, 2 semanas' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Izquierdo */}
          <div className="lg:col-span-3 space-y-6">
            {/* Completa Tu Perfil */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Completa Tu Perfil</h2>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{profileComplete}% Completo</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${profileComplete}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {detailsComplete >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={detailsComplete >= 3 ? 'text-gray-600' : 'text-gray-400'}>
                    Detalles {detailsComplete}/3
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {photoComplete >= 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={photoComplete >= 1 ? 'text-gray-600' : 'text-gray-400'}>
                    Foto de Perfil {photoComplete}/1
                  </span>
                </div>
              </div>
              <Link
                href="/profile"
                className="mt-4 block text-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                Completar Perfil
              </Link>
            </div>

            {/* Grupos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex gap-2 mb-4 border-b">
                <button className="px-3 py-1 text-sm font-semibold text-primary-600 border-b-2 border-primary-600">
                  ACTIVO
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                  EL MÁS NUEVO
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                  POPULAR
                </button>
              </div>
              <div className="space-y-4">
                {grupos.map((grupo) => {
                  const Icon = grupo.icon
                  return (
                    <div key={grupo.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {grupo.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          activo {grupo.active}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Contenido Central */}
          <div className="lg:col-span-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Inicio</h1>
            <CreatePost />
            <PostList />
          </div>

          {/* Sidebar Derecho */}
          <div className="lg:col-span-3 space-y-6">
            {/* Últimas actualizaciones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Últimas actualizaciones</h2>
              <p className="text-sm text-gray-500 text-center py-4">
                Lo sentimos, no hemos encontrado actividad.
              </p>
            </div>

            {/* Discusiones recientes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Discusiones recientes</h2>
              <div className="space-y-3">
                {discusiones.map((discusion) => (
                  <div key={discusion.id} className="pb-3 border-b last:border-0">
                    <Link 
                      href={`/community#${discusion.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors block"
                    >
                      {discusion.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">{discusion.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


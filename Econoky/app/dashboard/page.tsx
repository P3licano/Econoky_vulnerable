import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wallet, TrendingUp, Users, FileText, Shield, CheckCircle } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'
import { getPostsByUserId } from '@/lib/db/posts'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Obtener perfil del usuario desde MongoDB
  const profile = await getProfile(user.id)

  // Obtener publicaciones del usuario desde MongoDB
  const posts = await getPostsByUserId(user.id, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        {profile?.role === 'admin' && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-600 text-white flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Admin
          </span>
        )}
        {profile?.is_verified && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Verified
          </span>
        )}
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Saldo Actual</p>
              <p className="text-2xl font-bold text-primary-600">
                €{profile?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Suscripción</p>
              <p className="text-2xl font-bold text-primary-600 capitalize">
                {profile?.subscription_status || 'Free'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Publicaciones</p>
              <p className="text-2xl font-bold text-primary-600">
                {posts?.length || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Comunidad</p>
              <p className="text-2xl font-bold text-primary-600">
                <Link href="/community" className="hover:underline">
                  Ver
                </Link>
              </p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black">Acciones rápidas</h2>
          <div className="space-y-3">
            <Link
              href="/community"
              className="block w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
            >
              Ver comunidad
            </Link>
            <Link
              href="/plans"
              className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Actualizar suscripción
            </Link>
            <Link
              href="/profile"
              className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Editar perfil
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black">Tus últimas publicaciones</h2>
          {posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post: any) => (
                <div key={post.id} className="border-b pb-4 last:border-0">
                  <p className="text-gray-800 font-semibold mb-2">{post.title}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(post.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              ))}
              <Link
                href="/community"
                className="text-primary-600 hover:underline text-sm"
              >
                Ver todas las publicaciones →
              </Link>
            </div>
          ) : (
            <p className="text-gray-600">Aún no has publicado nada.</p>
          )}
        </div>
      </div>
    </div>
  )
}

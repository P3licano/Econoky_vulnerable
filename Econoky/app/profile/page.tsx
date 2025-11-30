import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/ProfileForm'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'
import { Shield, CheckCircle } from 'lucide-react'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (! user) {
    redirect('/auth/login')
  }

  // Obtener perfil del usuario desde MongoDB
  const profile = await getProfile(user.id)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
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
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4 text-black">Información de la cuenta</h2>
        <div className="space-y-2">
          <p className="text-black"><span className="font-semibold text-black">Email:</span> {user.email}</p>
          
          {/* Nombre completo - VULNERABLE A XSS */}
          {profile?.full_name && (
            <p className="text-black">
              <span className="font-semibold text-black">Nombre:</span>{' '}
              <span dangerouslySetInnerHTML={{ __html: profile.full_name }} />
            </p>
          )}
          
          {/* Biografía - VULNERABLE A XSS */}
          {profile?.bio && (
            <div className="text-black">
              <span className="font-semibold text-black">Bio:</span>
              <div 
                className="mt-1 p-2 bg-gray-50 rounded"
                dangerouslySetInnerHTML={{ __html: profile. bio }} 
              />
            </div>
          )}
          
          <p className="text-black"><span className="font-semibold text-black">Saldo:</span> €{profile?.balance?. toFixed(2) || '0. 00'}</p>
          <p className="text-black"><span className="font-semibold text-black">Suscripción:</span> {profile?.subscription_status || 'Free'}</p>
          <p className="text-black">
            <span className="font-semibold text-black">Rol:</span>{' '}
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              profile?.role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {profile?.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </p>
          <p className="text-black">
            <span className="font-semibold text-black">Estado:</span>{' '}
            {profile?.is_verified ? (
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                ✓ Verificado
              </span>
            ) : (
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                No verificado
              </span>
            )}
          </p>
        </div>
      </div>

      <ProfileForm profile={profile} />
    </div>
  )
}
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'
import { AdminPanel } from '@/components/AdminPanel'

/**
 * VULNERABILITY: Information Leakage via HTML Comments
 * 
 * This page intentionally includes HTML comments in the rendered output
 * that reveal sensitive information about hidden endpoints.
 * 
 * EDUCATIONAL PURPOSE: This is for pentesting lab training only.
 * The attacker should inspect the page source to find hints about /admin/upload
 */
export default async function AdminPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <>
      {/* VULNERABILITY: Information Leakage - HTML Comments visible in page source */}
      <div dangerouslySetInnerHTML={{ __html: `
        <!-- TODO: Revisar el sistema de autenticación antes del próximo sprint -->
        <!-- NOTA: Recordar actualizar las dependencias de seguridad -->
        <!-- FIXME: Optimizar queries de la base de datos para mejorar rendimiento -->
        <!-- DEBUG: El endpoint /admin/upload necesita restricciones adicionales de seguridad -->
        <!-- WARNING: Revisar permisos de usuarios en el panel -->
        <!-- HACK: Solución temporal para el bug de sesiones -->
      ` }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">Panel de Administración</h1>
        <AdminPanel />
      </div>
    </>
  )
}


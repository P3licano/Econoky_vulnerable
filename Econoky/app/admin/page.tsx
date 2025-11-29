import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'
import { AdminPanel } from '@/components/AdminPanel'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">Panel de Administración</h1>
      <AdminPanel />
    </div>
  )
}


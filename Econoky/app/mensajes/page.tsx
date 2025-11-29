import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { MessagesPanel } from '@/components/MessagesPanel'

export default async function MensajesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">Mensajes Privados</h1>
      <MessagesPanel />
    </div>
  )
}


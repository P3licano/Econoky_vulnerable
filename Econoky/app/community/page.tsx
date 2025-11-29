import { redirect } from 'next/navigation'
import { PostList } from '@/components/PostList'
import { CreatePost } from '@/components/CreatePost'
import { getCurrentUser } from '@/lib/auth'

export default async function CommunityPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-white">Comunidad Econoky</h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Comparte tus experiencias, aprende de otros y conecta con la comunidad.
      </p>
      
      <CreatePost />
      <PostList />
    </div>
  )
}

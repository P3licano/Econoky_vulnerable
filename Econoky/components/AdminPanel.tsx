'use client'

import { useState, useEffect } from 'react'
import { Trash2, Users, MessageSquare } from 'lucide-react'

interface User {
  id: string
  email: string | null
  full_name: string | null
  role?: 'user' | 'admin'
  created_at: Date
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
      } else {
        setError(data.error || 'Error al cargar usuarios')
      }
    } catch (error: any) {
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      alert('Error al eliminar usuario')
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600 text-sm sm:text-base">Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary-600 text-white p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-xl font-bold">Gestión de Usuarios</h2>
          </div>
          <p className="text-primary-100 text-sm mt-2">
            Total de usuarios: {users.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Rol</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Fecha registro</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{user.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.full_name || 'Sin nombre'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


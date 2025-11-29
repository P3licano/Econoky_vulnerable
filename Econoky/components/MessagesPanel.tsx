'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, User, CheckCheck } from 'lucide-react'

interface Conversation {
  user_id: string
  last_message: string
  last_message_date: string
  unread_count: number
  profile?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url?: string | null
  }
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url?: string | null
  }
}

interface ProfileSummary {
  id: string
  full_name: string | null
  email: string | null
  avatar_url?: string | null
}

export function MessagesPanel() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ProfileSummary[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<ProfileSummary | null>(null)

  useEffect(() => {
    loadConversations()
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([])
      setSearchError(null)
      setSearchLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)
        setSearchError(null)

        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('No se pudieron buscar usuarios')
        }

        const data = await response.json()
        setSearchResults(data.users || [])
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error buscando usuarios:', error)
          setSearchError(error.message || 'No se pudieron buscar usuarios')
        }
      } finally {
        setSearchLoading(false)
      }
    }, 400)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchTerm])

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser)
      markAsRead(selectedUser)
    }
  }, [selectedUser])

  useEffect(() => {
    if (!selectedUser) {
      setSelectedProfile(null)
      return
    }

    const conv = conversations.find(c => c.user_id === selectedUser)
    if (conv?.profile) {
      setSelectedProfile(conv.profile)
    }
  }, [selectedUser, conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) {
        setCurrentUserId(data.user.id)
      }
    } catch {
      // Ignore
    }
  }

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/messages?conversations=true')
      const data = await response.json()

      if (response.ok) {
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const markAsRead = async (userId: string) => {
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId: userId }),
      })
      loadConversations()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleConversationSelect = (
    userId: string,
    profile?: ProfileSummary | null,
    clearSearch = false
  ) => {
    setSelectedUser(userId)
    setSelectedProfile(profile || null)
    if (clearSearch) {
      setSearchTerm('')
      setSearchResults([])
    }
  }

  const activeConversation = conversations.find(conv => conv.user_id === selectedUser)
  const activeProfile = selectedProfile || activeConversation?.profile

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedUser) return

    try {
      setSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: selectedUser,
          content: messageText.trim(),
        }),
      })

      if (response.ok) {
        setMessageText('')
        loadMessages(selectedUser)
        loadConversations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600 text-sm sm:text-base">Cargando conversaciones...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[calc(100vh-200px)] sm:h-[600px]">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Lista de conversaciones */}
        <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-200 flex flex-col">
          <div className="bg-primary-600 text-white p-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversaciones
            </h2>
            <p className="text-xs text-primary-100 mt-1">
              Busca por nombre o correo para iniciar un mensaje privado.
            </p>
          </div>
          <div className="px-4 py-3 border-b border-gray-100 bg-white">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchTerm.trim().length >= 2 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {searchLoading && (
                  <p className="text-xs text-primary-500">Buscando usuarios...</p>
                )}
                {searchError && (
                  <p className="text-xs text-red-500">{searchError}</p>
                )}
                {!searchLoading && !searchError && searchResults.length === 0 && (
                  <p className="text-xs text-gray-500">No se encontraron usuarios.</p>
                )}
                {!searchLoading &&
                  !searchError &&
                  searchResults.map(user => (
                    <button
                      key={`search-${user.id}`}
                      type="button"
                      onClick={() => handleConversationSelect(user.id, user, true)}
                      className={`w-full rounded-2xl px-3 py-2 text-left transition-colors flex items-center gap-3 ${
                        selectedUser === user.id ? 'bg-primary-50' : 'bg-gray-50'
                      }`}
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || 'Usuario'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {user.full_name || user.email || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email || 'Sin correo'}</p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No hay conversaciones aún
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user_id}
                  onClick={() => handleConversationSelect(conv.user_id, conv.profile || null)}
                  className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selectedUser === conv.user_id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {conv.profile?.avatar_url ? (
                      <img
                        src={conv.profile.avatar_url}
                        alt={conv.profile.full_name || 'Usuario'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {conv.profile?.full_name || conv.profile?.email || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <p className="font-semibold text-gray-900">
                  {activeProfile?.full_name || activeProfile?.email || 'Usuario'}
                </p>
                {activeProfile?.email && (
                  <p className="text-xs text-gray-500">{activeProfile.email}</p>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === currentUserId
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] sm:max-w-[60%] rounded-lg p-3 ${
                          isOwn
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="mt-1 flex items-center gap-1 justify-end">
                          <p className={`text-xs ${
                            isOwn ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {isOwn && (
                            <CheckCheck
                              className={`w-3.5 h-3.5 ${
                                message.read ? 'text-sky-200' : 'text-primary-200/60'
                              }`}
                              aria-label={message.read ? 'Mensaje visto' : 'Enviado'}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black text-sm sm:text-base"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="bg-primary-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm sm:text-base">Selecciona una conversación para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


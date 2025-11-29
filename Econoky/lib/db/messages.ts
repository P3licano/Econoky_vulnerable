import Message from '@/lib/models/Message'
import Profile from '@/lib/models/Profile'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

export interface MessageWithProfile {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: Date
  sender?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url?: string | null
  }
  receiver?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url?: string | null
  }
}

export async function getMessages(userId: string, otherUserId?: string): Promise<MessageWithProfile[]> {
  await connectDB()
  
  let query: any = {
    $or: [
      { sender_id: userId },
      { receiver_id: userId }
    ]
  }
  
  if (otherUserId) {
    query = {
      $or: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId }
      ]
    }
  }
  
  const messages = await Message.find(query)
    .sort({ created_at: 1 })
    .lean()
  
  const userIds = [...new Set([
    ...messages.map((m: any) => m.sender_id),
    ...messages.map((m: any) => m.receiver_id)
  ])]
  
  const objectIds = userIds
    .filter(id => mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id))
  
  const profiles = objectIds.length > 0
    ? await Profile.find({ _id: { $in: objectIds } }).select('full_name email avatar_url').lean()
    : []
  
  const profileMap = new Map(
    profiles.map((p: any) => [p._id.toString(), p])
  )
  
  return messages.map((message: any) => {
    const sender = profileMap.get(message.sender_id)
    const receiver = profileMap.get(message.receiver_id)
    
    return {
      id: message._id.toString(),
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      content: message.content,
      read: message.read,
      created_at: message.created_at,
      sender: sender ? {
        id: sender._id.toString(),
        full_name: sender.full_name || null,
        email: sender.email || null,
        avatar_url: sender.avatar_url || null,
      } : undefined,
      receiver: receiver ? {
        id: receiver._id.toString(),
        full_name: receiver.full_name || null,
        email: receiver.email || null,
        avatar_url: receiver.avatar_url || null,
      } : undefined,
    }
  })
}

export async function getConversations(userId: string): Promise<any[]> {
  await connectDB()
  
  const messages = await Message.find({
    $or: [
      { sender_id: userId },
      { receiver_id: userId }
    ]
  })
    .sort({ created_at: -1 })
    .lean()
  
  const conversationMap = new Map<string, any>()
  
  messages.forEach((message: any) => {
    const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        user_id: otherUserId,
        last_message: message.content,
        last_message_date: message.created_at,
        unread_count: 0,
      })
    }
    if (message.receiver_id === userId && !message.read) {
      const conv = conversationMap.get(otherUserId)
      conv.unread_count++
    }
  })
  
  const userIds = Array.from(conversationMap.keys())
  const objectIds = userIds
    .filter(id => mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id))
  
  const profiles = objectIds.length > 0
    ? await Profile.find({ _id: { $in: objectIds } }).select('full_name email avatar_url').lean()
    : []
  
  const profileMap = new Map(
    profiles.map((p: any) => [p._id.toString(), p])
  )
  
  return Array.from(conversationMap.values()).map(conv => {
    const profile = profileMap.get(conv.user_id)
    return {
      ...conv,
      profile: profile ? {
        id: profile._id.toString(),
        full_name: profile.full_name || null,
        email: profile.email || null,
        avatar_url: profile.avatar_url || null,
      } : undefined,
    }
  })
}

export async function createMessage(data: {
  sender_id: string
  receiver_id: string
  content: string
}): Promise<string> {
  await connectDB()
  const message = await Message.create({
    sender_id: data.sender_id,
    receiver_id: data.receiver_id,
    content: data.content,
  })
  
  return message._id.toString()
}

export async function markMessagesAsRead(userId: string, otherUserId: string): Promise<void> {
  await connectDB()
  await Message.updateMany(
    { sender_id: otherUserId, receiver_id: userId, read: false },
    { $set: { read: true } }
  )
}


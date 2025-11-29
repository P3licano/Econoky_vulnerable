import mongoose, { Schema, Model } from 'mongoose'
import connectDB from '@/lib/mongodb'

connectDB()

export interface IMessage {
  _id?: mongoose.Types.ObjectId
  sender_id: string // ID del usuario que envía
  receiver_id: string // ID del usuario que recibe
  content: string
  read: boolean // Si el mensaje ha sido leído
  created_at: Date
  updated_at: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    sender_id: {
      type: String,
      required: true,
      index: true,
    },
    receiver_id: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

// Índices para optimizar consultas
MessageSchema.index({ sender_id: 1, created_at: -1 })
MessageSchema.index({ receiver_id: 1, created_at: -1 })
MessageSchema.index({ sender_id: 1, receiver_id: 1 })

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)

export default Message


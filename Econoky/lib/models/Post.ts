import mongoose, { Schema, Model } from 'mongoose'
import connectDB from '@/lib/mongodb'

// Conectar a la base de datos
connectDB()

export interface IPost {
  _id?: mongoose.Types.ObjectId
  user_id: string // ObjectId del perfil como string (no relacional, solo referencia)
  title: string
  content: string
  image_url?: string // URL de la imagen del post
  likes?: number // Contador de likes (no relacional)
  created_at: Date
  updated_at: Date
}

const PostSchema = new Schema<IPost>(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
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
PostSchema.index({ created_at: -1 })
PostSchema.index({ user_id: 1, created_at: -1 })

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)

export default Post


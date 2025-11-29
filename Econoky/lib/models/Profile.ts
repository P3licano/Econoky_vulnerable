import mongoose, { Schema, Model } from 'mongoose'
import connectDB from '@/lib/mongodb'

// Conectar a la base de datos
connectDB()

export interface IProfile {
  _id?: mongoose.Types.ObjectId
  email: string // Email único para autenticación
  password: string // Hash de la contraseña
  full_name?: string
  avatar_url?: string // URL del avatar (no relacional)
  bio?: string // Biografía del usuario
  balance: number
  subscription_status: 'free' | 'pro'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  role?: 'user' | 'admin' // Rol del usuario
  is_verified?: boolean
  verification_token?: string | null
  // Estadísticas embebidas (no relacional)
  stats?: {
    posts_count: number
    followers_count: number
    following_count: number
  }
  created_at: Date
  updated_at: Date
}

const ProfileSchema = new Schema<IProfile>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // No devolver password por defecto
    },
    full_name: {
      type: String,
    },
    avatar_url: {
      type: String,
    },
    bio: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0.0,
    },
    subscription_status: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
      index: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verification_token: {
      type: String,
      index: true,
    },
    stripe_customer_id: {
      type: String,
    },
    stripe_subscription_id: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    stats: {
      posts_count: {
        type: Number,
        default: 0,
      },
      followers_count: {
        type: Number,
        default: 0,
      },
      following_count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema)

export default Profile


import mongoose, { Schema, Model } from 'mongoose'
import connectDB from '@/lib/mongodb'

connectDB()

export interface IPostLike {
  _id?: mongoose.Types.ObjectId
  post_id: string
  user_id: string
  created_at: Date
}

const PostLikeSchema = new Schema<IPostLike>(
  {
    post_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  }
)

// Índice único para evitar likes duplicados
PostLikeSchema.index({ post_id: 1, user_id: 1 }, { unique: true })

const PostLike: Model<IPostLike> =
  mongoose.models.PostLike || mongoose.model<IPostLike>('PostLike', PostLikeSchema)

export default PostLike


import mongoose, { Schema, Model } from 'mongoose'
import connectDB from '@/lib/mongodb'

connectDB()

export interface IComment {
  _id?: mongoose.Types.ObjectId
  post_id: string
  user_id: string
  content: string
  created_at: Date
  updated_at: Date
}

const CommentSchema = new Schema<IComment>(
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
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

CommentSchema.index({ post_id: 1, created_at: -1 })
CommentSchema.index({ user_id: 1, created_at: -1 })

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)

export default Comment


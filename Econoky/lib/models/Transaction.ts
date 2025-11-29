import mongoose, { Schema, Model } from 'mongoose'
import connectDB from '@/lib/mongodb'

// Conectar a la base de datos
connectDB()

export interface ITransaction {
  _id?: mongoose.Types.ObjectId
  user_id: string // ObjectId del perfil como string (no relacional, solo referencia)
  amount: number
  type: 'income' | 'expense' | 'subscription' | 'refund'
  description?: string
  created_at: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'subscription', 'refund'],
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false, // Las transacciones no se actualizan
    },
  }
)

// Índices para optimizar consultas
TransactionSchema.index({ created_at: -1 })
TransactionSchema.index({ user_id: 1, created_at: -1 })
TransactionSchema.index({ user_id: 1, type: 1 })

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema)

export default Transaction


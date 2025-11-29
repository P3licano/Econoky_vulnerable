import mongoose, { Schema, Model } from 'mongoose'
import connectDB from '@/lib/mongodb'

connectDB()

export interface IFinancialDashboard {
  _id?: mongoose.Types.ObjectId
  user_id: string // ID del usuario
  ingresos: number
  gastos: number
  ahorro: number
  inversion: number
  deuda: number
  patrimonio: number
  created_at: Date
  updated_at: Date
}

const FinancialDashboardSchema = new Schema<IFinancialDashboard>(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ingresos: {
      type: Number,
      default: 0,
    },
    gastos: {
      type: Number,
      default: 0,
    },
    ahorro: {
      type: Number,
      default: 0,
    },
    inversion: {
      type: Number,
      default: 0,
    },
    deuda: {
      type: Number,
      default: 0,
    },
    patrimonio: {
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

const FinancialDashboard: Model<IFinancialDashboard> =
  mongoose.models.FinancialDashboard || mongoose.model<IFinancialDashboard>('FinancialDashboard', FinancialDashboardSchema)

export default FinancialDashboard


import FinancialDashboard from '@/lib/models/FinancialDashboard'
import connectDB from '@/lib/mongodb'

export interface FinancialDashboardData {
  ingresos: number
  gastos: number
  ahorro: number
  inversion: number
  deuda: number
  patrimonio: number
}

export async function getFinancialDashboard(userId: string): Promise<FinancialDashboardData | null> {
  await connectDB()
  const dashboard = await FinancialDashboard.findOne({ user_id: userId }).lean()
  
  if (!dashboard) return null
  
  return {
    ingresos: dashboard.ingresos,
    gastos: dashboard.gastos,
    ahorro: dashboard.ahorro,
    inversion: dashboard.inversion,
    deuda: dashboard.deuda,
    patrimonio: dashboard.patrimonio,
  }
}

export async function saveFinancialDashboard(
  userId: string,
  data: FinancialDashboardData
): Promise<void> {
  await connectDB()
  await FinancialDashboard.findOneAndUpdate(
    { user_id: userId },
    {
      $set: {
        ingresos: data.ingresos,
        gastos: data.gastos,
        ahorro: data.ahorro,
        inversion: data.inversion,
        deuda: data.deuda,
        patrimonio: data.patrimonio,
      }
    },
    { upsert: true, new: true }
  )
}


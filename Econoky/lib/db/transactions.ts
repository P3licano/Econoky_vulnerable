import Transaction, { ITransaction } from '@/lib/models/Transaction'
import connectDB from '@/lib/mongodb'

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'income' | 'expense' | 'subscription' | 'refund'
  description: string | null
  created_at: Date
}

export async function getTransactionsByUserId(
  userId: string,
  limit: number = 50
): Promise<Transaction[]> {
  await connectDB()
  const transactions = await Transaction.find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .lean()

  return transactions.map((transaction: any) => ({
    id: transaction._id.toString(),
    user_id: transaction.user_id,
    amount: transaction.amount,
    type: transaction.type,
    description: transaction.description || null,
    created_at: transaction.created_at,
  }))
}

export async function createTransaction(data: {
  user_id: string
  amount: number
  type: 'income' | 'expense' | 'subscription' | 'refund'
  description?: string
}): Promise<string> {
  await connectDB()
  const transaction = await Transaction.create({
    user_id: data.user_id,
    amount: data.amount,
    type: data.type,
    description: data.description,
  })
  
  return transaction._id.toString()
}

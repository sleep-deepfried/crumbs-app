'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import {
  calculateMood,
  calculateSafeToSpend,
  calculateBrewLevel,
  getTransactionType,
} from '@/lib/gamification'
import { getUserTransactions } from './user'
import { TransactionCategory } from '@/types'

export async function addTransaction(
  userId: string,
  amount: number,
  category: TransactionCategory,
  description?: string,
  isSavings: boolean = false,
  subcategory?: string,
  mainCategory?: string
) {
  try {
    const type = getTransactionType(category)

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        category,
        isSavings,
        description: description || null,
        subcategory: subcategory || null,
        mainCategory: mainCategory || null,
      },
    })

    // Get user and recalculate their state
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get all transactions for this month
    const transactions = await getUserTransactions(userId)

    // Calculate new financial state
    const monthlyExpenses = transactions
      .filter((t: { type: string }) => t.type === 'EXPENSE')
      .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)

    const safeToSpend = calculateSafeToSpend(user.spendingLimit, monthlyExpenses)
    const newMood = calculateMood(safeToSpend, user.spendingLimit)

    // Update totalSaved if this is a savings transaction
    let newTotalSaved = user.totalSaved
    if (isSavings && category === 'EXPENSE') {
      newTotalSaved += amount
    }

    const newBrewLevel = calculateBrewLevel(newTotalSaved)

    // Update user state
    await prisma.user.update({
      where: { id: userId },
      data: {
        crumbMood: newMood,
        totalSaved: newTotalSaved,
        brewLevel: newBrewLevel,
      },
    })

    revalidatePath('/')
    return { success: true, newMood, newBrewLevel }
  } catch (error) {
    console.error('Failed to add transaction:', error)
    return { success: false, error: 'Failed to add transaction' }
  }
}

export async function deleteTransaction(transactionId: string, userId: string) {
  try {
    // Verify transaction belongs to user
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    })

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    return { success: false, error: 'Failed to delete transaction' }
  }
}


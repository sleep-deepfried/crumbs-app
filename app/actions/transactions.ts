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
  mainCategory?: string,
  creditCardId?: string,
  accountId?: string
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
        creditCardId: creditCardId || null,
        accountId: accountId || null,
      },
    })

    // If linked to credit card, update credit card balance
    if (creditCardId) {
      if (category === 'EXPENSE') {
        // Increase credit used (spend on credit)
        await prisma.account.update({
          where: { id: creditCardId },
          data: {
            creditUsed: { increment: amount },
          },
        })
      } else if (category === 'INCOME') {
        // Decrease credit used (pay off credit card)
        await prisma.account.update({
          where: { id: creditCardId },
          data: {
            creditUsed: { decrement: amount },
          },
        })
      }
      revalidatePath('/wallet')
    }

    // If linked to a regular account, update its balance
    if (accountId) {
      if (category === 'EXPENSE') {
        // Deduct from account for expenses
        await prisma.account.update({
          where: { id: accountId },
          data: {
            balance: { decrement: amount },
          },
        })
      } else if (category === 'INCOME') {
        // Add to account for income
        await prisma.account.update({
          where: { id: accountId },
          data: {
            balance: { increment: amount },
          },
        })
      }
      revalidatePath('/wallet')
    }

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
    // Verify transaction belongs to user and get full transaction details
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    })

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    // Reverse credit card balance if transaction was linked to credit card
    if (transaction.creditCardId) {
      if (transaction.type === 'EXPENSE') {
        // Reverse expense: decrease creditUsed
        await prisma.account.update({
          where: { id: transaction.creditCardId },
          data: {
            creditUsed: { decrement: transaction.amount },
          },
        })
      } else if (transaction.type === 'INCOME') {
        // Reverse payment: increase creditUsed (undo the payment)
        await prisma.account.update({
          where: { id: transaction.creditCardId },
          data: {
            creditUsed: { increment: transaction.amount },
          },
        })
      }
      revalidatePath('/wallet')
    }

    // Reverse account balance if transaction was linked to regular account
    if (transaction.accountId) {
      if (transaction.type === 'EXPENSE') {
        // Reverse expense: add back to account
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: { increment: transaction.amount },
          },
        })
      } else if (transaction.type === 'INCOME') {
        // Reverse income: subtract from account
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: { decrement: transaction.amount },
          },
        })
      }
      revalidatePath('/wallet')
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


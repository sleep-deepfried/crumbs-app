'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { RecurringFrequency, TransactionCategory } from '@/types'
import { addDays, addWeeks, addMonths, addYears, startOfDay } from 'date-fns'

export async function createRecurringTransaction(
  userId: string,
  amount: number,
  category: TransactionCategory,
  frequency: RecurringFrequency,
  startDate: Date,
  description?: string,
  mainCategory?: string,
  subcategory?: string,
  isSavings: boolean = false,
  interval: number = 1,
  dayOfWeek?: number,
  dayOfMonth?: number,
  endDate?: Date
) {
  try {
    const type = category === 'INCOME' ? 'INCOME' : 'EXPENSE'
    
    // Calculate first occurrence
    const nextOccurrence = calculateNextOccurrence(
      startDate,
      frequency,
      interval,
      dayOfWeek,
      dayOfMonth
    )

    const recurring = await prisma.recurringTransaction.create({
      data: {
        userId,
        amount,
        type,
        category,
        frequency,
        interval,
        dayOfWeek,
        dayOfMonth,
        startDate: startOfDay(startDate),
        endDate: endDate ? startOfDay(endDate) : null,
        nextOccurrence: startOfDay(nextOccurrence),
        isActive: true,
        description: description || null,
        mainCategory: mainCategory || null,
        subcategory: subcategory || null,
        isSavings,
      },
    })

    revalidatePath('/')
    return { success: true, id: recurring.id }
  } catch (error) {
    console.error('Failed to create recurring transaction:', error)
    return { success: false, error: 'Failed to create recurring transaction' }
  }
}

export async function getRecurringTransactions(userId: string) {
  try {
    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId, isActive: true },
      orderBy: { nextOccurrence: 'asc' },
    })
    return recurring
  } catch (error) {
    console.error('Failed to fetch recurring transactions:', error)
    return []
  }
}

export async function updateRecurringTransaction(
  id: string,
  userId: string,
  data: Partial<{
    amount: number
    description: string
    isActive: boolean
    endDate: Date
  }>
) {
  try {
    const recurring = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    })

    if (!recurring) {
      return { success: false, error: 'Recurring transaction not found' }
    }

    await prisma.recurringTransaction.update({
      where: { id },
      data,
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update recurring transaction:', error)
    return { success: false, error: 'Failed to update recurring transaction' }
  }
}

export async function deleteRecurringTransaction(id: string, userId: string) {
  try {
    await prisma.recurringTransaction.deleteMany({
      where: { id, userId },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete recurring transaction:', error)
    return { success: false, error: 'Failed to delete recurring transaction' }
  }
}

function calculateNextOccurrence(
  current: Date,
  frequency: RecurringFrequency,
  interval: number,
  dayOfWeek?: number,
  dayOfMonth?: number
): Date {
  switch (frequency) {
    case 'DAILY':
      return addDays(current, interval)
    case 'WEEKLY':
      return addWeeks(current, interval)
    case 'MONTHLY':
      return addMonths(current, interval)
    case 'YEARLY':
      return addYears(current, interval)
    default:
      return addMonths(current, 1)
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { getMonthStart, getMonthEnd } from '@/lib/utils'
import { calculateMonthlyExpenses, calculateSafeToSpend } from '@/lib/gamification'
import { MoodState, BrewLevel, TransactionType, TransactionCategory, RecurringFrequency } from '@/types'

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  })

  return user
}

export async function getUserTransactions(userId: string) {
  const monthStart = getMonthStart()
  const monthEnd = getMonthEnd()

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  return transactions
}

export async function getDashboardData() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Get current month transactions
  let transactions = await getUserTransactions(user.id)
  
  // Get ALL transactions for analytics
  const allTimeTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
  })
  
  const monthlyExpenses = calculateMonthlyExpenses(transactions)
  const monthlyIncome = transactions
    .filter((t: { type: string }) => t.type === 'INCOME')
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59, 999)

  const lastMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
      type: 'EXPENSE',
    },
  })
  const lastMonthExpenses = calculateMonthlyExpenses(lastMonthTransactions)

  const expenses = transactions.filter((t: { type: string }) => t.type === 'EXPENSE')
  const largestExpense = expenses.length > 0
    ? expenses.reduce((prev, current) => (prev.amount > current.amount ? prev : current), expenses[0])
    : null

  const safeToSpend = calculateSafeToSpend(user.spendingLimit, monthlyExpenses)

  // Get friends' data
  const friendships = await prisma.friendship.findMany({
    where: { userId: user.id },
    include: {
      friend: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          crumbMood: true,
        },
      },
    },
    take: 10,
  })

  const friends = friendships.map((f: { friend: { id: string; username: string; avatarUrl: string | null; crumbMood: string } }) => ({
    ...f.friend,
    crumbMood: f.friend.crumbMood as MoodState,
  }))

  // Get recurring transactions
  const recurringTransactions = await prisma.recurringTransaction.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { nextOccurrence: 'asc' },
    take: 5,
  })

  // Get accounts
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { balance: 'desc' },
  })

  // Calculate total saved from account balances
  const totalSaved = accounts.reduce((sum, account) => sum + account.balance, 0)

  return {
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      crumbMood: user.crumbMood as MoodState,
      brewLevel: user.brewLevel as BrewLevel,
      totalSaved, // Override with calculated value
    },
    safeToSpend,
    monthlyExpenses,
    monthlyIncome,
    recentTransactions: transactions.slice(0, 3).map(t => ({
      ...t,
      date: t.date.toISOString(),
      type: t.type as TransactionType,
      category: t.category as TransactionCategory,
    })),
    allTransactions: allTimeTransactions.map(t => ({
      ...t,
      date: t.date.toISOString(),
      type: t.type as TransactionType,
      category: t.category as TransactionCategory,
    })),
    recurringTransactions: recurringTransactions.map(rt => ({
      ...rt,
      nextOccurrence: rt.nextOccurrence.toISOString(),
      type: rt.type as TransactionType,
      category: rt.category as TransactionCategory,
      frequency: rt.frequency as RecurringFrequency,
    })),
    accounts, // Add accounts to response
    lastMonthExpenses,
    largestExpense: largestExpense ? {
      category: largestExpense.category as TransactionCategory,
      amount: largestExpense.amount,
      subcategory: largestExpense.subcategory,
    } : null,
    friends,
  }
}

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    include: {
      friend: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          crumbMood: true,
        },
      },
    },
  })

  return friendships.map((f: { friend: { id: string; username: string; avatarUrl: string | null; crumbMood: string } }) => f.friend)
}


'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { getMonthStart, getMonthEnd } from '@/lib/utils'
import { calculateMonthlyExpenses, calculateSafeToSpend } from '@/lib/gamification'
import { MoodState, BrewLevel } from '@/types'

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

  const transactions = await getUserTransactions(user.id)
  const monthlyExpenses = calculateMonthlyExpenses(transactions)
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

  return {
    user: {
      ...user,
      crumbMood: user.crumbMood as MoodState,
      brewLevel: user.brewLevel as BrewLevel,
    },
    safeToSpend,
    monthlyExpenses,
    monthlyIncome: user.monthlyIncome,
    recentTransactions: transactions.slice(0, 5),
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


export type MoodState = 'HARMONY' | 'CRUMBLY' | 'SOGGY'

export type TransactionType = 'EXPENSE' | 'INCOME'

export type TransactionCategory = 'NEEDS' | 'WANTS' | 'SAVINGS' | 'INCOME'

export type BrewLevel = 1 | 2 | 3 // 1=Glass, 2=Mug, 3=Press

export interface User {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  monthlyIncome: number
  spendingLimit: number
  totalSaved: number
  currentStreak: number
  crumbMood: MoodState
  brewLevel: BrewLevel
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  description: string | null
  date: Date
}

export interface Friendship {
  id: string
  userId: string
  friendId: string
  createdAt: Date
}

export interface UserWithFriends extends User {
  friends: Friendship[]
  friendOf: Friendship[]
}

export interface DashboardData {
  user: User
  safeToSpend: number
  monthlyExpenses: number
  monthlyIncome: number
  recentTransactions: Transaction[]
  friends: Array<{
    id: string
    username: string
    avatarUrl: string | null
    crumbMood: MoodState
  }>
}

export interface AddTransactionInput {
  amount: number
  category: TransactionCategory
  description?: string
}


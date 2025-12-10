export type MoodState = 'HARMONY' | 'CRUMBLY' | 'SOGGY'

export type TransactionType = 'EXPENSE' | 'INCOME'

export type TransactionCategory = 'EXPENSE' | 'INCOME'

export type BrewLevel = 1 | 2 | 3 // 1=Glass, 2=Mug, 3=Press

export interface User {
  id: string
  username: string
  email: string
  avatarUrl: string | null
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
  mainCategory: string | null
  subcategory: string | null
  isSavings: boolean
  description: string | null
  date: Date
}

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface RecurringTransaction {
  id: string
  userId: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  mainCategory: string | null
  subcategory: string | null
  isSavings: boolean
  description: string | null
  frequency: RecurringFrequency
  interval: number
  dayOfWeek: number | null
  dayOfMonth: number | null
  startDate: Date
  endDate: Date | null
  nextOccurrence: Date
  lastProcessed: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
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
  isSavings?: boolean
  description?: string
}


export type MoodState = 'HARMONY' | 'CRUMBLY' | 'SOGGY'

export type TransactionType = 'EXPENSE' | 'INCOME'

export type TransactionCategory = 'EXPENSE' | 'INCOME'

export type BrewLevel = 1 | 2 | 3 // 1=Glass, 2=Mug, 3=Press

export type AccountType = 'BANK' | 'E-WALLET' | 'CREDIT_CARD'

export type AccountCategory = 'EMERGENCY' | 'SAVINGS' | 'SPENDING' | 'INVESTMENT' | 'GENERAL'

export type RewardsType = 'CASHBACK' | 'POINTS' | 'MILES' | null

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  balance: number
  color: string | null
  category: AccountCategory
  description: string | null
  icon: string | null
  sortOrder: number
  
  // Goal tracking
  goalEnabled: boolean
  goalAmount: number | null
  goalDeadline: Date | null
  goalStartBalance: number | null
  goalStartDate: Date | null
  
  // Credit card specific fields
  creditLimit: number | null
  creditUsed: number | null
  statementDate: number | null
  paymentDueDate: number | null
  minimumPayment: number | null
  interestRate: number | null
  rewardsType: RewardsType
  rewardsBalance: number | null
  rewardsRate: number | null
  
  createdAt: Date
  updatedAt: Date
}

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
  creditCardId: string | null
  accountId: string | null
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
  recurringTransactions: RecurringTransaction[]
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


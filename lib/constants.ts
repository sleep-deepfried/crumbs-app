import { TransactionCategory } from '@/types'

// Mood thresholds (% of budget remaining)
export const MOOD_THRESHOLDS = {
  HARMONY: 0.5, // >50% budget remaining
  CRUMBLY: 0.2, // <20% budget remaining
  SOGGY: 0, // Over budget
} as const

// Brew level milestones (total saved)
export const BREW_MILESTONES = {
  GLASS: 0, // Level 1: 0-49,999
  MUG: 50000, // Level 2: 50k-99,999
  PRESS: 100000, // Level 3: 100k+
} as const

export const BREW_LEVEL_NAMES = {
  1: 'Glass',
  2: 'Mug',
  3: 'French Press',
} as const

// Transaction categories
export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  'EXPENSE',
  'INCOME',
]

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  EXPENSE: 'Expense',
  INCOME: 'Income',
}

export const CATEGORY_DESCRIPTIONS: Record<TransactionCategory, string> = {
  EXPENSE: 'Money going out',
  INCOME: 'Money coming in',
}

// Color palette
export const COLORS = {
  creamBg: '#FDF6EC',
  darkRoast: '#4A3B32',
  goldenCrust: '#E6C288',
  burntRed: '#D9534F',
  brewSteam: '#A8D5BA',
} as const

// Default values
export const DEFAULT_VALUES = {
  monthlyIncome: 69500,
  spendingLimit: 39500,
  totalSaved: 0,
  currentStreak: 0,
} as const

// Mobile breakpoint
export const MOBILE_WIDTH = 375 // iPhone SE/mini


import { Account, AccountCategory } from '@/types'
import { ShieldAlert, PiggyBank, CreditCard, TrendingUp, FolderOpen } from 'lucide-react'

export interface GroupedAccounts {
  EMERGENCY: Account[]
  SAVINGS: Account[]
  SPENDING: Account[]
  INVESTMENT: Account[]
  GENERAL: Account[]
}

export interface CategoryInfo {
  label: string
  icon: typeof ShieldAlert
  color: string
  bgColor: string
  description: string
}

/**
 * Normalize category to ensure it's valid
 */
function normalizeCategory(category: AccountCategory | string | undefined | null): AccountCategory {
  if (!category) return 'GENERAL'
  const validCategories: AccountCategory[] = ['EMERGENCY', 'SAVINGS', 'SPENDING', 'INVESTMENT', 'GENERAL']
  return validCategories.includes(category as AccountCategory) ? (category as AccountCategory) : 'GENERAL'
}

/**
 * Group accounts by category
 */
export function groupAccountsByCategory(accounts: Account[]): GroupedAccounts {
  const grouped: GroupedAccounts = {
    EMERGENCY: [],
    SAVINGS: [],
    SPENDING: [],
    INVESTMENT: [],
    GENERAL: [],
  }

  accounts.forEach((account) => {
    // Ensure category is valid, default to GENERAL if not
    const category = normalizeCategory(account.category)
    grouped[category].push(account)
  })

  // Sort within each category by sortOrder, then by balance descending
  Object.keys(grouped).forEach((key) => {
    const category = key as AccountCategory
    grouped[category].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder
      }
      return b.balance - a.balance
    })
  })

  return grouped
}

/**
 * Get icon for account category
 */
export function getCategoryIcon(category: AccountCategory | string | undefined | null): typeof ShieldAlert {
  const icons = {
    EMERGENCY: ShieldAlert,
    SAVINGS: PiggyBank,
    SPENDING: CreditCard,
    INVESTMENT: TrendingUp,
    GENERAL: FolderOpen,
  }
  return icons[category as AccountCategory] || icons.GENERAL
}

/**
 * Get color theme for category
 */
export function getCategoryColor(category: AccountCategory | string | undefined | null): string {
  const colors = {
    EMERGENCY: '#C74444', // Red
    SAVINGS: '#4A7C59', // Green
    SPENDING: '#4A6FA5', // Blue
    INVESTMENT: '#6B5B95', // Purple
    GENERAL: '#6B5B4F', // Gray/Brown
  }
  return colors[category as AccountCategory] || colors.GENERAL
}

/**
 * Get background color for category badge
 */
export function getCategoryBgColor(category: AccountCategory | string | undefined | null): string {
  const bgColors = {
    EMERGENCY: '#FEE2E2', // Light red
    SAVINGS: '#D1FAE5', // Light green
    SPENDING: '#DBEAFE', // Light blue
    INVESTMENT: '#EDE9FE', // Light purple
    GENERAL: '#F3F4F6', // Light gray
  }
  return bgColors[category as AccountCategory] || bgColors.GENERAL
}

/**
 * Get description for category
 */
export function getCategoryDescription(category: AccountCategory | string | undefined | null): string {
  const descriptions = {
    EMERGENCY: 'For unexpected expenses and emergencies',
    SAVINGS: 'Long-term savings and financial goals',
    SPENDING: 'Daily expenses and regular spending',
    INVESTMENT: 'Investment accounts and portfolios',
    GENERAL: 'General purpose accounts',
  }
  return descriptions[category as AccountCategory] || descriptions.GENERAL
}

/**
 * Get full category information
 */
export function getCategoryInfo(category: AccountCategory | string | undefined | null): CategoryInfo {
  const normalized = normalizeCategory(category)
  return {
    label: normalized.charAt(0) + normalized.slice(1).toLowerCase(),
    icon: getCategoryIcon(normalized),
    color: getCategoryColor(normalized),
    bgColor: getCategoryBgColor(normalized),
    description: getCategoryDescription(normalized),
  }
}

/**
 * Sort accounts within a category
 */
export function sortAccountsWithinCategory(accounts: Account[]): Account[] {
  return [...accounts].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder
    }
    return b.balance - a.balance
  })
}

/**
 * Get all categories with their display names
 */
export const CATEGORIES: Array<{ value: AccountCategory; label: string }> = [
  { value: 'EMERGENCY', label: 'Emergency Fund' },
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'SPENDING', label: 'Daily Spending' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'GENERAL', label: 'General' },
]

/**
 * Preset color palette
 */
export const COLOR_PALETTE = [
  { name: 'Espresso', hex: '#4A3B32' },
  { name: 'Mocha', hex: '#6B5B4F' },
  { name: 'Latte', hex: '#8B7355' },
  { name: 'Caramel', hex: '#E6C288' },
  { name: 'Butterscotch', hex: '#D4A574' },
  { name: 'Sage', hex: '#4A7C59' },
  { name: 'Forest', hex: '#2D5F3F' },
  { name: 'Mint', hex: '#7CAA8C' },
  { name: 'Ocean', hex: '#4A6FA5' },
  { name: 'Navy', hex: '#2C4A7C' },
  { name: 'Lavender', hex: '#6B5B95' },
  { name: 'Ruby', hex: '#C74444' },
]


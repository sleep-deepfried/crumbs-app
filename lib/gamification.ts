import { MoodState, BrewLevel } from '@/types'
import { MOOD_THRESHOLDS, BREW_MILESTONES } from './constants'

/**
 * Calculate the current mood based on remaining budget percentage
 * @param remainingBudget Amount left to spend this month
 * @param spendingLimit Total spending limit for the month
 * @returns MoodState (HARMONY, CRUMBLY, or SOGGY)
 */
export function calculateMood(
  remainingBudget: number,
  spendingLimit: number
): MoodState {
  if (spendingLimit === 0) return 'HARMONY'
  
  const percentageRemaining = remainingBudget / spendingLimit

  if (percentageRemaining < 0) {
    return 'SOGGY' // Over budget - BUN has fallen into BREW!
  } else if (percentageRemaining < MOOD_THRESHOLDS.CRUMBLY) {
    return 'CRUMBLY' // Low budget - BUN is dry, BREW is cold
  } else {
    return 'HARMONY' // Good budget - BUN is fluffy, BREW is steaming
  }
}

/**
 * Calculate BREW's vessel level based on total saved
 * @param totalSaved Total amount saved
 * @returns BrewLevel (1=Glass, 2=Mug, 3=Press)
 */
export function calculateBrewLevel(totalSaved: number): BrewLevel {
  if (totalSaved >= BREW_MILESTONES.PRESS) {
    return 3 // French Press
  } else if (totalSaved >= BREW_MILESTONES.MUG) {
    return 2 // Mug
  } else {
    return 1 // Glass
  }
}

/**
 * Calculate how much is safe to spend
 * @param spendingLimit Monthly spending limit
 * @param monthlyExpenses Total expenses this month
 * @returns Amount safe to spend
 */
export function calculateSafeToSpend(
  spendingLimit: number,
  monthlyExpenses: number
): number {
  return Math.max(0, spendingLimit - monthlyExpenses)
}

/**
 * Calculate total expenses from transactions
 * @param transactions Array of transactions
 * @returns Total expense amount
 */
export function calculateMonthlyExpenses(
  transactions: Array<{ type: string; amount: number; category: string }>
): number {
  return transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate total income from transactions
 * @param transactions Array of transactions
 * @returns Total income amount
 */
export function calculateMonthlyIncome(
  transactions: Array<{ type: string; amount: number; category: string }>
): number {
  return transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate progress towards savings goal
 * @param totalSaved Current total saved
 * @param goal Savings goal
 * @returns Percentage (0-100)
 */
export function calculateSavingsProgress(
  totalSaved: number,
  goal: number = 150000
): number {
  return Math.min(100, (totalSaved / goal) * 100)
}

/**
 * Check if BREW level should be updated
 * @param currentLevel Current BREW level
 * @param totalSaved New total saved amount
 * @returns New BREW level if changed, null otherwise
 */
export function checkBrewLevelUpdate(
  currentLevel: BrewLevel,
  totalSaved: number
): BrewLevel | null {
  const newLevel = calculateBrewLevel(totalSaved)
  return newLevel !== currentLevel ? newLevel : null
}

/**
 * Determine transaction type based on category
 * @param category Transaction category
 * @returns Transaction type (EXPENSE or INCOME)
 */
export function getTransactionType(
  category: string
): 'EXPENSE' | 'INCOME' {
  return category === 'INCOME' ? 'INCOME' : 'EXPENSE'
}


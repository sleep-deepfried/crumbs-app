import { Account } from '@/types'

export interface GoalProgress {
  percentage: number
  amountAchieved: number
  amountRemaining: number
  isComplete: boolean
  daysRemaining: number | null
  projectedCompletionDate: Date | null
}

export function calculateGoalProgress(account: Account): GoalProgress | null {
  if (!account.goalEnabled || !account.goalAmount) return null
  
  const target = account.goalAmount
  const current = account.balance
  const startBalance = account.goalStartBalance || 0
  
  const amountAchieved = current - startBalance
  const amountRemaining = Math.max(0, target - current)
  const percentage = Math.min(100, Math.round((current / target) * 100))
  const isComplete = current >= target
  
  let daysRemaining = null
  let projectedCompletionDate = null
  
  if (account.goalDeadline) {
    const now = new Date()
    const deadline = new Date(account.goalDeadline)
    daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }
  
  // Project completion based on average daily progress
  if (account.goalStartDate && amountAchieved > 0 && !isComplete) {
    const daysSinceStart = Math.ceil(
      (new Date().getTime() - new Date(account.goalStartDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceStart > 0) {
      const dailyAverage = amountAchieved / daysSinceStart
      if (dailyAverage > 0) {
        const daysNeeded = Math.ceil(amountRemaining / dailyAverage)
        projectedCompletionDate = new Date(Date.now() + daysNeeded * 24 * 60 * 60 * 1000)
      }
    }
  }
  
  return {
    percentage,
    amountAchieved,
    amountRemaining,
    isComplete,
    daysRemaining,
    projectedCompletionDate,
  }
}

export function getGoalStatusColor(percentage: number): string {
  if (percentage >= 100) return '#4A7C59' // Green - Complete
  if (percentage >= 75) return '#6B5B95' // Purple - Almost there
  if (percentage >= 50) return '#4A6FA5' // Blue - Halfway
  if (percentage >= 25) return '#E6C288' // Yellow - Getting started
  return '#C74444' // Red - Just started
}

export function getGoalMotivationalMessage(progress: GoalProgress): string {
  const { percentage, isComplete, daysRemaining } = progress
  
  if (isComplete) return "🎉 Goal achieved! Great work!"
  if (percentage >= 90) return "Almost there! Keep it up!"
  if (percentage >= 75) return "You're crushing it!"
  if (percentage >= 50) return "Halfway there!"
  if (percentage >= 25) return "Off to a great start!"
  
  if (daysRemaining !== null && daysRemaining < 30) {
    return `${daysRemaining} days left - stay focused!`
  }
  
  return "Every step counts!"
}


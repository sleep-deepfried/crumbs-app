import { Account } from '@/types'

export interface CreditCardMetrics {
  availableCredit: number
  utilization: number
  daysUntilDue: number
  isOverdue: boolean
  monthlySpending: number
}

export interface CreditSummary {
  totalDebt: number
  totalLimit: number
  overallUtilization: number
  upcomingPayments: Array<{
    accountId: string
    accountName: string
    amount: number
    dueDate: Date
    daysUntil: number
  }>
  totalRewards: {
    cashback: number
    points: number
    miles: number
  }
}

export function calculateCreditMetrics(account: Account): CreditCardMetrics | null {
  if (account.type !== 'CREDIT_CARD' || !account.creditLimit) return null
  
  const availableCredit = account.creditLimit - (account.creditUsed || 0)
  const utilization = account.creditLimit > 0 
    ? Math.round(((account.creditUsed || 0) / account.creditLimit) * 100) 
    : 0
  
  // Calculate days until due
  const today = new Date()
  const currentDay = today.getDate()
  const dueDay = account.paymentDueDate || 0
  
  let daysUntilDue = 0
  if (dueDay > 0) {
    if (dueDay >= currentDay) {
      daysUntilDue = dueDay - currentDay
    } else {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
      daysUntilDue = Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }
  }
  
  return {
    availableCredit,
    utilization,
    daysUntilDue,
    isOverdue: daysUntilDue < 0,
    monthlySpending: 0 // Will calculate from transactions
  }
}

export function getUtilizationColor(utilization: number): string {
  if (utilization >= 80) return '#C74444' // Red - Danger
  if (utilization >= 50) return '#E6C288' // Yellow - Warning
  if (utilization >= 30) return '#4A6FA5' // Blue - Good
  return '#4A7C59' // Green - Excellent
}

export function getUtilizationLabel(utilization: number): string {
  if (utilization >= 80) return 'High usage - consider paying down'
  if (utilization >= 50) return 'Moderate usage'
  if (utilization >= 30) return 'Good usage'
  return 'Excellent - low utilization'
}

export function calculateCreditSummary(accounts: Account[]): CreditSummary {
  const creditCards = accounts.filter(a => a.type === 'CREDIT_CARD')
  
  const totalDebt = creditCards.reduce((sum, card) => sum + (card.creditUsed || 0), 0)
  const totalLimit = creditCards.reduce((sum, card) => sum + (card.creditLimit || 0), 0)
  const overallUtilization = totalLimit > 0 ? Math.round((totalDebt / totalLimit) * 100) : 0
  
  // Calculate upcoming payments
  const upcomingPayments = creditCards
    .filter(card => card.paymentDueDate && card.minimumPayment)
    .map(card => {
      const today = new Date()
      const dueDay = card.paymentDueDate!
      const currentDay = today.getDate()
      
      let daysUntil = 0
      let dueDate = new Date()
      
      if (dueDay >= currentDay) {
        daysUntil = dueDay - currentDay
        dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay)
      } else {
        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
        daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      }
      
      return {
        accountId: card.id,
        accountName: card.name,
        amount: card.minimumPayment!,
        dueDate,
        daysUntil
      }
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
  
  // Calculate total rewards
  const totalRewards = creditCards.reduce((acc, card) => {
    if (card.rewardsType === 'CASHBACK') {
      acc.cashback += card.rewardsBalance || 0
    } else if (card.rewardsType === 'POINTS') {
      acc.points += card.rewardsBalance || 0
    } else if (card.rewardsType === 'MILES') {
      acc.miles += card.rewardsBalance || 0
    }
    return acc
  }, { cashback: 0, points: 0, miles: 0 })
  
  return {
    totalDebt,
    totalLimit,
    overallUtilization,
    upcomingPayments,
    totalRewards
  }
}


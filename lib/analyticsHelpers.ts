import { Transaction } from '@/types'

export interface SpendingTrend {
  date: string
  expenses: number
  income: number
  net: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  subcategories?: { name: string; amount: number }[]
}

export interface AnalyticsInsight {
  type: 'positive' | 'warning' | 'info'
  message: string
  emoji?: string
}

/**
 * Get spending trends grouped by day
 */
export function getSpendingTrends(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): SpendingTrend[] {
  const trends: Map<string, SpendingTrend> = new Map()

  // Initialize all dates in range
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    trends.set(dateKey, {
      date: dateKey,
      expenses: 0,
      income: 0,
      net: 0,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Process transactions
  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date)
    if (transactionDate >= startDate && transactionDate <= endDate) {
      const dateKey = transactionDate.toISOString().split('T')[0]
      const trend = trends.get(dateKey) || {
        date: dateKey,
        expenses: 0,
        income: 0,
        net: 0,
      }

      if (transaction.type === 'EXPENSE') {
        trend.expenses += transaction.amount
      } else if (transaction.type === 'INCOME') {
        trend.income += transaction.amount
      }

      trend.net = trend.income - trend.expenses
      trends.set(dateKey, trend)
    }
  })

  return Array.from(trends.values()).sort((a, b) => 
    a.date.localeCompare(b.date)
  )
}

/**
 * Get category breakdown (NEEDS/WANTS/SAVINGS)
 */
export function getCategoryBreakdown(
  transactions: Transaction[],
  period: 'month' | 'all'
): CategoryBreakdown[] {
  const categoryTotals: Map<string, { amount: number; subcategories: Map<string, number> }> = new Map()

  const now = new Date()
  const startDate = period === 'month' 
    ? new Date(now.getFullYear(), now.getMonth(), 1)
    : new Date(0) // All time

  const expenses = transactions.filter(
    (t) => t.type === 'EXPENSE' && new Date(t.date) >= startDate
  )

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

  expenses.forEach((transaction) => {
    const mainCategory = transaction.mainCategory || 'OTHER'
    const subcategory = transaction.subcategory || 'Other'

    if (!categoryTotals.has(mainCategory)) {
      categoryTotals.set(mainCategory, {
        amount: 0,
        subcategories: new Map(),
      })
    }

    const category = categoryTotals.get(mainCategory)!
    category.amount += transaction.amount

    const subTotal = category.subcategories.get(subcategory) || 0
    category.subcategories.set(subcategory, subTotal + transaction.amount)
  })

  const breakdown: CategoryBreakdown[] = Array.from(categoryTotals.entries()).map(
    ([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      subcategories: Array.from(data.subcategories.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount),
    })
  )

  return breakdown.sort((a, b) => b.amount - a.amount)
}

/**
 * Calculate rule-based insights
 */
export function calculateInsights(
  transactions: Transaction[],
  user: { spendingLimit?: number; totalSaved?: number }
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = []

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const thisMonthExpenses = transactions
    .filter(
      (t) =>
        t.type === 'EXPENSE' &&
        new Date(t.date) >= thisMonthStart &&
        new Date(t.date) <= now
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonthExpenses = transactions
    .filter(
      (t) =>
        t.type === 'EXPENSE' &&
        new Date(t.date) >= lastMonthStart &&
        new Date(t.date) <= lastMonthEnd
    )
    .reduce((sum, t) => sum + t.amount, 0)

  // Monthly comparison
  if (lastMonthExpenses > 0) {
    const change = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    if (change > 20) {
      insights.push({
        type: 'warning',
        message: `You spent ${change.toFixed(0)}% more than last month`,
        emoji: '⚠️',
      })
    } else if (change < -20) {
      insights.push({
        type: 'positive',
        message: `Great! You spent ${Math.abs(change).toFixed(0)}% less than last month`,
        emoji: '🎉',
      })
    }
  }

  // Spending limit warning
  if (user.spendingLimit && thisMonthExpenses >= user.spendingLimit * 0.9) {
    insights.push({
      type: 'warning',
      message: `You're approaching your spending limit (${((thisMonthExpenses / user.spendingLimit) * 100).toFixed(0)}%)`,
      emoji: '⚠️',
    })
  }

  // Biggest category
  const breakdown = getCategoryBreakdown(transactions, 'month')
  if (breakdown.length > 0) {
    const biggest = breakdown[0]
    insights.push({
      type: 'info',
      message: `Your biggest spending category is ${biggest.category} at ₱${biggest.amount.toLocaleString()}`,
      emoji: '📊',
    })
  }

  // Best saving day
  const dayOfWeekTotals: Map<number, number> = new Map()
  transactions
    .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= thisMonthStart)
    .forEach((t) => {
      const day = new Date(t.date).getDay()
      dayOfWeekTotals.set(day, (dayOfWeekTotals.get(day) || 0) + t.amount)
    })

  if (dayOfWeekTotals.size > 0) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const sortedDays = Array.from(dayOfWeekTotals.entries())
      .sort((a, b) => a[1] - b[1])
    
    if (sortedDays.length > 0) {
      const bestDay = days[sortedDays[0][0]]
      insights.push({
        type: 'positive',
        message: `Best saving day: ${bestDay} - you spend less on this day`,
        emoji: '💡',
      })
    }
  }

  return insights
}

/**
 * Detect unusual spending patterns
 */
export function detectUnusualSpending(transactions: Transaction[]): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = []

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const thisMonthExpenses = transactions.filter(
    (t) => t.type === 'EXPENSE' && new Date(t.date) >= thisMonthStart
  )

  // Calculate average transaction amount
  const avgAmount =
    thisMonthExpenses.length > 0
      ? thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0) / thisMonthExpenses.length
      : 0

  // Find transactions 2x above average
  const unusual = thisMonthExpenses.filter((t) => t.amount > avgAmount * 2)

  if (unusual.length > 0) {
    const largest = unusual.sort((a, b) => b.amount - a.amount)[0]
    insights.push({
      type: 'warning',
      message: `Unusual expense detected: ₱${largest.amount.toLocaleString()} on ${largest.subcategory || 'Unknown'}`,
      emoji: '🔍',
    })
  }

  return insights
}

export interface MonthlyComparison {
  currentMonth: {
    income: number
    expenses: number
    net: number
  }
  previousMonth: {
    income: number
    expenses: number
    net: number
  }
  incomeChange: number // percentage
  expensesChange: number // percentage
}

/**
 * Compare current month vs previous month
 */
export function getMonthlyComparison(
  transactions: Transaction[]
): MonthlyComparison {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const currentMonthIncome = transactions
    .filter(
      (t) =>
        t.type === 'INCOME' &&
        new Date(t.date) >= currentMonthStart &&
        new Date(t.date) <= now
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpenses = transactions
    .filter(
      (t) =>
        t.type === 'EXPENSE' &&
        new Date(t.date) >= currentMonthStart &&
        new Date(t.date) <= now
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const previousMonthIncome = transactions
    .filter(
      (t) =>
        t.type === 'INCOME' &&
        new Date(t.date) >= previousMonthStart &&
        new Date(t.date) <= previousMonthEnd
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const previousMonthExpenses = transactions
    .filter(
      (t) =>
        t.type === 'EXPENSE' &&
        new Date(t.date) >= previousMonthStart &&
        new Date(t.date) <= previousMonthEnd
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const incomeChange =
    previousMonthIncome > 0
      ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100
      : currentMonthIncome > 0
      ? 100
      : 0

  const expensesChange =
    previousMonthExpenses > 0
      ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
      : currentMonthExpenses > 0
      ? 100
      : 0

  return {
    currentMonth: {
      income: currentMonthIncome,
      expenses: currentMonthExpenses,
      net: currentMonthIncome - currentMonthExpenses,
    },
    previousMonth: {
      income: previousMonthIncome,
      expenses: previousMonthExpenses,
      net: previousMonthIncome - previousMonthExpenses,
    },
    incomeChange,
    expensesChange,
  }
}

export interface DayOfWeekSpending {
  day: string
  dayIndex: number
  average: number
  total: number
  count: number
}

/**
 * Get spending by day of week
 */
export function getSpendingByDayOfWeek(
  transactions: Transaction[],
  weekNumber?: number // 1-based week number (1-5), undefined = all weeks
): DayOfWeekSpending[] {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const dayTotals: Map<number, { total: number; count: number }> = new Map()

  // Initialize all days
  for (let i = 0; i < 7; i++) {
    dayTotals.set(i, { total: 0, count: 0 })
  }

  // Process expenses from current month
  transactions
    .filter((t) => {
      if (t.type !== 'EXPENSE') return false
      const date = new Date(t.date)
      if (date < thisMonthStart || date > now) return false
      
      // If week filter is specified, check if transaction is in that week
      if (weekNumber !== undefined) {
        const dayOfMonth = date.getDate()
        const weekOfMonth = Math.ceil(dayOfMonth / 7)
        return weekOfMonth === weekNumber
      }
      
      return true
    })
    .forEach((t) => {
      const day = new Date(t.date).getDay()
      const current = dayTotals.get(day) || { total: 0, count: 0 }
      dayTotals.set(day, {
        total: current.total + t.amount,
        count: current.count + 1,
      })
    })

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return Array.from(dayTotals.entries())
    .map(([dayIndex, data]) => ({
      day: days[dayIndex],
      dayIndex,
      average: data.count > 0 ? data.total / data.count : 0,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => a.dayIndex - b.dayIndex)
}

export interface BudgetProgress {
  currentSpending: number
  spendingLimit: number
  percentage: number
  remaining: number
  daysRemaining: number
  projectedSpending: number
  willExceed: boolean
  daysUntilLimit: number | null
}

/**
 * Calculate budget progress
 */
export function calculateBudgetProgress(
  transactions: Transaction[],
  spendingLimit: number
): BudgetProgress | null {
  if (!spendingLimit || spendingLimit <= 0) return null

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const currentSpending = transactions
    .filter(
      (t) =>
        t.type === 'EXPENSE' &&
        new Date(t.date) >= monthStart &&
        new Date(t.date) <= now
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const daysElapsed = Math.max(1, now.getDate())
  const daysInMonth = monthEnd.getDate()
  const daysRemaining = daysInMonth - daysElapsed

  const dailyAverage = currentSpending / daysElapsed
  const projectedSpending = dailyAverage * daysInMonth

  const percentage = (currentSpending / spendingLimit) * 100
  const remaining = Math.max(0, spendingLimit - currentSpending)

  // Calculate days until limit at current rate
  let daysUntilLimit: number | null = null
  if (dailyAverage > 0 && currentSpending < spendingLimit) {
    daysUntilLimit = Math.ceil((spendingLimit - currentSpending) / dailyAverage)
  }

  return {
    currentSpending,
    spendingLimit,
    percentage,
    remaining,
    daysRemaining,
    projectedSpending,
    willExceed: projectedSpending > spendingLimit,
    daysUntilLimit,
  }
}

export interface SpendingVelocity {
  currentDailyAverage: number
  previousDailyAverage: number
  changePercentage: number
  projectedMonthlyTotal: number
  willExceedBudget: boolean
  daysUntilBudgetExceeded: number | null
}

/**
 * Calculate spending velocity
 */
export function calculateSpendingVelocity(
  transactions: Transaction[],
  spendingLimit?: number
): SpendingVelocity | null {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const currentMonthExpenses = transactions.filter(
    (t) =>
      t.type === 'EXPENSE' &&
      new Date(t.date) >= currentMonthStart &&
      new Date(t.date) <= now
  )

  const previousMonthExpenses = transactions.filter(
    (t) =>
      t.type === 'EXPENSE' &&
      new Date(t.date) >= previousMonthStart &&
      new Date(t.date) <= previousMonthEnd
  )

  const currentTotal = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
  const previousTotal = previousMonthExpenses.reduce((sum, t) => sum + t.amount, 0)

  const daysElapsed = Math.max(1, now.getDate())
  const previousDays = previousMonthEnd.getDate()

  const currentDailyAverage = currentTotal / daysElapsed
  const previousDailyAverage = previousTotal / previousDays

  const changePercentage =
    previousDailyAverage > 0
      ? ((currentDailyAverage - previousDailyAverage) / previousDailyAverage) * 100
      : currentDailyAverage > 0
      ? 100
      : 0

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const projectedMonthlyTotal = currentDailyAverage * daysInMonth

  let willExceedBudget = false
  let daysUntilBudgetExceeded: number | null = null

  if (spendingLimit && spendingLimit > 0) {
    willExceedBudget = projectedMonthlyTotal > spendingLimit
    if (currentDailyAverage > 0 && currentTotal < spendingLimit) {
      daysUntilBudgetExceeded = Math.ceil((spendingLimit - currentTotal) / currentDailyAverage)
    }
  }

  return {
    currentDailyAverage,
    previousDailyAverage,
    changePercentage,
    projectedMonthlyTotal,
    willExceedBudget,
    daysUntilBudgetExceeded,
  }
}

export interface CategoryAlert {
  category: string
  currentAmount: number
  averageAmount: number
  increasePercentage: number
  message: string
}

/**
 * Detect category alerts
 */
export function detectCategoryAlerts(
  transactions: Transaction[]
): CategoryAlert[] {
  const alerts: CategoryAlert[] = []

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)

  // Get current month expenses by category
  const currentMonthExpenses = transactions.filter(
    (t) =>
      t.type === 'EXPENSE' &&
      new Date(t.date) >= currentMonthStart &&
      new Date(t.date) <= now
  )

  // Get historical expenses (last 3 months) by category
  const historicalExpenses = transactions.filter(
    (t) =>
      t.type === 'EXPENSE' &&
      new Date(t.date) >= threeMonthsAgo &&
      new Date(t.date) < currentMonthStart
  )

  const currentCategoryTotals: Map<string, number> = new Map()
  const historicalCategoryTotals: Map<string, number> = new Map()
  const historicalCategoryCounts: Map<string, number> = new Map()

  currentMonthExpenses.forEach((t) => {
    const category = t.mainCategory || 'OTHER'
    currentCategoryTotals.set(category, (currentCategoryTotals.get(category) || 0) + t.amount)
  })

  historicalExpenses.forEach((t) => {
    const category = t.mainCategory || 'OTHER'
    historicalCategoryTotals.set(
      category,
      (historicalCategoryTotals.get(category) || 0) + t.amount
    )
    historicalCategoryCounts.set(
      category,
      (historicalCategoryCounts.get(category) || 0) + 1
    )
  })

  // Calculate averages and detect alerts
  currentCategoryTotals.forEach((currentAmount, category) => {
    const historicalTotal = historicalCategoryTotals.get(category) || 0
    const historicalCount = historicalCategoryCounts.get(category) || 0
    const averageAmount = historicalCount > 0 ? historicalTotal / historicalCount : 0

    if (averageAmount > 0) {
      const increasePercentage = ((currentAmount - averageAmount) / averageAmount) * 100

      if (increasePercentage > 50) {
        alerts.push({
          category,
          currentAmount,
          averageAmount,
          increasePercentage,
          message: `Your ${category} spending is ${increasePercentage.toFixed(0)}% higher than average`,
        })
      }
    }
  })

  return alerts.sort((a, b) => b.increasePercentage - a.increasePercentage)
}

export interface SavingsOpportunity {
  category: string
  currentAmount: number
  potentialSavings: number
  reductionPercentage: number
  message: string
}

/**
 * Calculate savings opportunities
 */
export function calculateSavingsOpportunities(
  transactions: Transaction[]
): SavingsOpportunity[] {
  const opportunities: SavingsOpportunity[] = []

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const currentMonthExpenses = transactions.filter(
    (t) =>
      t.type === 'EXPENSE' &&
      new Date(t.date) >= currentMonthStart &&
      new Date(t.date) <= now
  )

  const categoryTotals: Map<string, number> = new Map()

  currentMonthExpenses.forEach((t) => {
    const category = t.mainCategory || 'OTHER'
    categoryTotals.set(category, (categoryTotals.get(category) || 0) + t.amount)
  })

  // Focus on WANTS category for savings opportunities
  const wantsTotal = categoryTotals.get('WANTS') || 0
  if (wantsTotal > 0) {
    const reductionPercentages = [10, 20, 30]
    reductionPercentages.forEach((percent) => {
      const potentialSavings = (wantsTotal * percent) / 100
      if (potentialSavings > 100) {
        // Only show if savings would be meaningful (>₱100)
        opportunities.push({
          category: 'WANTS',
          currentAmount: wantsTotal,
          potentialSavings,
          reductionPercentage: percent,
          message: `If you reduce WANTS spending by ${percent}%, you could save ₱${potentialSavings.toLocaleString()}`,
        })
      }
    })
  }

  // Also check top spending categories
  const sortedCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  sortedCategories.forEach(([category, amount]) => {
    if (category !== 'WANTS' && amount > 1000) {
      // Only suggest for categories spending >₱1000
      const reductionPercentages = [15, 25]
      reductionPercentages.forEach((percent) => {
        const potentialSavings = (amount * percent) / 100
        if (potentialSavings > 200) {
          // Only show if savings would be meaningful (>₱200)
          opportunities.push({
            category,
            currentAmount: amount,
            potentialSavings,
            reductionPercentage: percent,
            message: `If you reduce ${category} spending by ${percent}%, you could save ₱${potentialSavings.toLocaleString()}`,
          })
        }
      })
    }
  })

  return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings).slice(0, 3)
}


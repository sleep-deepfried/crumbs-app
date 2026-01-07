import { CreditCard, TrendingUp, TrendingDown, ArrowUp, PhilippinePeso } from 'lucide-react'
import { getResponsiveFontSize } from '@/lib/utils'

interface MetricsGridProps {
  totalSpending: number
  monthlyChange: number
  largestExpense: {
    category: string
    amount: number
  } | null
  totalIncome: number
}

export default function MetricsGrid({
  totalSpending,
  monthlyChange,
  largestExpense,
  totalIncome,
}: MetricsGridProps) {
  const changeColor = monthlyChange > 0 
    ? 'text-[#D9534F]' // Red for increase in spending
    : monthlyChange < 0 
    ? 'text-[#A8D5BA]' // Green for decrease
    : 'text-[#4A3B32]'

  const changeText = monthlyChange > 0
    ? "You're spending more this month than last month!"
    : monthlyChange < 0
    ? "You're spending less this month than last month!"
    : "Your spending is consistent with last month"

  const TrendIcon = monthlyChange >= 0 ? TrendingUp : TrendingDown
  
  // Format currency values
  const formattedSpending = `₱${totalSpending.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formattedIncome = `₱${totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  
  // Get responsive font sizes
  const spendingFontSize = getResponsiveFontSize(formattedSpending)
  const incomeFontSize = getResponsiveFontSize(formattedIncome)

  return (
    <div className="px-4 mb-6">
      <h2 className="section-heading my-4">This Month:</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Total Spending */}
        <div className="card-accent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#E6C288]">Total Spending</span>
            <CreditCard size={20} className="text-[#E6C288]" strokeWidth={2} />
          </div>
          <p className={`${spendingFontSize} font-bold text-white`}>
            {formattedSpending}
          </p>
        </div>

        {/* Monthly Change */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <span className="metric-label">Monthly Change</span>
            <TrendIcon size={20} className={changeColor} strokeWidth={2} />
          </div>
          <p className={`text-3xl font-bold ${changeColor}`}>
            {monthlyChange === 0 ? '0.0%' : `${monthlyChange > 0 ? '+' : ''}${monthlyChange.toFixed(1)}%`}
          </p>
          <p className="text-[10px] text-[#4A3B32]/50 mt-1">
            {changeText}
          </p>
        </div>

        {/* Largest Expense */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <span className="metric-label">Largest Expense</span>
            <ArrowUp size={20} className="text-[#4A3B32]/60" strokeWidth={2} />
          </div>
          {largestExpense ? (
            <>
              <p className="text-2xl font-bold text-[#4A3B32]">
                ₱{largestExpense.amount.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#4A3B32]/50 mt-1">
                {largestExpense.category}
              </p>
            </>
          ) : (
            <p className="text-xl font-bold text-[#4A3B32]/70">—</p>
          )}
        </div>

        {/* Total Income */}
        <div className="card-accent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#E6C288]">Total Income</span>
            <PhilippinePeso size={20} className="text-[#E6C288]" strokeWidth={2} />
          </div>
          <p className={`${incomeFontSize} font-bold text-white`}>
            {formattedIncome}
          </p>
        </div>
      </div>
    </div>
  )
}


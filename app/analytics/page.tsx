import { redirect } from 'next/navigation'
import { getDashboardData, getUserTransactions } from '../actions/user'
import BottomNav from '@/components/BottomNav'
import { TrendingDown, TrendingUp, Lightbulb } from 'lucide-react'

export default async function AnalyticsPage() {
  const data = await getDashboardData()

  if (!data) {
    redirect('/auth/login')
  }

  const { user } = data
  const allTransactions = await getUserTransactions(user.id)

  // Calculate totals
  const totalExpenses = allTransactions
    .filter((t: { type: string }) => t.type === 'EXPENSE')
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
  
  const totalIncome = allTransactions
    .filter((t: { type: string }) => t.type === 'INCOME')
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
  
  const netAmount = totalIncome - totalExpenses

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header Bar */}
      <div className="bg-[#4A3B32] text-white px-4 py-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-xs opacity-80 mt-1">@{user.username}</p>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Income vs Expenses */}
        <div className="card-crumbs mb-6">
          <h2 className="section-heading mb-4">Income vs Expenses</h2>
          
          <div className="space-y-4">
            {/* Income */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#A8D5BA]" strokeWidth={2} />
                  <span className="text-sm font-semibold text-[#4A3B32]">Income</span>
                </div>
                <span className="text-sm font-bold text-[#A8D5BA]">
                  ₱{totalIncome.toLocaleString()}
                </span>
              </div>
              {totalIncome > 0 && (
                <div className="w-full bg-[#FDF6EC] rounded-full h-2">
                  <div
                    className="bg-[#A8D5BA] h-2 rounded-full transition-all"
                    style={{ width: `${totalExpenses > 0 ? Math.min(100, (totalIncome / (totalIncome + totalExpenses)) * 100) : 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Expenses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown size={18} className="text-[#4A3B32]" strokeWidth={2} />
                  <span className="text-sm font-semibold text-[#4A3B32]">Expenses</span>
                </div>
                <span className="text-sm font-bold text-[#4A3B32]">
                  ₱{totalExpenses.toLocaleString()}
                </span>
              </div>
              {totalExpenses > 0 && (
                <div className="w-full bg-[#FDF6EC] rounded-full h-2">
                  <div
                    className="bg-[#4A3B32] h-2 rounded-full transition-all"
                    style={{ width: `${totalIncome > 0 ? Math.min(100, (totalExpenses / (totalIncome + totalExpenses)) * 100) : 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Net */}
            {totalIncome > 0 || totalExpenses > 0 ? (
              <div className="pt-3 border-t border-[#E6C288]/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#4A3B32]">Net</span>
                  <span className={`text-sm font-bold ${netAmount >= 0 ? 'text-[#A8D5BA]' : 'text-[#D9534F]'}`}>
                    {netAmount >= 0 ? '+' : ''}₱{Math.abs(netAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[#4A3B32]/60">No transactions this month</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="metric-card">
            <p className="metric-label mb-2">Transactions</p>
            <p className="text-3xl font-bold text-[#4A3B32]">{allTransactions.length}</p>
            <p className="text-xs text-[#4A3B32]/50 mt-1">This month</p>
          </div>
          <div className="metric-card">
            <p className="metric-label mb-2">Avg per Day</p>
            <p className="text-3xl font-bold text-[#4A3B32]">
              ₱{Math.round(totalExpenses / new Date().getDate()).toLocaleString()}
            </p>
            <p className="text-xs text-[#4A3B32]/50 mt-1">Daily spend</p>
          </div>
        </div>

        {/* Insights */}
        <div className="card-crumbs">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={20} className="text-[#4A3B32]" strokeWidth={2} />
            <h2 className="section-heading">Insights</h2>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-[#4A3B32]">
              • You&apos;re tracking your spending consistently! 🎉
            </p>
            {user.currentStreak >= 7 && (
              <p className="text-sm text-[#4A3B32]">
                • {user.currentStreak} day streak - You&apos;re on fire! 🔥
              </p>
            )}
            {user.totalSaved >= 50000 && (
              <p className="text-sm text-[#4A3B32]">
                • Great savings milestone reached! Keep it up! 💪
              </p>
            )}
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}


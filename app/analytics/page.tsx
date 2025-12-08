import { redirect } from 'next/navigation'
import { getDashboardData, getUserTransactions } from '../actions/user'
import { signout } from '../actions/auth'
import BottomNav from '@/components/BottomNav'
import { Home, ShoppingCart, PiggyBank } from 'lucide-react'

export default async function AnalyticsPage() {
  const data = await getDashboardData()

  if (!data) {
    redirect('/auth/login')
  }

  const { user } = data
  const allTransactions = await getUserTransactions(user.id)

  // Calculate category breakdowns
  const categoryTotals = allTransactions.reduce((acc: { [key: string]: number }, t: { category: string; amount: number; type: string }) => {
    if (t.type === 'EXPENSE') {
      acc[t.category] = (acc[t.category] || 0) + t.amount
    }
    return acc
  }, {})

  const totalExpenses = Object.values(categoryTotals).reduce((a: number, b: number) => a + b, 0) as number

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header Bar */}
      <div className="bg-[#4A3B32] text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          <p className="text-xs opacity-80">@{user.username}</p>
        </div>
        <form action={signout}>
          <button
            type="submit"
            className="text-xs px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Spending Breakdown */}
        <div className="card-crumbs mb-6">
          <h2 className="text-lg font-bold text-[#4A3B32] mb-4">Spending Breakdown</h2>
          
          {totalExpenses === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#4A3B32]/60">No expenses this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryTotals).map(([category, amount]) => {
                const percentage = ((amount as number) / totalExpenses) * 100
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {category === 'NEEDS' && <Home size={18} className="text-[#4A3B32]" strokeWidth={2} />}
                        {category === 'WANTS' && <ShoppingCart size={18} className="text-[#4A3B32]" strokeWidth={2} />}
                        {category === 'SAVINGS' && <PiggyBank size={18} className="text-[#A8D5BA]" strokeWidth={2} />}
                        <span className="text-sm font-semibold text-[#4A3B32]">{category}</span>
                      </div>
                      <span className="text-sm font-bold text-[#4A3B32]">
                        ₱{(amount as number).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-[#FDF6EC] rounded-full h-2">
                      <div
                        className="bg-[#4A3B32] h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#4A3B32]/60 mt-1">{percentage.toFixed(1)}% of total</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card-crumbs">
            <p className="text-xs text-[#4A3B32]/60 mb-1">Transactions</p>
            <p className="text-3xl font-bold text-[#4A3B32]">{allTransactions.length}</p>
            <p className="text-xs text-[#4A3B32]/60 mt-1">This month</p>
          </div>
          <div className="card-crumbs">
            <p className="text-xs text-[#4A3B32]/60 mb-1">Avg per Day</p>
            <p className="text-3xl font-bold text-[#4A3B32]">
              ₱{Math.round(totalExpenses / new Date().getDate()).toLocaleString()}
            </p>
            <p className="text-xs text-[#4A3B32]/60 mt-1">Daily spend</p>
          </div>
        </div>

        {/* Insights */}
        <div className="card-crumbs">
          <h2 className="text-lg font-bold text-[#4A3B32] mb-3">💡 Insights</h2>
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
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}


import { redirect } from 'next/navigation'
import { getDashboardData } from './actions/user'
import { signout } from './actions/auth'
import Countertop from '@/components/Countertop'
import MascotStage from '@/components/MascotStage'
import StreakBoard from '@/components/StreakBoard'
import FinancialCards from '@/components/FinancialCards'
import CommunityTable from '@/components/CommunityTable'
import BottomNav from '@/components/BottomNav'
import QuickFinancialBanner from '@/components/QuickFinancialBanner'
import Link from 'next/link'

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    redirect('/auth/login')
  }

  const { user, safeToSpend, friends } = data

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header Bar */}
      <div className="bg-[#4A3B32] text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">CRUMBS</h1>
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

      {/* Quick Financial Summary */}
      <QuickFinancialBanner
        safeToSpend={safeToSpend}
        totalSaved={user.totalSaved}
        spendingLimit={user.spendingLimit}
      />

      {/* Main Content - Single Column Vertical Stack */}
      <div className="max-w-md mx-auto">
        {/* The Countertop - Header with wood texture */}
        <Countertop>
          {/* Mascot Stage */}
          <MascotStage mood={user.crumbMood} brewLevel={user.brewLevel} />

          {/* Streak Board */}
          <div className="mt-4">
            <StreakBoard streak={user.currentStreak} />
          </div>
        </Countertop>

        {/* Financial Menu Cards */}
        <div className="mt-6">
          <FinancialCards
            safeToSpend={safeToSpend}
            totalSaved={user.totalSaved}
            spendingLimit={user.spendingLimit}
          />
        </div>

        {/* Community Table - Friends */}
        <div className="mt-6">
          <CommunityTable friends={friends} />
        </div>

        {/* Recent Transactions */}
        <div className="mt-6 px-4">
          <h3 className="text-sm font-semibold text-[#4A3B32] mb-3">Recent Activity</h3>
          {data.recentTransactions.length === 0 ? (
            <div className="card-crumbs text-center py-8">
              <div className="text-5xl mb-3 animate-bounce">🥐</div>
              <p className="text-sm font-semibold text-[#4A3B32] mb-2">
                Ready for your first crumb?
              </p>
              <p className="text-xs text-[#4A3B32]/60 mb-4">
                Track your spending to keep BUN happy!
              </p>
              <Link
                href="/add"
                className="inline-block bg-[#4A3B32] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#4A3B32]/90 active:scale-95 transition-all shadow-lg"
              >
                ✨ Add First Transaction
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentTransactions.map((transaction: { id: string; type: string; category: string; description: string | null; date: Date; amount: number }) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-xl p-3 border border-[#E6C288] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'INCOME'
                          ? 'bg-[#A8D5BA]/20'
                          : 'bg-[#E6C288]/20'
                      }`}
                    >
                      <span className="text-lg">
                        {transaction.category === 'NEEDS' && '🏠'}
                        {transaction.category === 'WANTS' && '🎮'}
                        {transaction.category === 'SAVINGS' && '💰'}
                        {transaction.category === 'INCOME' && '💵'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#4A3B32]">
                        {transaction.category}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-[#4A3B32]/60">
                          {transaction.description}
                        </p>
                      )}
                      <p className="text-[10px] text-[#4A3B32]/40">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === 'INCOME'
                        ? 'text-[#A8D5BA]'
                        : 'text-[#4A3B32]'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}₱
                    {transaction.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing for nav */}
        <div className="h-8" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

import CommunityTable from "@/components/CommunityTable";
import MetricsGrid from "@/components/MetricsGrid";
import RecurringTransactionsList from "@/components/RecurringTransactionsList";
import DashboardHeader from "@/components/DashboardHeader";
import QuickFinancialBanner from "@/components/QuickFinancialBanner";
import RecentTransactionsList from "@/components/RecentTransactionsList";
import { useState } from "react";
import { X } from "lucide-react";

interface DashboardViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onTabChange: (tab: string) => void;
}

export default function DashboardView({
  data,
  onTabChange,
}: DashboardViewProps) {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  const {
    user,
    monthlyExpenses,
    monthlyIncome,
    friends,
    recentTransactions,
    recurringTransactions,
    lastMonthExpenses,
    largestExpense,
  } = data;

  // Calculate monthly change
  const monthlyChange =
    lastMonthExpenses > 0
      ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : monthlyExpenses > 0
      ? 100
      : 0;

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header */}
      <DashboardHeader username={user.username} />

      {/* Main Content */}
      <main id="main-content" className="max-w-md mx-auto px-0 sm:px-4">
        {/* Metrics Grid */}
        <MetricsGrid
          totalSpending={monthlyExpenses}
          monthlyChange={monthlyChange}
          largestExpense={largestExpense}
          totalIncome={monthlyIncome}
        />

        {/* Quick Financial Banner */}
        <section className="mt-4 px-4">
          <QuickFinancialBanner
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            spendingLimit={user.spendingLimit}
            transactions={recentTransactions}
          />
        </section>

        {/* Recent Transactions */}
        <section
          className="mt-6 px-4"
          aria-labelledby="recent-transactions-heading"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 id="recent-transactions-heading" className="section-heading">
              Recent Transactions
            </h3>
            <button
              onClick={() => setShowAllTransactions(true)}
              className="text-xs text-[#4A3B32]/60 hover:text-[#4A3B32]"
              aria-label="View all transactions"
            >
              View All
            </button>
          </div>
          <RecentTransactionsList transactions={recentTransactions} />
        </section>

        {/* Recurring Transactions Section */}
        <section
          className="mt-6 px-4"
          aria-labelledby="recurring-transactions-heading"
        >
          <h3
            id="recurring-transactions-heading"
            className="section-heading mb-3"
          >
            Recurring Transactions
          </h3>
          {recurringTransactions.length === 0 ? (
            <div className="card-crumbs text-center py-6">
              <p className="text-sm text-[#4A3B32]/60">
                No recurring transactions yet
              </p>
              <p className="text-xs text-[#4A3B32]/70 mt-1">
                Set up recurring expenses to track subscriptions
              </p>
            </div>
          ) : (
            <div className="card-crumbs p-6">
              <RecurringTransactionsList
                transactions={recurringTransactions}
                userId={user.id}
              />
            </div>
          )}
        </section>

        {/* Community Table - Friends */}
        <section className="mt-6" aria-labelledby="community-heading">
          <CommunityTable friends={friends} />
        </section>

        {/* Bottom spacing for nav */}
        <div className="h-8" />
      </main>

      {/* All Transactions Modal */}
      {showAllTransactions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowAllTransactions(false)}
        >
          <div
            className="bg-white w-full max-w-md max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-[#E6C288]/30 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#4A3B32]">All Transactions</h2>
              <button
                onClick={() => setShowAllTransactions(false)}
                className="p-1 hover:bg-[#E6C288]/20 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-[#4A3B32]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4 bg-[#FDF6EC]">
              <RecentTransactionsList transactions={data.allTransactions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

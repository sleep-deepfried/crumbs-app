import { formatCurrency } from "@/lib/utils";
import {
  TrendingDown,
  DollarSign,
  PartyPopper,
  AlertTriangle,
} from "lucide-react";
import { Transaction } from "@/types";

interface QuickFinancialBannerProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  spendingLimit?: number;
  transactions: Transaction[];
}

export default function QuickFinancialBanner({
  monthlyIncome,
  monthlyExpenses,
  spendingLimit,
  transactions,
}: QuickFinancialBannerProps) {
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const currentDay = now.getDate();
  const daysRemaining = daysInMonth - currentDay;

  // Calculate daily budget
  const income = monthlyIncome || spendingLimit || 0;
  const remaining = income - monthlyExpenses;
  const dailyBudget = daysRemaining > 0 ? remaining / daysRemaining : 0;

  // Get today's spending
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySpending = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      tDate.setHours(0, 0, 0, 0);
      return t.type === "EXPENSE" && tDate.getTime() === today.getTime();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate status
  const percentSpent = income > 0 ? (monthlyExpenses / income) * 100 : 0;
  const isOnTrack = percentSpent <= (currentDay / daysInMonth) * 100;

  return (
    <div className="card-crumbs p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Daily Budget */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign size={14} className="text-[#4A3B32]/60" />
            <p className="text-xs text-[#4A3B32]/60 font-semibold">
              Daily Budget
            </p>
          </div>
          <p className="text-xl font-bold text-[#4A3B32]">
            {formatCurrency(dailyBudget)}
          </p>
          <p className="text-xs text-[#4A3B32]/50 mt-1">
            {daysRemaining} days left
          </p>
        </div>

        {/* Today's Spending */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown size={14} className="text-[#4A3B32]/60" />
            <p className="text-xs text-[#4A3B32]/60 font-semibold">Today</p>
          </div>
          <p
            className={`text-xl font-bold ${
              todaySpending > dailyBudget ? "text-[#C74444]" : "text-[#4A7C59]"
            }`}
          >
            {formatCurrency(todaySpending)}
          </p>
          <p className="text-xs text-[#4A3B32]/50 mt-1">
            {todaySpending > dailyBudget ? "⚠️ Over budget" : "✓ On track"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-[#E6C288]/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#4A3B32]/60 font-semibold">
            Monthly Budget
          </span>
          <span
            className={`text-xs font-bold ${
              isOnTrack ? "text-[#4A7C59]" : "text-[#C74444]"
            }`}
          >
            {percentSpent.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-[#FDF6EC] rounded-full overflow-hidden border border-[#E6C288]/30">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentSpent > 90
                ? "bg-[#C74444]"
                : percentSpent > 70
                ? "bg-[#E6C288]"
                : "bg-[#4A7C59]"
            }`}
            style={{ width: `${Math.min(100, percentSpent)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#4A3B32]/50">
            {formatCurrency(monthlyExpenses)} spent
          </span>
          <span className="text-xs text-[#4A3B32]/50">
            {formatCurrency(remaining)} left
          </span>
        </div>
      </div>

      {/* Status Message */}
      <div
        className={`mt-3 px-3 py-2 rounded-lg text-center ${
          isOnTrack
            ? "bg-[#4A7C59]/10 text-[#4A7C59]"
            : "bg-[#C74444]/10 text-[#C74444]"
        }`}
      >
        <p className="text-xs font-semibold flex items-center justify-center gap-1">
          {isOnTrack ? (
            <>
              <PartyPopper size={14} /> You&apos;re on track! Keep up the great
              work
            </>
          ) : (
            <>
              <AlertTriangle size={14} /> Spending faster than planned, consider
              slowing down
            </>
          )}
        </p>
      </div>
    </div>
  );
}

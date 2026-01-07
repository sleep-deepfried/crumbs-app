"use client";

import { RecurringTransaction } from "@/types";
import { RefreshCw, TrendingDown } from "lucide-react";

interface RecurringTransactionsSummaryProps {
  recurringTransactions: RecurringTransaction[];
}

export default function RecurringTransactionsSummary({
  recurringTransactions,
}: RecurringTransactionsSummaryProps) {
  // Filter only active recurring expenses
  // Handle date conversion (dates come as ISO strings from API)
  const activeExpenses = recurringTransactions.filter((rt) => {
    // Convert ISO string dates to Date objects if needed
    const startDate =
      typeof rt.startDate === "string" ? new Date(rt.startDate) : rt.startDate;
    const endDate = rt.endDate
      ? typeof rt.endDate === "string"
        ? new Date(rt.endDate)
        : rt.endDate
      : null;

    // Check if recurring transaction is still active
    const now = new Date();
    const isActive =
      rt.isActive && startDate <= now && (!endDate || endDate >= now);

    return rt.type === "EXPENSE" && isActive;
  });

  if (activeExpenses.length === 0) {
    return null;
  }

  // Calculate monthly total
  const monthlyTotal = activeExpenses.reduce((sum, rt) => {
    // Convert to monthly equivalent
    let monthlyAmount = rt.amount;
    if (rt.frequency === "DAILY") {
      monthlyAmount = rt.amount * 30;
    } else if (rt.frequency === "WEEKLY") {
      monthlyAmount = rt.amount * 4.33; // Average weeks per month
    } else if (rt.frequency === "YEARLY") {
      monthlyAmount = rt.amount / 12;
    }
    // MONTHLY is already monthly
    return sum + monthlyAmount;
  }, 0);

  // Group by category
  const categoryTotals: Map<string, number> = new Map();
  activeExpenses.forEach((rt) => {
    const category = rt.mainCategory || "OTHER";
    let monthlyAmount = rt.amount;
    if (rt.frequency === "DAILY") {
      monthlyAmount = rt.amount * 30;
    } else if (rt.frequency === "WEEKLY") {
      monthlyAmount = rt.amount * 4.33;
    } else if (rt.frequency === "YEARLY") {
      monthlyAmount = rt.amount / 12;
    }
    categoryTotals.set(
      category,
      (categoryTotals.get(category) || 0) + monthlyAmount
    );
  });

  const topCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="card-crumbs mb-6">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw size={20} className="text-[#4A3B32]" strokeWidth={2} />
        <h2 className="section-heading">Recurring Expenses</h2>
      </div>

      {/* Total Monthly */}
      <div className="mb-4 p-4 bg-[#E6C288]/10 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#4A3B32]/60 mb-1">Monthly Total</p>
            <p className="text-2xl font-bold text-[#4A3B32]">
              ₱
              {monthlyTotal.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#4A3B32]/60 mb-1">Active</p>
            <p className="text-lg font-bold text-[#4A3B32]">
              {activeExpenses.length}
            </p>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#4A3B32]/70 mb-2">
            Top Categories
          </p>
          {topCategories.map(([category, amount]) => (
            <div
              key={category}
              className="flex items-center justify-between p-2 bg-white rounded-lg"
            >
              <div className="flex items-center gap-2">
                <TrendingDown size={14} className="text-[#4A3B32]/60" />
                <span className="text-sm text-[#4A3B32]">{category}</span>
              </div>
              <span className="text-sm font-semibold text-[#4A3B32]">
                ₱{amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Active Recurring Transactions List */}
      <div className="mt-4 pt-4 border-t border-[#E6C288]/30">
        <p className="text-xs font-semibold text-[#4A3B32]/70 mb-2">
          Active Subscriptions
        </p>
        <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
          {activeExpenses.slice(0, 5).map((rt) => {
            let monthlyAmount = rt.amount;
            if (rt.frequency === "DAILY") {
              monthlyAmount = rt.amount * 30;
            } else if (rt.frequency === "WEEKLY") {
              monthlyAmount = rt.amount * 4.33;
            } else if (rt.frequency === "YEARLY") {
              monthlyAmount = rt.amount / 12;
            }

            return (
              <div
                key={rt.id}
                className="flex items-center justify-between p-2 bg-white rounded-lg text-xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[#4A3B32] font-medium truncate">
                    {rt.description || rt.subcategory || "Recurring Expense"}
                  </p>
                  <p className="text-[#4A3B32]/60 text-[10px]">
                    {rt.frequency} • {rt.mainCategory || "OTHER"}
                  </p>
                </div>
                <span className="text-[#4A3B32] font-semibold ml-2">
                  ₱
                  {monthlyAmount.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            );
          })}
        </div>
        {activeExpenses.length > 5 && (
          <p className="text-xs text-[#4A3B32]/50 mt-2 text-center">
            +{activeExpenses.length - 5} more
          </p>
        )}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getDashboardData } from "./actions/user";
import { Transaction } from "@/types";
import CommunityTable from "@/components/CommunityTable";
import BottomNav from "@/components/BottomNav";
import MetricsGrid from "@/components/MetricsGrid";
import RecurringTransactionsList from "@/components/RecurringTransactionsList";
import Link from "next/link";
import {
  HelpCircle,
  Bell,
  Home,
  ShoppingCart,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/auth/login");
  }

  const {
    user,
    monthlyExpenses,
    monthlyIncome,
    friends,
    recentTransactions,
    recurringTransactions,
  } = data;

  // Calculate monthly change (mock for now - you can add actual last month data later)
  const lastMonthExpenses = 0; // TODO: Implement last month calculation
  const monthlyChange =
    lastMonthExpenses > 0
      ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

  // Find largest expense
  const expenseTransactions = recentTransactions.filter(
    (t: { type: string; amount: number; category: string }) =>
      t.type === "EXPENSE"
  );
  let largestExpense: { category: string; amount: number } | null = null;

  if (expenseTransactions.length > 0) {
    let maxAmount = 0;
    let maxCategory = "";

    expenseTransactions.forEach((t: { amount: number; category: string }) => {
      if (t.amount > maxAmount) {
        maxAmount = t.amount;
        maxCategory = t.category;
      }
    });

    largestExpense = { category: maxCategory, amount: maxAmount };
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* New Header */}
      <div className="bg-[#FDF6EC] px-4 py-6 flex items-center justify-between">
        <div>
          <h1 className="greeting-text">Hi {user.username}!</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-[#E6C288]/30">
            <HelpCircle size={24} className="text-[#D9534F]" strokeWidth={2} />
          </button>
          <button className="w-12 h-12 rounded-full bg-[#A8D5BA] flex items-center justify-center shadow-sm hover:shadow-md transition-all">
            <Bell size={24} className="text-white" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {/* Metrics Grid */}
        <MetricsGrid
          totalSpending={monthlyExpenses}
          monthlyChange={monthlyChange}
          largestExpense={largestExpense}
          totalIncome={monthlyIncome}
        />

        {/* Recent Transactions */}
        <div className="mt-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-heading">Recent Transactions</h3>
            <Link
              href="/analytics"
              className="text-xs text-[#4A3B32]/60 hover:text-[#4A3B32]"
            >
              View All
            </Link>
          </div>
          {recentTransactions.length === 0 ? (
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
              {recentTransactions
                .slice(0, 5)
                .map((transaction: Transaction) => {
                  const getCategoryIcon = () => {
                    const categoryToCheck =
                      transaction.type === "EXPENSE"
                        ? transaction.mainCategory
                        : transaction.category;
                    switch (categoryToCheck) {
                      case "NEEDS":
                        return (
                          <Home
                            size={20}
                            className="text-[#4A3B32]"
                            strokeWidth={2}
                          />
                        );
                      case "WANTS":
                        return (
                          <ShoppingCart
                            size={20}
                            className="text-[#4A3B32]"
                            strokeWidth={2}
                          />
                        );
                      case "SAVINGS":
                        return (
                          <TrendingUp
                            size={20}
                            className="text-[#A8D5BA]"
                            strokeWidth={2}
                          />
                        );
                      case "INCOME":
                        return (
                          <DollarSign
                            size={20}
                            className="text-[#A8D5BA]"
                            strokeWidth={2}
                          />
                        );
                      default:
                        return null;
                    }
                  };

                  return (
                    <div
                      key={transaction.id}
                      className="bg-white rounded-xl p-3 border border-[#E6C288]/30 flex items-center justify-between hover:border-[#E6C288] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "INCOME"
                              ? "bg-[#A8D5BA]/20"
                              : "bg-[#E6C288]/20"
                          }`}
                        >
                          {getCategoryIcon()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#4A3B32]">
                            {transaction.type === "EXPENSE" &&
                            transaction.subcategory
                              ? transaction.subcategory
                              : transaction.category.charAt(0) +
                                transaction.category.slice(1).toLowerCase()}
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
                          transaction.type === "INCOME"
                            ? "text-[#A8D5BA]"
                            : "text-[#4A3B32]"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}₱
                        {transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Recurring Transactions Section */}
        <div className="mt-6 px-4">
          <h3 className="section-heading mb-3">Recurring Transactions</h3>
          {recurringTransactions.length === 0 ? (
            <div className="card-crumbs text-center py-6">
              <p className="text-sm text-[#4A3B32]/60">
                No recurring transactions yet
              </p>
              <p className="text-xs text-[#4A3B32]/40 mt-1">
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
        </div>

        {/* Community Table - Friends */}
        <div className="mt-6">
          <CommunityTable friends={friends} />
        </div>

        {/* Bottom spacing for nav */}
        <div className="h-8" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

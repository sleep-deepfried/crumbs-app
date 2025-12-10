import { redirect } from "next/navigation";
import { getDashboardData } from "../actions/user";
import BottomNav from "@/components/BottomNav";
import { DollarSign, TrendingDown, PiggyBank } from "lucide-react";

export default async function WalletPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/auth/login");
  }

  const { user, monthlyExpenses, monthlyIncome } = data;

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header Bar */}
      <div className="bg-[#4A3B32] text-white px-4 py-4">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-xs opacity-80 mt-1">@{user.username}</p>
      </div>

      {/* Main Content */}
      <main id="main-content" className="max-w-md mx-auto px-4 pt-6">
        {/* Monthly Overview Card */}
        <div className="card-crumbs mb-6">
          <h2 className="section-heading mb-4">Monthly Overview</h2>
          <div className="space-y-4">
            {/* Income */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#A8D5BA]/20 rounded-xl flex items-center justify-center">
                  <DollarSign
                    size={24}
                    className="text-[#A8D5BA]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#4A3B32]">Income</p>
                  <p className="text-xs text-[#4A3B32]/60">This month</p>
                </div>
              </div>
              <p className="text-xl font-bold text-[#A8D5BA]">
                ₱{monthlyIncome.toLocaleString()}
              </p>
            </div>

            {/* Expenses */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#E6C288]/20 rounded-xl flex items-center justify-center">
                  <TrendingDown
                    size={24}
                    className="text-[#E6C288]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#4A3B32]">
                    Expenses
                  </p>
                  <p className="text-xs text-[#4A3B32]/60">This month</p>
                </div>
              </div>
              <p className="text-xl font-bold text-[#4A3B32]">
                ₱{monthlyExpenses.toLocaleString()}
              </p>
            </div>

            {/* Savings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#A8D5BA]/20 rounded-xl flex items-center justify-center">
                  <PiggyBank
                    size={24}
                    className="text-[#A8D5BA]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#4A3B32]">
                    Total Saved
                  </p>
                  <p className="text-xs text-[#4A3B32]/60">All time</p>
                </div>
              </div>
              <p className="text-xl font-bold text-[#A8D5BA]">
                ₱{user.totalSaved.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Budget Card */}
        <div className="card-crumbs">
          <h2 className="section-heading mb-4">Budget Settings</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#FDF6EC] rounded-lg">
              <span className="text-sm text-[#4A3B32]">Spending Limit</span>
              <span className="text-sm font-bold text-[#4A3B32]">
                ₱{user.spendingLimit.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FDF6EC] rounded-lg">
              <span className="text-sm text-[#4A3B32]">Monthly Income</span>
              <span className="text-sm font-bold text-[#4A3B32]">
                ₱{monthlyIncome.toLocaleString()}
              </span>
            </div>
          </div>
          <button className="w-full mt-4 bg-[#4A3B32] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#4A3B32]/90 active:scale-95 transition-all shadow-md">
            Edit Budget
          </button>
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

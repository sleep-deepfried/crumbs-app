"use client";

import { useState } from "react";
import { Settings, TrendingUp, AlertCircle, CheckCircle, Home, ShoppingBag, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types";

interface SmartBudgetPlanProps {
  transactions: Transaction[];
  monthlyIncome: number;
  user: {
    username: string;
    spendingLimit?: number;
  };
}

interface BudgetRule {
  needs: number;
  wants: number;
  savings: number;
}

const DEFAULT_RULE: BudgetRule = {
  needs: 50,
  wants: 30,
  savings: 20,
};

export default function SmartBudgetPlan({
  transactions,
  monthlyIncome,
  user,
}: SmartBudgetPlanProps) {
  const [budgetRule, setBudgetRule] = useState<BudgetRule>(DEFAULT_RULE);
  const [showSettings, setShowSettings] = useState(false);
  const [tempRule, setTempRule] = useState<BudgetRule>(DEFAULT_RULE);

  // Calculate current spending by category
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const currentSpending = {
    needs: 0,
    wants: 0,
    savings: 0,
  };

  transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        new Date(t.date) >= monthStart &&
        new Date(t.date) <= now
    )
    .forEach((t) => {
      const category = t.mainCategory;
      if (category === "NEEDS") {
        currentSpending.needs += t.amount;
      } else if (category === "WANTS") {
        currentSpending.wants += t.amount;
      } else if (category === "SAVINGS") {
        currentSpending.savings += t.amount;
      }
    });

  // Calculate recommended amounts based on income
  const income = monthlyIncome || user.spendingLimit || 0;
  const recommended = {
    needs: (income * budgetRule.needs) / 100,
    wants: (income * budgetRule.wants) / 100,
    savings: (income * budgetRule.savings) / 100,
  };

  // Calculate percentages
  const percentages = {
    needs:
      recommended.needs > 0
        ? (currentSpending.needs / recommended.needs) * 100
        : 0,
    wants:
      recommended.wants > 0
        ? (currentSpending.wants / recommended.wants) * 100
        : 0,
    savings:
      recommended.savings > 0
        ? (currentSpending.savings / recommended.savings) * 100
        : 0,
  };

  // Get status color
  const getStatusColor = (percentage: number) => {
    if (percentage <= 80) return "#4A7C59"; // Green
    if (percentage <= 100) return "#E6C288"; // Yellow
    return "#C74444"; // Red
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage <= 80)
      return <CheckCircle size={16} className="text-[#4A7C59]" />;
    if (percentage <= 100)
      return <AlertCircle size={16} className="text-[#E6C288]" />;
    return <AlertCircle size={16} className="text-[#C74444]" />;
  };

  const handleSaveSettings = () => {
    const total = tempRule.needs + tempRule.wants + tempRule.savings;
    if (total === 100) {
      setBudgetRule(tempRule);
      setShowSettings(false);
    } else {
      alert("Total must equal 100%");
    }
  };

  const categories = [
    {
      key: "needs" as keyof BudgetRule,
      label: "Needs",
      icon: Home,
      description: "Rent, groceries, utilities, transport",
      color: "#C74444",
    },
    {
      key: "wants" as keyof BudgetRule,
      label: "Wants",
      icon: ShoppingBag,
      description: "Entertainment, dining out, shopping",
      color: "#6B5B95",
    },
    {
      key: "savings" as keyof BudgetRule,
      label: "Savings",
      icon: PiggyBank,
      description: "Emergency fund, investments",
      color: "#4A7C59",
    },
  ];

  if (income === 0) {
    return (
      <div className="card-crumbs">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={20} className="text-[#4A3B32]" />
          <h2 className="section-heading">Smart Budget Plan</h2>
        </div>
        <p className="text-sm text-[#4A3B32]/60">
          Set your monthly income to get personalized budget recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="card-crumbs mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-[#4A3B32]" />
          <h2 className="section-heading">Smart Budget Plan</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setTempRule(budgetRule);
            setShowSettings(!showSettings);
          }}
          className="text-[#4A3B32] hover:bg-[#E6C288]/20"
        >
          <Settings size={16} />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-[#FDF6EC] rounded-xl border-2 border-[#E6C288]">
          <h3 className="text-sm font-semibold text-[#4A3B32] mb-3">
            Customize Your Budget Rule
          </h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.key} className="flex items-center gap-3">
                <cat.icon size={18} style={{ color: cat.color }} />
                <span className="text-sm font-medium text-[#4A3B32] flex-1">
                  {cat.label}
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tempRule[cat.key]}
                  onChange={(e) =>
                    setTempRule({
                      ...tempRule,
                      [cat.key]: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-16 px-2 py-1 border-2 border-[#E6C288] rounded-lg text-center text-sm font-semibold text-[#4A3B32]"
                />
                <span className="text-sm text-[#4A3B32]">%</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#E6C288]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#4A3B32]/60">Total:</span>
              <span
                className={`text-sm font-bold ${
                  tempRule.needs + tempRule.wants + tempRule.savings === 100
                    ? "text-[#4A7C59]"
                    : "text-[#C74444]"
                }`}
              >
                {tempRule.needs + tempRule.wants + tempRule.savings}%
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveSettings}
                className="flex-1 bg-[#4A7C59] hover:bg-[#4A7C59]/90 text-white"
              >
                Save
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Breakdown */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const current = currentSpending[cat.key];
          const target = recommended[cat.key];
          const percentage = percentages[cat.key];
          const remaining = target - current;

          return (
            <div key={cat.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <cat.icon size={20} style={{ color: cat.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#4A3B32]">
                        {cat.label}
                      </span>
                      <span className="text-xs text-[#4A3B32]/60">
                        ({budgetRule[cat.key]}%)
                      </span>
                    </div>
                    <p className="text-xs text-[#4A3B32]/50">
                      {cat.description}
                    </p>
                  </div>
                </div>
                {getStatusIcon(percentage)}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-3 bg-[#FDF6EC] rounded-full overflow-hidden border border-[#E6C288]/30">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: getStatusColor(percentage),
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4A3B32] font-medium">
                    ₱{current.toLocaleString()} / ₱{target.toLocaleString()}
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: getStatusColor(percentage) }}
                  >
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {remaining > 0 && (
                <p className="text-xs text-[#4A7C59]">
                  ✓ ₱{remaining.toLocaleString()} remaining
                </p>
              )}
              {remaining < 0 && (
                <p className="text-xs text-[#C74444]">
                  ⚠️ Over budget by ₱{Math.abs(remaining).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Insights */}
      <div className="mt-4 pt-4 border-t border-[#E6C288]/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#4A3B32]/60">Monthly Income</span>
          <span className="text-sm font-bold text-[#4A3B32]">
            ₱{income.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#4A3B32]/60">Total Spent</span>
          <span className="text-sm font-bold text-[#4A3B32]">
            ₱
            {(
              currentSpending.needs +
              currentSpending.wants +
              currentSpending.savings
            ).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#4A3B32]/60">Remaining</span>
          <span
            className={`text-sm font-bold ${
              income -
                (currentSpending.needs +
                  currentSpending.wants +
                  currentSpending.savings) >=
              0
                ? "text-[#4A7C59]"
                : "text-[#C74444]"
            }`}
          >
            ₱
            {(
              income -
              (currentSpending.needs +
                currentSpending.wants +
                currentSpending.savings)
            ).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

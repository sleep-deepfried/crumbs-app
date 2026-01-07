"use client"

import { useState, useEffect } from "react"
import { Lightbulb, Loader2, AlertCircle } from "lucide-react"
import { Transaction } from "@/types"
import { calculateBudgetProgress } from "@/lib/analyticsHelpers"

interface AIInsight {
  type: "positive" | "warning" | "info"
  message: string
  emoji?: string
}

interface AIInsightsProps {
  transactions: Transaction[]
  user: {
    spendingLimit?: number
    totalSaved?: number
  }
}

export default function AIInsights({ transactions, user }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInsights() {
      if (transactions.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/ai-insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactions,
            user,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch insights")
        }

        const data = await response.json()
        setInsights(data.insights || [])
      } catch (err) {
        console.error("Error fetching AI insights:", err)
        setError("Unable to generate insights at this time")
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [transactions, user])

  if (transactions.length === 0) {
    return null
  }

  // Calculate budget progress
  const budgetProgress = user.spendingLimit
    ? calculateBudgetProgress(transactions, user.spendingLimit)
    : null

  if (loading) {
    return (
      <div className="card-crumbs">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={20} className="text-[#4A3B32]" strokeWidth={2} />
          <h2 className="section-heading">AI Insights</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#4A3B32] animate-spin" />
          <span className="ml-2 text-sm text-[#4A3B32]/60">
            Analyzing your spending...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-crumbs">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={20} className="text-[#4A3B32]" strokeWidth={2} />
          <h2 className="section-heading">AI Insights</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#4A3B32]/60">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (insights.length === 0) {
    return null
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-[#4A7C59]"
      case "warning":
        return "text-[#C74444]"
      default:
        return "text-[#4A3B32]"
    }
  }

  return (
    <div className="card-crumbs">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={20} className="text-[#4A3B32]" strokeWidth={2} />
        <h2 className="section-heading">AI Insights</h2>
      </div>

      {/* Budget Progress Bar */}
      {budgetProgress && (
        <div className="mb-4 p-3 bg-[#E6C288]/10 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#4A3B32]">Budget Progress</span>
            <span
              className={`text-xs font-bold ${
                budgetProgress.percentage >= 90
                  ? "text-[#C74444]"
                  : budgetProgress.percentage >= 70
                  ? "text-[#E6C288]"
                  : "text-[#4A7C59]"
              }`}
            >
              {budgetProgress.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#E6C288]/20 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${
                budgetProgress.percentage >= 90
                  ? "bg-[#C74444]"
                  : budgetProgress.percentage >= 70
                  ? "bg-[#E6C288]"
                  : "bg-[#4A7C59]"
              }`}
              style={{ width: `${Math.min(100, budgetProgress.percentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#4A3B32]/60">
            <span>
              ₱{budgetProgress.currentSpending.toLocaleString()} / ₱
              {budgetProgress.spendingLimit.toLocaleString()}
            </span>
            <span>
              {budgetProgress.remaining > 0
                ? `₱${budgetProgress.remaining.toLocaleString()} remaining`
                : "Budget exceeded"}
            </span>
          </div>
          {budgetProgress.willExceed && (
            <p className="text-xs text-[#C74444] mt-2 font-semibold">
              ⚠️ Projected to exceed budget by ₱
              {(budgetProgress.projectedSpending - budgetProgress.spendingLimit).toLocaleString()}
            </p>
          )}
          {budgetProgress.daysUntilLimit !== null && budgetProgress.daysUntilLimit <= 7 && (
            <p className="text-xs text-[#C74444] mt-1">
              ⚠️ At current rate, budget will be exceeded in {budgetProgress.daysUntilLimit} days
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 text-sm ${getInsightColor(insight.type)}`}
          >
            <span className="text-base">{insight.emoji || "💡"}</span>
            <p className="flex-1">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}


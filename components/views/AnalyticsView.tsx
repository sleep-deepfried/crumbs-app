"use client"

import { useState, useMemo } from 'react'
import { Lightbulb, ChevronDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SpendingTrendsChart from '@/components/charts/SpendingTrendsChart'
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart'
import MonthlyComparisonChart from '@/components/charts/MonthlyComparisonChart'
import SpendingByDayChart from '@/components/charts/SpendingByDayChart'
import AIInsights from '@/components/AIInsights'
import RecurringTransactionsSummary from '@/components/RecurringTransactionsSummary'
import {
  getSpendingTrends,
  getCategoryBreakdown,
  calculateInsights,
  detectUnusualSpending,
  getMonthlyComparison,
  getSpendingByDayOfWeek,
  detectCategoryAlerts,
  calculateSavingsOpportunities,
} from '@/lib/analyticsHelpers'
import { Transaction, RecurringTransaction } from '@/types'

interface AnalyticsViewProps {
  data: {
    user: {
      username: string
      spendingLimit?: number
      totalSaved?: number
      currentStreak?: number
    }
    allTransactions: Transaction[]
    recurringTransactions?: RecurringTransaction[]
  }
}

export default function AnalyticsView({ data }: AnalyticsViewProps) {
  const { user, allTransactions, recurringTransactions = [] } = data

  // Date range state
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'all'>('month')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear())


  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const now = new Date()
    
    if (selectedPeriod === 'month') {
      const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      return { startDate: start, endDate: end > now ? now : end }
    } else {
      // All time - get earliest transaction date or 6 months ago
      const earliestDate = allTransactions.length > 0
        ? new Date(Math.min(...allTransactions.map((t: Transaction) => new Date(t.date).getTime())))
        : new Date(now.getFullYear(), now.getMonth() - 6, 1)
      return { startDate: earliestDate, endDate: now }
    }
  }, [selectedPeriod, selectedDate, allTransactions])

  // Filter transactions for selected period
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t: Transaction) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }, [allTransactions, startDate, endDate])

  // Get chart data
  const spendingTrends = getSpendingTrends(filteredTransactions, startDate, endDate)
  const categoryBreakdown = getCategoryBreakdown(filteredTransactions, selectedPeriod)
  const monthlyComparison = getMonthlyComparison(allTransactions)
  const spendingByDay = getSpendingByDayOfWeek(allTransactions)
  const ruleBasedInsights = calculateInsights(allTransactions, user)
  const unusualSpending = detectUnusualSpending(allTransactions)
  const categoryAlerts = detectCategoryAlerts(allTransactions)
  const savingsOpportunities = calculateSavingsOpportunities(allTransactions)

  // Format selected date for display
  const selectedDateLabel = selectedPeriod === 'all' 
    ? 'All Time'
    : selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header Bar */}
      <div className="bg-[#4A3B32] text-white px-4 py-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-xs opacity-80 mt-1">@{user.username}</p>
      </div>

      {/* Main Content */}
      <main id="main-content" className="max-w-md mx-auto px-4 pt-6">
        {/* Period Selector with Calendar */}
        <div className="mb-6 relative">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (!showCalendar) {
                  setCalendarYear(selectedDate.getFullYear())
                }
                setShowCalendar(!showCalendar)
              }}
              variant="outline"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-[#E6C288] bg-white text-[#4A3B32] font-semibold flex items-center justify-between hover:border-[#4A3B32] transition-colors"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} />
                <span>{selectedDateLabel}</span>
              </div>
              <ChevronDown 
                size={20} 
                className={`transition-transform ${showCalendar ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>

          {/* Calendar Popup */}
          {showCalendar && (
            <>
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setShowCalendar(false)}
              />
              <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border-2 border-[#E6C288] overflow-hidden w-full">
                {/* All Time Option */}
                <button
                  onClick={() => {
                    setSelectedPeriod('all')
                    setShowCalendar(false)
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-[#FDF6EC] transition-colors border-b border-[#E6C288]/30 ${
                    selectedPeriod === 'all' ? 'bg-[#E6C288]/20 font-semibold' : ''
                  }`}
                >
                  <span className="text-sm text-[#4A3B32]">All Time</span>
                </button>

                {/* Month Grid Picker */}
                <div className="p-4">
                  {/* Year Navigation */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => setCalendarYear(calendarYear - 1)}
                      className="p-1 hover:bg-[#E6C288]/20 rounded transition-colors"
                      aria-label="Previous year"
                    >
                      <ChevronLeft size={20} className="text-[#4A3B32]" />
                    </button>
                    <h3 className="text-lg font-bold text-[#4A3B32] min-w-[80px] text-center">
                      {calendarYear}
                    </h3>
                    <button
                      onClick={() => setCalendarYear(calendarYear + 1)}
                      className="p-1 hover:bg-[#E6C288]/20 rounded transition-colors"
                      disabled={calendarYear >= new Date().getFullYear()}
                      aria-label="Next year"
                    >
                      <ChevronRight 
                        size={20} 
                        className={`${calendarYear >= new Date().getFullYear() ? 'text-[#4A3B32]/30' : 'text-[#4A3B32]'}`}
                      />
                    </button>
                  </div>

                  {/* Month Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ].map((month, index) => {
                      const isSelected = 
                        selectedPeriod === 'month' &&
                        selectedDate.getMonth() === index &&
                        selectedDate.getFullYear() === calendarYear
                      
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            const newDate = new Date(calendarYear, index, 1)
                            setSelectedDate(newDate)
                            setSelectedPeriod('month')
                            setShowCalendar(false)
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-[#4A7C59] text-white'
                              : 'bg-white text-[#4A3B32] hover:bg-[#E6C288]/20 border border-[#E6C288]/30'
                          }`}
                        >
                          {month}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Category Breakdown Chart */}
        <div className="card-crumbs mb-6">
          <h2 className="section-heading mb-4">Category Breakdown</h2>
          <CategoryBreakdownChart data={categoryBreakdown} />
        </div>

        {/* Monthly Comparison Chart */}
        <div className="card-crumbs mb-6">
          <h2 className="section-heading mb-4">Monthly Comparison</h2>
          <MonthlyComparisonChart data={monthlyComparison} />
        </div>

        {/* Spending by Day of Week Chart */}
        <div className="card-crumbs mb-6">
          <h2 className="section-heading mb-4">Spending by Day of Week</h2>
          <SpendingByDayChart data={spendingByDay} />
        </div>

        {/* Spending Trends Chart */}
        <div className="card-crumbs mb-6">
          <h2 className="section-heading mb-4">Spending Trends</h2>
          <SpendingTrendsChart data={spendingTrends} />
        </div>

        {/* Recurring Transactions Summary */}
        {recurringTransactions.length > 0 && (
          <RecurringTransactionsSummary recurringTransactions={recurringTransactions} />
        )}

        {/* AI Insights */}
        <AIInsights transactions={allTransactions} user={user} />

        {/* Rule-Based Insights */}
        {(ruleBasedInsights.length > 0 || 
          unusualSpending.length > 0 || 
          categoryAlerts.length > 0 || 
          savingsOpportunities.length > 0) && (
          <div className="card-crumbs">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={20} className="text-[#4A3B32]" strokeWidth={2} />
              <h2 className="section-heading">Insights</h2>
            </div>
            <div className="space-y-2">
              {ruleBasedInsights.map((insight, index) => (
                <p
                  key={`rule-${index}`}
                  className={`text-sm ${
                    insight.type === 'positive'
                      ? 'text-[#4A7C59]'
                      : insight.type === 'warning'
                      ? 'text-[#C74444]'
                      : 'text-[#4A3B32]'
                  }`}
                >
                  {insight.emoji && <span className="mr-1">{insight.emoji}</span>}
                  {insight.message}
                </p>
              ))}
              {unusualSpending.map((insight, index) => (
                <p
                  key={`unusual-${index}`}
                  className="text-sm text-[#C74444]"
                >
                  {insight.emoji && <span className="mr-1">{insight.emoji}</span>}
                  {insight.message}
                </p>
              ))}
              {categoryAlerts.map((alert, index) => (
                <p
                  key={`category-alert-${index}`}
                  className="text-sm text-[#C74444]"
                >
                  ⚠️ {alert.message}
                </p>
              ))}
              {savingsOpportunities.map((opportunity, index) => (
                <p
                  key={`savings-${index}`}
                  className="text-sm text-[#4A7C59]"
                >
                  💰 {opportunity.message}
                </p>
              ))}
              {user.currentStreak && user.currentStreak >= 7 && (
                <p className="text-sm text-[#4A3B32]">
                  • {user.currentStreak} day streak - You&apos;re on fire! 🔥
                </p>
              )}
              {user.totalSaved && user.totalSaved >= 50000 && (
                <p className="text-sm text-[#4A3B32]">
                  • Great savings milestone reached! Keep it up! 💪
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-8" />
      </main>
    </div>
  )
}

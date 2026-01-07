"use client"

import { Account } from '@/types'
import { CreditCard, AlertCircle, Award } from 'lucide-react'
import { calculateCreditSummary, getUtilizationColor, getUtilizationLabel } from '@/lib/creditHelpers'

interface CreditCardsSummaryProps {
  accounts: Account[]
}

export default function CreditCardsSummary({ accounts }: CreditCardsSummaryProps) {
  const creditCards = accounts.filter(a => a.type === 'CREDIT_CARD')
  
  if (creditCards.length === 0) return null
  
  const summary = calculateCreditSummary(accounts)
  const utilizationColor = getUtilizationColor(summary.overallUtilization)
  
  return (
    <div className="card-crumbs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-[#4A6FA5]" strokeWidth={2} />
          <h2 className="section-heading">Credit Cards</h2>
        </div>
        <span className="text-xs bg-[#4A6FA5]/10 px-2 py-1 rounded-full text-[#4A6FA5] font-medium">
          {creditCards.length} {creditCards.length === 1 ? 'card' : 'cards'}
        </span>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total Debt */}
        <div className="bg-white rounded-xl p-3 border border-[#E6C288]/30">
          <p className="text-xs text-[#4A3B32]/60 mb-1">Total Balance</p>
          <p className="text-lg font-bold text-[#C74444]">
            ₱{summary.totalDebt.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        {/* Available Credit */}
        <div className="bg-white rounded-xl p-3 border border-[#E6C288]/30">
          <p className="text-xs text-[#4A3B32]/60 mb-1">Available</p>
          <p className="text-lg font-bold text-[#4A7C59]">
            ₱{(summary.totalLimit - summary.totalDebt).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      
      {/* Utilization Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#4A3B32]/70">Credit Utilization</p>
          <span className="text-sm font-bold" style={{ color: utilizationColor }}>
            {summary.overallUtilization}%
          </span>
        </div>
        <div className="w-full h-3 bg-[#E6C288]/20 rounded-full overflow-hidden mb-1">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${summary.overallUtilization}%`,
              backgroundColor: utilizationColor
            }}
          />
        </div>
        <p className="text-[10px] text-[#4A3B32]/60">
          {getUtilizationLabel(summary.overallUtilization)}
        </p>
      </div>
      
      {/* Upcoming Payments */}
      {summary.upcomingPayments.length > 0 && (
        <div className="bg-[#E6C288]/10 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle size={14} className="text-[#4A3B32]" />
            <p className="text-xs font-semibold text-[#4A3B32]">Upcoming Payments</p>
          </div>
          <div className="space-y-2">
            {summary.upcomingPayments.slice(0, 3).map(payment => (
              <div key={payment.accountId} className="flex items-center justify-between text-xs">
                <span className="text-[#4A3B32]/70">{payment.accountName}</span>
                <div className="text-right">
                  <p className="font-semibold text-[#4A3B32]">
                    ₱{payment.amount.toLocaleString('en-PH')}
                  </p>
                  <p className="text-[10px] text-[#4A3B32]/60">
                    in {payment.daysUntil} {payment.daysUntil === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Rewards Summary */}
      {(summary.totalRewards.cashback > 0 || summary.totalRewards.points > 0 || summary.totalRewards.miles > 0) && (
        <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[#E6C288]/30">
          <Award size={16} className="text-[#E6C288]" />
          <div className="flex-1 flex items-center gap-3 text-xs">
            {summary.totalRewards.cashback > 0 && (
              <div>
                <p className="text-[#4A3B32]/60">Cashback</p>
                <p className="font-bold text-[#4A3B32]">₱{summary.totalRewards.cashback.toLocaleString()}</p>
              </div>
            )}
            {summary.totalRewards.points > 0 && (
              <div>
                <p className="text-[#4A3B32]/60">Points</p>
                <p className="font-bold text-[#4A3B32]">{summary.totalRewards.points.toLocaleString()}</p>
              </div>
            )}
            {summary.totalRewards.miles > 0 && (
              <div>
                <p className="text-[#4A3B32]/60">Miles</p>
                <p className="font-bold text-[#4A3B32]">{summary.totalRewards.miles.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


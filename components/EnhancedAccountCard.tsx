"use client"

import { Account } from "@/types"
import { Building2, Wallet, CreditCard, Edit, Trash2, Target } from "lucide-react"
import { calculateGoalProgress, getGoalStatusColor, getGoalMotivationalMessage } from "@/lib/goalHelpers"
import { calculateCreditMetrics, getUtilizationColor } from "@/lib/creditHelpers"
import { useState, useRef, TouchEvent } from "react"

interface EnhancedAccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (id: string) => void
  showActions?: boolean
}

export default function EnhancedAccountCard({
  account,
  onEdit,
  onDelete,
  showActions = true,
}: EnhancedAccountCardProps) {
  const [isSwiped, setIsSwiped] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const Icon = account.type === 'BANK' ? Building2 : account.type === 'CREDIT_CARD' ? CreditCard : Wallet
  const goalProgress = calculateGoalProgress(account)
  const creditMetrics = account.type === 'CREDIT_CARD' ? calculateCreditMetrics(account) : null

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: TouchEvent) => {
    if (touchStartX.current === null || !showActions) return
    const currentX = e.targetTouches[0].clientX
    const diff = currentX - touchStartX.current
    
    if (diff < 0) {
      const translateX = Math.max(diff, -140)
      const element = document.getElementById(`enhanced-account-${account.id}`)
      if (element) {
        element.style.transform = `translateX(${translateX}px)`
      }
    } else if (isSwiped && diff > 0) {
      const translateX = Math.min(-130 + diff, 0)
      const element = document.getElementById(`enhanced-account-${account.id}`)
      if (element) {
        element.style.transform = `translateX(${translateX}px)`
      }
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || !showActions) return
    const currentX = e.changedTouches[0].clientX
    const diff = currentX - touchStartX.current
    
    const element = document.getElementById(`enhanced-account-${account.id}`)
    
    if (diff < -40) {
      setIsSwiped(true)
      if (element) element.style.transform = `translateX(-130px)`
    } else {
      setIsSwiped(false)
      if (element) element.style.transform = `translateX(0px)`
    }
    
    touchStartX.current = null
  }

  return (
    <div className="relative overflow-hidden">
      {/* Action Buttons Layer */}
      {showActions && (
        <div className="absolute inset-y-0 right-0 w-[130px] flex items-center justify-end gap-2 pr-2">
          <button
            onClick={() => onEdit(account)}
            className="w-[60px] h-[calc(100%-8px)] bg-[#4A6FA5] rounded-xl flex items-center justify-center text-white shadow-sm active:scale-95 transition-all"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="w-[60px] h-[calc(100%-8px)] bg-red-500 rounded-xl flex items-center justify-center text-white shadow-sm active:scale-95 transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}

      {/* Main Card */}
      <div 
        id={`enhanced-account-${account.id}`}
        className="relative z-10 bg-white rounded-xl border border-[#E6C288]/30 hover:border-[#E6C288] transition-all duration-200 ease-out overflow-hidden"
        style={{ transform: isSwiped ? 'translateX(-130px)' : 'translateX(0px)' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Icon and Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Account Icon */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: account.color || '#4A3B32' }}
              >
                <Icon size={24} strokeWidth={2} />
              </div>

              {/* Account Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#4A3B32] truncate mb-1">
                  {account.name}
                </p>

                {/* Type Badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 bg-[#4A3B32]/10 text-[#4A3B32] rounded-full font-medium">
                    {account.type === 'E-WALLET' ? 'E-Wallet' : account.type === 'CREDIT_CARD' ? 'Credit Card' : 'Bank'}
                  </span>
                </div>

                {/* Description */}
                {account.description && (
                  <p className="text-xs text-[#4A3B32]/60 line-clamp-1 mt-1">
                    {account.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Balance or Credit Info */}
            {account.type === 'CREDIT_CARD' ? (
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-[#C74444]">
                  ₱{(account.creditUsed || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#4A3B32]/60">
                  of ₱{(account.creditLimit || 0).toLocaleString('en-PH')}
                </p>
              </div>
            ) : (
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-[#4A3B32]">
                  ₱{account.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>

          {/* Goal Progress Section */}
          {goalProgress && (
            <div className="mt-3 pt-3 border-t border-[#E6C288]/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Target size={12} style={{ color: getGoalStatusColor(goalProgress.percentage) }} />
                  <span className="text-[10px] font-semibold text-[#4A3B32]/70">
                    Goal: ₱{account.goalAmount?.toLocaleString('en-PH')}
                  </span>
                </div>
                <span 
                  className="text-xs font-bold"
                  style={{ color: getGoalStatusColor(goalProgress.percentage) }}
                >
                  {goalProgress.percentage}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#E6C288]/20 rounded-full overflow-hidden mb-1.5">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${goalProgress.percentage}%`,
                    backgroundColor: getGoalStatusColor(goalProgress.percentage)
                  }}
                />
              </div>
              
              {/* Motivational Message */}
              <p className="text-[10px] text-[#4A3B32]/60 text-center">
                {getGoalMotivationalMessage(goalProgress)}
              </p>
            </div>
          )}

          {/* Credit Card Details Section */}
          {creditMetrics && (
            <div className="mt-3 pt-3 border-t border-[#E6C288]/20 space-y-2">
              {/* Utilization */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#4A3B32]/60">Utilization</span>
                  <span 
                    className="text-xs font-bold"
                    style={{ color: getUtilizationColor(creditMetrics.utilization) }}
                  >
                    {creditMetrics.utilization}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E6C288]/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${creditMetrics.utilization}%`,
                      backgroundColor: getUtilizationColor(creditMetrics.utilization)
                    }}
                  />
                </div>
              </div>
              
              {/* Available Credit */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#4A3B32]/60">Available</span>
                <span className="text-xs font-semibold text-[#4A7C59]">
                  ₱{creditMetrics.availableCredit.toLocaleString('en-PH')}
                </span>
              </div>
              
              {/* Due Date */}
              {account.paymentDueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#4A3B32]/60">Payment Due</span>
                  <span className="text-xs font-semibold text-[#4A3B32]">
                    {creditMetrics.daysUntilDue} {creditMetrics.daysUntilDue === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}
              
              {/* Rewards */}
              {account.rewardsBalance && account.rewardsBalance > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#4A3B32]/60">
                    {account.rewardsType === 'CASHBACK' ? 'Cashback' : 
                     account.rewardsType === 'POINTS' ? 'Points' : 'Miles'}
                  </span>
                  <span className="text-xs font-semibold text-[#E6C288]">
                    {account.rewardsType === 'CASHBACK' ? '₱' : ''}
                    {account.rewardsBalance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



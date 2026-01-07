"use client"

import { useState } from "react"
import { X, Building2, Wallet, CreditCard, Trash2 } from "lucide-react"
import { Account, AccountType, RewardsType } from "@/types"
import ColorPicker from "./ColorPicker"
import { Button } from "./ui/button"

interface AccountDetailsModalProps {
  account: Account
  onClose: () => void
  onUpdate: (updates: {
    name?: string
    type?: AccountType
    description?: string
    color?: string
    goalEnabled?: boolean
    goalAmount?: number | null
    goalDeadline?: Date | null
    creditLimit?: number | null
    creditUsed?: number | null
    statementDate?: number | null
    paymentDueDate?: number | null
    minimumPayment?: number | null
    interestRate?: number | null
    rewardsType?: RewardsType
    rewardsBalance?: number | null
    rewardsRate?: number | null
  }) => Promise<void>
  onDelete: () => Promise<void>
}

export default function AccountDetailsModal({
  account,
  onClose,
  onUpdate,
  onDelete,
}: AccountDetailsModalProps) {
  const [name, setName] = useState(account.name)
  const [type, setType] = useState<AccountType>(account.type as AccountType)
  const [description, setDescription] = useState(account.description || "")
  const [color, setColor] = useState(account.color || "#4A3B32")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Goal state
  const [goalEnabled, setGoalEnabled] = useState(account.goalEnabled)
  const [goalAmount, setGoalAmount] = useState(account.goalAmount?.toString() || '')
  const [goalDeadline, setGoalDeadline] = useState(
    account.goalDeadline ? new Date(account.goalDeadline).toISOString().split('T')[0] : ''
  )
  
  // Credit card state
  const [creditLimit, setCreditLimit] = useState(account.creditLimit?.toString() || '')
  const [creditUsed, setCreditUsed] = useState(account.creditUsed?.toString() || '')
  const [statementDate, setStatementDate] = useState(account.statementDate?.toString() || '')
  const [paymentDueDate, setPaymentDueDate] = useState(account.paymentDueDate?.toString() || '')
  const [minimumPayment, setMinimumPayment] = useState(account.minimumPayment?.toString() || '')
  const [interestRate, setInterestRate] = useState(account.interestRate?.toString() || '')
  const [rewardsType, setRewardsType] = useState<RewardsType>(account.rewardsType)
  const [rewardsBalance, setRewardsBalance] = useState(account.rewardsBalance?.toString() || '')
  const [rewardsRate, setRewardsRate] = useState(account.rewardsRate?.toString() || '')
  
  // Swipe to close states
  const [swipeStartY, setSwipeStartY] = useState<number | null>(null)
  const [swipeCurrentY, setSwipeCurrentY] = useState<number | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onUpdate({
        name,
        type,
        description: description || undefined,
        color,
        goalEnabled,
        goalAmount: goalEnabled && goalAmount ? parseFloat(goalAmount) : null,
        goalDeadline: goalEnabled && goalDeadline ? new Date(goalDeadline) : null,
        creditLimit: type === 'CREDIT_CARD' && creditLimit ? parseFloat(creditLimit) : null,
        creditUsed: type === 'CREDIT_CARD' && creditUsed ? parseFloat(creditUsed) : null,
        statementDate: type === 'CREDIT_CARD' && statementDate ? parseInt(statementDate) : null,
        paymentDueDate: type === 'CREDIT_CARD' && paymentDueDate ? parseInt(paymentDueDate) : null,
        minimumPayment: type === 'CREDIT_CARD' && minimumPayment ? parseFloat(minimumPayment) : null,
        interestRate: type === 'CREDIT_CARD' && interestRate ? parseFloat(interestRate) : null,
        rewardsType: type === 'CREDIT_CARD' ? rewardsType : null,
        rewardsBalance: type === 'CREDIT_CARD' && rewardsBalance ? parseFloat(rewardsBalance) : null,
        rewardsRate: type === 'CREDIT_CARD' && rewardsRate ? parseFloat(rewardsRate) : null,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update account:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      console.error('Failed to delete account:', error)
      setIsSubmitting(false)
    }
  }

  // Swipe handlers for modal
  const handleModalTouchStart = (e: React.TouchEvent) => {
    setSwipeStartY(e.touches[0].clientY)
    setSwipeCurrentY(e.touches[0].clientY)
  }

  const handleModalTouchMove = (e: React.TouchEvent) => {
    if (swipeStartY === null) return
    setSwipeCurrentY(e.touches[0].clientY)
  }

  const handleModalTouchEnd = () => {
    if (swipeStartY === null || swipeCurrentY === null) return
    
    const swipeDistance = swipeCurrentY - swipeStartY
    
    // If swiped down more than 100px, close modal
    if (swipeDistance > 100) {
      onClose()
    }
    
    setSwipeStartY(null)
    setSwipeCurrentY(null)
  }

  return (
    <div 
      style={{ zIndex: 100 }}
      className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#FDF6EC] w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleModalTouchStart}
        onTouchMove={handleModalTouchMove}
        onTouchEnd={handleModalTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#4A3B32]/10 shrink-0">
          <h3 className="text-xl font-bold text-[#4A3B32]">Edit Account</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#4A3B32]/10 rounded-full transition-colors"
          >
            <X size={20} className="text-[#4A3B32]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 scrollbar-hide">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Account Name */}
            <div>
              <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                Account Name
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BPI Savings"
                className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all placeholder:text-[#4A3B32]/30"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType("BANK")}
                  className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    type === "BANK"
                      ? "bg-[#4A3B32] text-white border-[#4A3B32]"
                      : "bg-white text-[#4A3B32] border-[#E6C288]/30 hover:border-[#E6C288]"
                  }`}
                >
                  <Building2 size={18} />
                  <span className="font-semibold text-sm">Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("E-WALLET")}
                  className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    type === "E-WALLET"
                      ? "bg-[#4A3B32] text-white border-[#4A3B32]"
                      : "bg-white text-[#4A3B32] border-[#E6C288]/30 hover:border-[#E6C288]"
                  }`}
                >
                  <Wallet size={18} />
                  <span className="font-semibold text-sm">E-Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("CREDIT_CARD")}
                  className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    type === "CREDIT_CARD"
                      ? "bg-[#4A3B32] text-white border-[#4A3B32]"
                      : "bg-white text-[#4A3B32] border-[#E6C288]/30 hover:border-[#E6C288]"
                  }`}
                >
                  <CreditCard size={18} />
                  <span className="font-semibold text-sm">Credit</span>
                </button>
              </div>
            </div>

            {/* Color Picker */}
            <ColorPicker
              selectedColor={color}
              onSelectColor={setColor}
            />

            {/* Credit Card Fields */}
            {type === 'CREDIT_CARD' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                      Credit Limit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold text-sm">₱</span>
                      <input
                        type="number"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(e.target.value)}
                        placeholder="50000"
                        className="w-full bg-white rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                      Current Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold text-sm">₱</span>
                      <input
                        type="number"
                        value={creditUsed}
                        onChange={(e) => setCreditUsed(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                      Statement Date (Day)
                    </label>
                    <input
                      type="number"
                      value={statementDate}
                      onChange={(e) => setStatementDate(e.target.value)}
                      placeholder="1-31"
                      min="1"
                      max="31"
                      className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                      Payment Due (Day)
                    </label>
                    <input
                      type="number"
                      value={paymentDueDate}
                      onChange={(e) => setPaymentDueDate(e.target.value)}
                      placeholder="1-31"
                      min="1"
                      max="31"
                      className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                      Minimum Payment
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold text-sm">₱</span>
                      <input
                        type="number"
                        value={minimumPayment}
                        onChange={(e) => setMinimumPayment(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                    />
                  </div>
                </div>
                
                {/* Rewards Section */}
                <div className="pt-2 border-t border-[#E6C288]/20">
                  <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-2 block">
                    Rewards Program
                  </label>
                  <div className="space-y-2">
                    <select
                      value={rewardsType || ''}
                      onChange={(e) => setRewardsType(e.target.value as RewardsType || null)}
                      className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                    >
                      <option value="">None</option>
                      <option value="CASHBACK">Cashback</option>
                      <option value="POINTS">Points</option>
                      <option value="MILES">Miles</option>
                    </select>
                    
                    {rewardsType && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-[#4A3B32]/70 ml-1 mb-1 block">
                            {rewardsType === 'CASHBACK' ? 'Cashback Rate (%)' : 
                             rewardsType === 'POINTS' ? 'Points Rate' : 'Miles Rate'}
                          </label>
                          <input
                            type="number"
                            value={rewardsRate}
                            onChange={(e) => setRewardsRate(e.target.value)}
                            placeholder="1.5"
                            step="0.1"
                            className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[#4A3B32]/70 ml-1 mb-1 block">
                            Current Balance
                          </label>
                          <div className="relative">
                            {rewardsType === 'CASHBACK' && (
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold text-sm">₱</span>
                            )}
                            <input
                              type="number"
                              value={rewardsBalance}
                              onChange={(e) => setRewardsBalance(e.target.value)}
                              placeholder="0"
                              className={`w-full bg-white rounded-xl ${rewardsType === 'CASHBACK' ? 'pl-8' : 'pl-3'} pr-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Goal Section */}
            <div>
              <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                Savings Goal (Optional)
              </label>
              
              {/* Enable Goal Toggle */}
              <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E6C288]/30 cursor-pointer hover:border-[#E6C288] transition-colors">
                <input
                  type="checkbox"
                  checked={goalEnabled}
                  onChange={(e) => setGoalEnabled(e.target.checked)}
                  className="w-5 h-5 text-[#4A3B32] rounded focus:ring-2 focus:ring-[#E6C288]"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#4A3B32]">Enable Savings Goal</p>
                  <p className="text-xs text-[#4A3B32]/60">Track progress toward a target amount</p>
                </div>
              </label>
              
              {/* Goal Details (shown when enabled) */}
              {goalEnabled && (
                <div className="mt-3 space-y-3 animate-fade-in">
                  {/* Target Amount */}
                  <div>
                    <label className="text-xs font-medium text-[#4A3B32]/70 ml-1 mb-1 block">
                      Target Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold">₱</span>
                      <input
                        type="number"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(e.target.value)}
                        placeholder="10000"
                        step="100"
                        min="0"
                        className="w-full bg-white rounded-xl pl-8 pr-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Deadline (Optional) */}
                  <div>
                    <label className="text-xs font-medium text-[#4A3B32]/70 ml-1 mb-1 block">
                      Target Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                    />
                  </div>
                  
                  {/* Current Progress Preview */}
                  {goalAmount && parseFloat(goalAmount) > 0 && (
                    <div className="p-3 bg-[#E6C288]/10 rounded-xl">
                      <p className="text-xs text-[#4A3B32]/70 mb-1">Current Progress</p>
                      <p className="text-lg font-bold text-[#4A3B32]">
                        ₱{account.balance.toLocaleString('en-PH')} / ₱{parseFloat(goalAmount).toLocaleString('en-PH')}
                      </p>
                      <p className="text-xs text-[#4A3B32]/60 mt-1">
                        {Math.min(100, Math.round((account.balance / parseFloat(goalAmount)) * 100))}% complete
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this account..."
                maxLength={200}
                rows={3}
                className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all placeholder:text-[#4A3B32]/30 resize-none"
              />
              <p className="text-xs text-[#4A3B32]/40 mt-1 text-right">
                {description.length}/200
              </p>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 pt-4 pb-6 border-t border-[#4A3B32]/10 space-y-3 shrink-0">
          {/* Delete Button */}
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-full text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-center text-[#4A3B32]/70">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-full text-[#4A3B32] font-semibold hover:bg-[#4A3B32]/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Save/Cancel Buttons */}
          {!showDeleteConfirm && (
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full text-[#4A3B32] font-semibold hover:bg-[#4A3B32]/5 transition-colors"
              >
                Cancel
              </button>
              <Button 
                type="button"
                onClick={handleSave}
                disabled={!name || isSubmitting}
                className="flex-1 bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white rounded-full py-6 font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


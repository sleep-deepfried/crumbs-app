'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addTransaction } from '@/app/actions/transactions'
import { getCurrentUser } from '@/app/actions/user'
import { TransactionCategory } from '@/types'
import { CATEGORY_LABELS } from '@/lib/constants'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

export default function AddTransactionPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<TransactionCategory>('WANTS')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get current user
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const result = await addTransaction(
        user.id,
        parseFloat(amount),
        category,
        description || undefined
      )

      if (result.success) {
        router.push('/')
      } else {
        setError(result.error || 'Failed to add transaction')
        setLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header */}
      <div className="bg-[#4A3B32] text-white px-4 py-3 flex items-center gap-4">
        <Link href="/" className="btn-touch flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>
        <h1 className="text-xl font-bold">Add Transaction</h1>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="card-crumbs">
            <label className="block text-sm font-semibold text-[#4A3B32] mb-3">
              Amount (₱)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-[#4A3B32]/40">
                ₱
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                step="0.01"
                min="0"
                required
                className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-[#4A3B32] bg-[#FDF6EC] rounded-lg border-2 border-[#E6C288] focus:border-[#4A3B32] focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="card-crumbs">
            <label className="block text-sm font-semibold text-[#4A3B32] mb-3">
              Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['NEEDS', 'WANTS', 'SAVINGS', 'INCOME'] as TransactionCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`btn-touch py-4 rounded-xl font-semibold transition-all ${
                    category === cat
                      ? 'bg-[#4A3B32] text-white shadow-lg scale-105'
                      : 'bg-[#FDF6EC] text-[#4A3B32] border-2 border-[#E6C288] hover:border-[#4A3B32]'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {cat === 'NEEDS' && '🏠'}
                    {cat === 'WANTS' && '🎮'}
                    {cat === 'SAVINGS' && '💰'}
                    {cat === 'INCOME' && '💵'}
                  </div>
                  <div className="text-sm">
                    {CATEGORY_LABELS[cat].split(' ')[1]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description (Optional) */}
          <div className="card-crumbs">
            <label className="block text-sm font-semibold text-[#4A3B32] mb-3">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Lunch at cafe"
              maxLength={100}
              className="w-full px-4 py-3 text-[#4A3B32] bg-[#FDF6EC] rounded-lg border-2 border-[#E6C288] focus:border-[#4A3B32] focus:outline-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#D9534F]/10 border border-[#D9534F] text-[#D9534F] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A3B32] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#4A3B32]/90 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-touch shadow-lg"
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>

          {/* Info Text */}
          <p className="text-xs text-center text-[#4A3B32]/60">
            {category === 'SAVINGS' && '💡 Savings will increase your total saved and upgrade BREW!'}
            {category === 'INCOME' && '💡 Income helps balance your budget'}
            {category === 'NEEDS' && '💡 Essential expenses count toward your spending limit'}
            {category === 'WANTS' && '💡 Non-essential spending counts toward your limit'}
          </p>
        </form>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}


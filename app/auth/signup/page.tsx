'use client'

import { signup } from '@/app/actions/auth'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC] px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#4A3B32] mb-2">CRUMBS</h1>
          <p className="text-sm text-[#4A3B32]/70">Track Your Daily Bread</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#E6C288]">
          <h2 className="text-2xl font-semibold text-[#4A3B32] mb-6">Create Account</h2>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#4A3B32] mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#E6C288] focus:border-[#4A3B32] focus:outline-none text-[#4A3B32] bg-[#FDF6EC]"
                placeholder="crumbsmaster"
              />
              <p className="text-xs text-[#4A3B32]/60 mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#4A3B32] mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-[#E6C288] focus:border-[#4A3B32] focus:outline-none text-[#4A3B32] bg-[#FDF6EC]"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#4A3B32] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#E6C288] focus:border-[#4A3B32] focus:outline-none text-[#4A3B32] bg-[#FDF6EC]"
                placeholder="••••••••"
              />
              <p className="text-xs text-[#4A3B32]/60 mt-1">
                At least 8 characters
              </p>
            </div>

            {error && (
              <div className="bg-[#D9534F]/10 border border-[#D9534F] text-[#D9534F] px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A3B32] text-white py-3 rounded-lg font-semibold hover:bg-[#4A3B32]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#4A3B32]/70">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#4A3B32] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


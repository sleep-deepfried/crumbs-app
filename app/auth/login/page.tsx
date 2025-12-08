'use client'

import { login } from '@/app/actions/auth'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC] px-4">
      <div className="w-full max-w-sm">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#4A3B32] mb-2">CRUMBS</h1>
          <p className="text-sm text-[#4A3B32]/70">Track Your Daily Bread</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#E6C288]">
          <h2 className="text-2xl font-semibold text-[#4A3B32] mb-6">Welcome Back</h2>

          <form action={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-lg border-2 border-[#E6C288] focus:border-[#4A3B32] focus:outline-none text-[#4A3B32] bg-[#FDF6EC]"
                placeholder="••••••••"
              />
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#4A3B32]/70">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-[#4A3B32] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


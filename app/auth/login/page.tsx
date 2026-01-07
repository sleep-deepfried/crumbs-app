"use client";

import { signInWithEmail, signInWithGoogle } from "@/app/actions/auth";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  async function handleEmailSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const emailValue = formData.get("email") as string;
    setEmail(emailValue);
    
    const result = await signInWithEmail(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setEmailSent(true);
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    await signInWithGoogle();
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#E6C288]/30 text-center">
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-2xl font-bold text-[#4A3B32] mb-4">
              Check your email
            </h2>
            <p className="text-[#4A3B32]/70 mb-6">
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-[#4A3B32]/60 mb-6">
              Click the link in the email to sign in. The link will expire in 1 hour.
            </p>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="text-[#4A3B32] font-semibold hover:underline"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC] px-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#4A3B32] mb-2">CRUMBS</h1>
          <p className="text-sm text-[#4A3B32]/70">Track Your Daily Bread</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#E6C288]/30">
          <h2 className="text-2xl font-semibold text-[#4A3B32] mb-8 text-center">
            Welcome Back
          </h2>

          {/* Google Sign In */}
          <form action={handleGoogleSignIn}>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white border-2 border-[#E6C288] text-[#4A3B32] py-3.5 rounded-xl font-semibold hover:bg-[#FDF6EC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E6C288]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#4A3B32]/60 font-medium">
                OR
              </span>
            </div>
          </div>

          {/* Email Sign In */}
          <form action={handleEmailSubmit} className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-xl border-2 border-[#E6C288] focus:border-[#4A3B32] focus:outline-none text-[#4A3B32] bg-[#FDF6EC] placeholder:text-[#4A3B32]/40"
                placeholder="Enter your email"
              />
            </div>

            {error && (
              <div className="bg-[#D9534F]/10 border border-[#D9534F] text-[#D9534F] px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FDF6EC] border-2 border-[#E6C288] text-[#4A3B32] py-3.5 rounded-xl font-semibold hover:bg-[#E6C288]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending link..." : "Continue with email"}
            </button>
          </form>

          <p className="text-xs text-[#4A3B32]/50 mt-6 text-center">
            By continuing, you acknowledge CRUMBS&apos; Privacy Policy.
          </p>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#4A3B32]/70">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-[#4A3B32] font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

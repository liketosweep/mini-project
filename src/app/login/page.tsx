'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validators/auth'
import { createClient } from '@/lib/supabase/client'
import { Flame, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginInput) {
    setAuthError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setAuthError(error.message)
        return
      }

      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setAuthError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-sand-50 dark:bg-brand-950">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500 text-white shadow">
            <Flame className="h-7 w-7 fill-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome to Habit Arena
          </h1>
          <p className="text-sm text-zinc-600 dark:text-sand-400">
            Sign in to track your habits and enter challenge rooms.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8 shadow-sm dark:border-brand-800 dark:bg-brand-900">
          {authError && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                placeholder="you@example.com"
                {...register('email')}
                className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
              />
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
                placeholder="��������"
                {...register('password')}
                className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
              />
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 py-2.5 px-4 text-sm font-semibold text-white shadow hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center text-xs text-zinc-500 dark:text-sand-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

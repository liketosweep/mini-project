'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupInput } from '@/lib/validators/auth'
import { createClient } from '@/lib/supabase/client'
import { Flame, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      username: '',
      display_name: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: SignupInput) {
    setAuthError(null)
    setSuccessMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username.toLowerCase(),
            display_name: values.display_name,
          },
        },
      })

      if (error) {
        setAuthError(error.message)
        return
      }

      if (data.session) {
        // Immediate session granted
        router.push('/dashboard')
        router.refresh()
      } else if (data.user) {
        // Confirmation email required
        setSuccessMessage(
          'Registration successful! Please check your email for a confirmation link, or proceed to sign in.'
        )
      }
    } catch (err) {
      console.error('Signup error:', err)
      setAuthError('An unexpected error occurred during signup. Please try again.')
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
            Create Your Account
          </h1>
          <p className="text-sm text-zinc-600 dark:text-sand-400">
            Join Habit Arena and start building lasting habits with peers.
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

          {successMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
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
                className="w-full rounded-lg border border-sand-300 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
              />
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="display_name"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
              >
                Display Name
              </label>
              <input
                id="display_name"
                type="text"
                disabled={isSubmitting}
                placeholder="e.g. Alex Morgan"
                {...register('display_name')}
                className="w-full rounded-lg border border-sand-300 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
              />
              {errors.display_name && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.display_name.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm text-zinc-400">@</span>
                <input
                  id="username"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="alex_m"
                  {...register('username')}
                  className="w-full rounded-lg border border-sand-300 pl-8 pr-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.username.message}</p>
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
                autoComplete="new-password"
                disabled={isSubmitting}
                placeholder="��������"
                {...register('password')}
                className="w-full rounded-lg border border-sand-300 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
              />
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                placeholder="��������"
                {...register('confirmPassword')}
                className="w-full rounded-lg border border-sand-300 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center text-xs text-zinc-500 dark:text-sand-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

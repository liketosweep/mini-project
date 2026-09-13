import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Flame, Shield, Trophy, Users, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-brand-950 flex flex-col justify-between">
      {/* Navbar Header */}
      <header className="w-full border-b border-sand-200 bg-white dark:border-brand-800 dark:bg-brand-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500 text-white shadow-sm">
              <Flame className="h-5 w-5 fill-white" />
            </span>
            <span>Habit Arena</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-brand-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gold-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-300 mb-6">
          <Shield className="h-3.5 w-3.5" />
          <span>College Mini-Project • Accountability & Challenges</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-2xl">
          Build lasting habits with friendly accountability.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-sand-400 max-w-xl">
          Track daily solo streaks and challenge your peers in private, invite-only rooms with live leaderboards and virtual reward pools.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-md justify-center">
          <Link
            href="/signup"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
          >
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-sand-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-sand-50 dark:border-brand-700 dark:bg-brand-800 dark:text-sand-200 dark:hover:bg-gold-600 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* 3 Core Highlights */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
          <div className="rounded-xl border border-sand-200 bg-white p-5 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              <Flame className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-white">Solo Streaks</h2>
            <p className="text-xs text-zinc-500 dark:text-sand-400 leading-relaxed">
              Log daily self-reported check-ins with notes and watch personal streaks grow.
            </p>
          </div>

          <div className="rounded-xl border border-sand-200 bg-white p-5 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-white">Private Rooms</h2>
            <p className="text-xs text-zinc-500 dark:text-sand-400 leading-relaxed">
              Invite-only challenge rooms with deadlines and real-time live leaderboards.
            </p>
          </div>

          <div className="rounded-xl border border-sand-200 bg-white p-5 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-100 text-gold-600 dark:bg-gold-950/50 dark:text-gold-400">
              <Trophy className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-white">Virtual Rewards</h2>
            <p className="text-xs text-zinc-500 dark:text-sand-400 leading-relaxed">
              Zero real money, no crypto. Compete for virtual bragging points and locked standings.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sand-200 bg-white py-6 text-center text-xs text-zinc-500 dark:border-brand-800 dark:bg-brand-900">
        <p>Habit Arena • College Mini-Project • Next.js 16 + Supabase</p>
      </footer>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database.types'
import { LogOut, Trophy, User, LayoutDashboard, Flame, Swords } from 'lucide-react'

interface NavbarProps {
  profile: Profile | null
}

export function Navbar({ profile }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = createClient()

  async function handleLogout() {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Failed to log out:', err)
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg tracking-tight text-zinc-900 dark:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Flame className="h-5 w-5 fill-white" />
            </span>
            <span>Habit Arena</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/habits"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                pathname.startsWith('/habits')
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Solo Habits</span>
            </Link>
            <Link
              href="/rooms"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                pathname.startsWith('/rooms')
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Swords className="h-4 w-4 text-indigo-500" />
              <span>Challenges</span>
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/profile'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </nav>
        </div>

        {/* Right user & points pill */}
        <div className="flex items-center gap-3">
          {profile && (
            <div
              title="Virtual reward points earned from winning challenge rooms"
              className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{profile.virtual_points} pts</span>
            </div>
          )}

          {profile ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hidden sm:flex flex-col text-right text-xs"
              >
                <span className="font-semibold text-zinc-900 dark:text-white truncate max-w-[120px]">
                  {profile.display_name}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">
                  @{profile.username}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Log out"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav bar */}
      <div className="flex md:hidden border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 justify-around bg-zinc-50 dark:bg-zinc-900 text-xs font-medium">
        <Link
          href="/dashboard"
          className={`flex items-center gap-1 py-1 px-3 rounded ${
            pathname === '/dashboard' ? 'text-indigo-600 font-bold' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href="/habits"
          className={`flex items-center gap-1 py-1 px-3 rounded ${
            pathname.startsWith('/habits') ? 'text-indigo-600 font-bold' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <Flame className="h-4 w-4" />
          Habits
        </Link>
        <Link
          href="/rooms"
          className={`flex items-center gap-1 py-1 px-3 rounded ${
            pathname.startsWith('/rooms') ? 'text-indigo-600 font-bold' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <Swords className="h-4 w-4" />
          Challenges
        </Link>
        <Link
          href="/profile"
          className={`flex items-center gap-1 py-1 px-3 rounded ${
            pathname === '/profile' ? 'text-indigo-600 font-bold' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
      </div>
    </header>
  )
}

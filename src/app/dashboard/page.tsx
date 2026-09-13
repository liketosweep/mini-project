import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { formatLocalDate, isTodayCompleted, calculateActiveStreak } from '@/lib/streak'
import {
  Trophy,
  User,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Swords,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Fetch Active Habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  // 3. Fetch Challenge Rooms (RLS automatically scopes to user's rooms)
  const { data: rooms, error: roomsErr } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  if (roomsErr) {
    console.error('[dashboard] Failed to fetch rooms:', roomsErr.code, roomsErr.message)
  }

  const userRooms = rooms || []

  const activeHabits = habits || []
  const todayStr = formatLocalDate()

  // 3. Count today completed
  const completedTodayCount = activeHabits.filter((h) =>
    isTodayCompleted(h.last_completed_date, todayStr)
  ).length

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-brand-950 flex flex-col">
      <Navbar profile={profile} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8 shadow-sm dark:border-brand-800 dark:bg-brand-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Authenticated Session
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Welcome, {profile?.display_name || 'Arena Warrior'}!
              </h1>
              <p className="text-sm text-zinc-600 dark:text-sand-400">
                Logged in as <span className="font-mono text-xs">@{profile?.username || 'user'}</span> ({user.email})
              </p>
            </div>

            {/* Virtual Reward Points Card */}
            <div className="rounded-xl border border-gold-200 bg-gold-50/70 p-4 dark:border-gold-900/50 dark:bg-gold-950/30 sm:min-w-[200px]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-800 dark:text-gold-300">
                <Trophy className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                <span>Virtual Reward Points</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-gold-900 dark:text-gold-200">
                  {profile?.virtual_points ?? 0}
                </span>
                <span className="text-xs font-medium text-gold-700 dark:text-gold-400">pts</span>
              </div>
              <p className="mt-1 text-[11px] text-gold-700/80 dark:text-gold-400/70">
                Earned from winning challenge rooms. Free virtual rewards only.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Your Habits */}
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 dark:border-brand-800 pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Your Solo Habits
                </h2>
                {activeHabits.length > 0 && (
                  <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-brand-800 dark:text-sand-300">
                    {completedTodayCount} of {activeHabits.length} Done Today
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-sand-400">
                Self-reported daily progress and personal streaks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/habits"
                className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 px-2.5 py-1.5 rounded-lg hover:bg-sand-50 dark:hover:bg-brand-800 transition-colors"
              >
                View All Habits &rarr;
              </Link>
            </div>
          </div>

          {activeHabits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sand-200 p-8 text-center dark:border-brand-800 space-y-3">
              <Sparkles className="h-7 w-7 text-brand-600 mx-auto" />
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  No habits set up yet
                </h3>
                <p className="text-xs text-zinc-500 dark:text-sand-400">
                  Create your first solo habit to start tracking daily check-ins and streaks.
                </p>
              </div>
              <Link
                href="/habits"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Go to Habits</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeHabits.slice(0, 6).map((habit) => {
                const doneToday = isTodayCompleted(habit.last_completed_date, todayStr)
                const streak = calculateActiveStreak(habit.last_completed_date, habit.current_streak, todayStr)

                return (
                  <Link
                    key={habit.id}
                    href={`/habits/${habit.id}`}
                    className="group rounded-xl border border-sand-200 bg-sand-50/60 p-4 transition-all hover:bg-white hover:border-sand-300 hover:shadow-sm dark:border-brand-800 dark:bg-brand-800/40 dark:hover:bg-brand-800 dark:hover:border-brand-700 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-sand-200/80 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-brand-700 dark:text-sand-300">
                          {habit.category || 'General'}
                        </span>
                        {doneToday ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-600 dark:text-gold-400">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-zinc-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                        {habit.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-1">
                        <Flame
                          className={`h-4 w-4 ${streak > 0
                            ? 'text-orange-500 fill-orange-500'
                            : 'text-zinc-400'
                            }`}
                        />
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {streak} day streak
                        </span>
                      </div>
                      <span className="text-zinc-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 font-semibold flex items-center gap-0.5">
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Section: Challenge Arenas */}
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 dark:border-brand-800 pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Challenge Arenas
                </h2>
                {userRooms.length > 0 && (
                  <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-brand-800 dark:text-sand-300">
                    {userRooms.length} Active / Joined
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-sand-400">
                Private multiplayer habit battles with friendly virtual stakes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/rooms"
                className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 px-2.5 py-1.5 rounded-lg hover:bg-sand-50 dark:hover:bg-brand-800 transition-colors"
              >
                View All Arenas &rarr;
              </Link>
            </div>
          </div>

          {userRooms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sand-200 p-8 text-center dark:border-brand-800 space-y-3">
              <Swords className="h-7 w-7 text-brand-600 mx-auto" />
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  No challenge rooms yet
                </h3>
                <p className="text-xs text-zinc-500 dark:text-sand-400">
                  Create a private challenge to compete with friends, or join one with an invite code.
                </p>
              </div>
              <Link
                href="/rooms"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Go to Challenges</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="group rounded-xl border border-sand-200 bg-sand-50/60 p-4 transition-all hover:bg-white hover:border-sand-300 hover:shadow-sm dark:border-brand-800 dark:bg-brand-800/40 dark:hover:bg-brand-800 dark:hover:border-brand-700 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-sand-200/80 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-brand-700 dark:text-sand-300 capitalize">
                        {room.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-700 dark:text-gold-400">
                        <Trophy className="h-3 w-3" /> {room.points_pool} pts pool
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                      {room.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-sand-400 line-clamp-1">
                      Goal: {room.habit_title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-zinc-400">
                      {room.start_date} to {room.end_date}
                    </span>
                    <span className="text-zinc-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 font-semibold flex items-center gap-0.5">
                      Enter <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Profile Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <User className="h-4 w-4 text-brand-600" /> Profile Summary
              </h2>
              <Link
                href="/profile"
                className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
              >
                Edit Profile &rarr;
              </Link>
            </div>

            <div className="divide-y divide-sand-100 dark:divide-brand-800 text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-zinc-500 dark:text-sand-400">Display Name</span>
                <span className="font-medium text-zinc-900 dark:text-white">{profile?.display_name || '—'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-zinc-500 dark:text-sand-400">Username</span>
                <span className="font-mono text-zinc-900 dark:text-white">@{profile?.username || '—'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-zinc-500 dark:text-sand-400">Account Email</span>
                <span className="font-medium text-zinc-900 dark:text-white">{user.email}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-zinc-500 dark:text-sand-400">Earned Rewards</span>
                <span className="font-semibold text-gold-700 dark:text-gold-400">{profile?.virtual_points ?? 0} pts</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-sand-300 bg-white/50 p-6 shadow-sm dark:border-brand-800 dark:bg-brand-900/50 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" /> Habit Arena Rules
              </h2>
              <p className="text-sm text-zinc-600 dark:text-sand-400 leading-relaxed">
                1 successful check-in = 1 completion point. Check in once per day to keep your consecutive personal streaks burning!
              </p>
            </div>

            <div className="rounded-lg bg-sand-100 dark:bg-brand-800/80 p-3.5 text-xs text-zinc-600 dark:text-sand-400 flex items-center gap-3">
              <Flame className="h-5 w-5 text-brand-600 shrink-0" />
              <span>
                Unlimited virtual points model enabled. No balance deduction and no insufficient-balance errors.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

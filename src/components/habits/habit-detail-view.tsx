'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Habit, HabitLog } from '@/types/database.types'
import { isTodayCompleted, calculateActiveStreak, formatLocalDate } from '@/lib/streak'
import { CheckInModal } from './check-in-modal'
import { createClient } from '@/lib/supabase/client'
import {
  Flame,
  Trophy,
  CheckCircle2,
  Clock,
  Edit3,
  Archive,
  ArrowLeft,
  Tag,
  Calendar,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface HabitDetailViewProps {
  habit: Habit
  initialLogs: HabitLog[]
}

export function HabitDetailView({
  habit,
  initialLogs,
}: HabitDetailViewProps) {
  const router = useRouter()
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const supabase = createClient()

  const todayStr = formatLocalDate()
  const completedToday = logs.some((l) => l.check_in_date === todayStr) || isTodayCompleted(habit.last_completed_date)
  const activeStreak = calculateActiveStreak(habit.last_completed_date, habit.current_streak)
  const totalPoints = logs.length

  async function handleCheckInSuccess() {
    // Re-fetch latest logs and habit data
    const { data: updatedLogs } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habit.id)
      .order('check_in_date', { ascending: false })

    if (updatedLogs) {
      setLogs(updatedLogs)
    }
    router.refresh()
  }

  async function handleArchive() {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${habit.title}"? Your check-in history will remain preserved.`
    )
    if (!confirmed) return

    try {
      setIsArchiving(true)
      const { error } = await supabase
        .from('habits')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', habit.id)

      if (error) {
        alert(`Failed to archive: ${error.message}`)
        setIsArchiving(false)
        return
      }

      router.push('/habits')
      router.refresh()
    } catch (err) {
      console.error('Archive error:', err)
      setIsArchiving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button & Actions Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/habits"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Habits</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/habits/${habit.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
          >
            {isArchiving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
            <span>Archive</span>
          </button>
        </div>
      </div>

      {/* Main Habit Header Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Tag className="h-3 w-3" />
                {habit.category || 'General'}
              </span>

              {completedToday ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Today Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Pending for Today
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {habit.title}
            </h1>

            {habit.description ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {habit.description}
              </p>
            ) : (
              <p className="text-xs italic text-zinc-400">
                No description provided.
              </p>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="sm:min-w-[180px]">
            {completedToday ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <span className="mt-1 block font-bold text-xs text-emerald-800 dark:text-emerald-200">
                  Completed for Today!
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Great job keeping your streak alive.
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCheckInOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Mark Done Today</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Stat Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Current Streak
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <Flame
                className={`h-5 w-5 ${
                  activeStreak > 0
                    ? 'text-orange-500 fill-orange-500'
                    : 'text-zinc-400'
                }`}
              />
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {activeStreak}
              </span>
              <span className="text-xs text-zinc-500">days</span>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Longest Streak
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {habit.longest_streak}
              </span>
              <span className="text-xs text-zinc-500">days</span>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Points
            </span>
            <div className="mt-1 flex items-center justify-center gap-1">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {totalPoints}
              </span>
              <span className="text-xs text-zinc-500">pts</span>
            </div>
            <span className="text-[10px] text-zinc-400">1 check-in = 1 pt</span>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Last Completed
            </span>
            <div className="mt-1.5 flex items-center justify-center gap-1 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
              <Calendar className="h-4 w-4 text-zinc-400" />
              <span>{habit.last_completed_date || 'Never'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Check-In History */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span>Check-in History ({logs.length})</span>
          </h2>
          <span className="text-xs text-zinc-500">
            Self-reported completion records
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800 space-y-2">
            <Sparkles className="h-7 w-7 text-zinc-400 mx-auto" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No check-ins logged yet.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tap &quot;Mark Done Today&quot; to log your first check-in and start your streak.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
            {logs.map((log) => (
              <div
                key={log.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                        {log.check_in_date}
                      </span>
                      <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        DONE (+1 pt)
                      </span>
                    </div>
                    {log.note && (
                      <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-400 mt-0.5" />
                        <span>{log.note}</span>
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-zinc-400 self-end sm:self-auto">
                  {new Date(log.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <CheckInModal
        habitId={habit.id}
        habitTitle={habit.title}
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSuccess={handleCheckInSuccess}
      />
    </div>
  )
}

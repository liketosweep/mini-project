'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Habit } from '@/types/database.types'
import { isTodayCompleted, calculateActiveStreak } from '@/lib/streak'
import { createClient } from '@/lib/supabase/client'
import { CheckInModal } from './check-in-modal'
import {
  Flame,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Archive,
  Edit3,
  Tag,
  Loader2,
} from 'lucide-react'

interface HabitCardProps {
  habit: Habit
  totalPoints: number
  onArchived?: () => void
  onCheckInSuccess?: () => void
}

export function HabitCard({
  habit,
  totalPoints,
  onArchived,
  onCheckInSuccess,
}: HabitCardProps) {
  const router = useRouter()
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const supabase = createClient()

  const completedToday = isTodayCompleted(habit.last_completed_date)
  const activeStreak = calculateActiveStreak(
    habit.last_completed_date,
    habit.current_streak
  )

  async function handleArchive() {
    const confirmed = window.confirm(
      `Archive "${habit.title}"? You can view historical check-in logs later from the archive view.`
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

      if (onArchived) {
        onArchived()
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error('Archive error:', err)
      setIsArchiving(false)
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Tag className="h-3 w-3 text-zinc-500" />
                {habit.category || 'General'}
              </span>

              {completedToday ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Done Today
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
                  <Clock className="h-3.5 w-3.5" />
                  Pending Today
                </span>
              )}
            </div>

            {/* Edit / Archive Actions */}
            <div className="flex items-center gap-1">
              <Link
                href={`/habits/${habit.id}/edit`}
                title="Edit habit"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleArchive}
                disabled={isArchiving}
                title="Archive habit"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
              >
                {isArchiving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Link href={`/habits/${habit.id}`} className="group block">
            <h3 className="font-bold text-base text-zinc-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
              {habit.title}
            </h3>
            {habit.description && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {habit.description}
              </p>
            )}
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800/60">
          <div>
            <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Current
            </span>
            <div className="mt-0.5 flex items-center justify-center gap-1">
              <Flame
                className={`h-4 w-4 ${
                  activeStreak > 0
                    ? 'text-orange-500 fill-orange-500'
                    : 'text-zinc-400'
                }`}
              />
              <span className="font-bold text-sm text-zinc-900 dark:text-white">
                {activeStreak}
              </span>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Longest
            </span>
            <div className="mt-0.5 flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="font-bold text-sm text-zinc-900 dark:text-white">
                {habit.longest_streak}
              </span>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Points
            </span>
            <span className="mt-0.5 block font-bold text-sm text-indigo-600 dark:text-indigo-400">
              {totalPoints} pts
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {completedToday ? (
            <button
              type="button"
              disabled
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 py-2.5 px-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 cursor-default"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Completed Today</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCheckInOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 px-3 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark Done</span>
            </button>
          )}

          <Link
            href={`/habits/${habit.id}`}
            className="flex items-center justify-center rounded-xl border border-zinc-200 p-2.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
            title="View details & logs"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <CheckInModal
        habitId={habit.id}
        habitTitle={habit.title}
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSuccess={() => {
          if (onCheckInSuccess) {
            onCheckInSuccess()
          } else {
            router.refresh()
          }
        }}
      />
    </>
  )
}

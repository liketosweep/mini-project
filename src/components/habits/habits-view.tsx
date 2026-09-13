'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Habit } from '@/types/database.types'
import { HabitCard } from './habit-card'
import { CreateHabitModal } from './create-habit-modal'
import { createClient } from '@/lib/supabase/client'
import { Plus, Flame, Archive, RefreshCw, Sparkles, Inbox } from 'lucide-react'

interface HabitsViewProps {
  initialHabits: Habit[]
  logCounts: Record<string, number>
  userId: string
}

export function HabitsView({
  initialHabits,
  logCounts,
  userId,
}: HabitsViewProps) {
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClient()

  const activeHabits = habits.filter((h) => !h.is_archived)
  const archivedHabits = habits.filter((h) => h.is_archived)

  async function refreshHabits() {
    setIsRefreshing(true)
    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setHabits(data)
    }
    setIsRefreshing(false)
    router.refresh()
  }

  async function handleUnarchive(habitId: string) {
    const { error } = await supabase
      .from('habits')
      .update({ is_archived: false, updated_at: new Date().toISOString() })
      .eq('id', habitId)

    if (error) {
      alert(`Failed to unarchive: ${error.message}`)
      return
    }

    refreshHabits()
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-brand-600" />
            <span>Solo Habits</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-sand-400">
            Self-reported daily habits with streak progression and completion points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshHabits}
            disabled={isRefreshing}
            className="flex items-center gap-1 rounded-xl border border-sand-200 p-2.5 text-zinc-600 hover:bg-sand-100 hover:text-zinc-900 dark:border-brand-800 dark:text-sand-400 dark:hover:bg-brand-800 dark:hover:text-white disabled:opacity-50 transition-colors"
            title="Refresh habits"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Habit</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sand-200 dark:border-brand-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'active'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-sand-400 dark:hover:text-white'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Active Habits ({activeHabits.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('archived')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'archived'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-sand-400 dark:hover:text-white'
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          <span>Archived ({archivedHabits.length})</span>
        </button>
      </div>

      {/* Active Habits List */}
      {activeTab === 'active' && (
        <>
          {activeHabits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sand-300 bg-white p-12 text-center shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  No Active Habits Yet
                </h3>
                <p className="text-xs text-zinc-500 dark:text-sand-400">
                  Track routines, study schedules, or fitness goals. Build your streak day by day.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Habit</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  totalPoints={logCounts[habit.id] ?? 0}
                  onArchived={refreshHabits}
                  onCheckInSuccess={refreshHabits}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Archived Habits List */}
      {activeTab === 'archived' && (
        <>
          {archivedHabits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sand-300 bg-white p-12 text-center shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-2">
              <Inbox className="h-8 w-8 text-zinc-400 mx-auto" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                No Archived Habits
              </h3>
              <p className="text-xs text-zinc-500 dark:text-sand-400">
                Archived habits will be stored here with their historical check-in records.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {archivedHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="rounded-2xl border border-sand-200 bg-sand-50/70 p-5 shadow-sm dark:border-brand-800 dark:bg-brand-900/50 flex flex-col justify-between space-y-4 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 rounded bg-sand-200 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-brand-800 dark:text-sand-300">
                      Archived
                    </span>
                    <h3 className="font-bold text-base text-zinc-800 dark:text-sand-200">
                      {habit.title}
                    </h3>
                    {habit.description && (
                      <p className="text-xs text-zinc-500 dark:text-sand-400 line-clamp-2">
                        {habit.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-sand-200 dark:border-brand-800">
                    <span className="text-xs text-zinc-500">
                      Total Points: {logCounts[habit.id] ?? 0} pts
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUnarchive(habit.id)}
                      className="rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-sand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-sand-200 dark:hover:bg-gold-600 transition-colors"
                    >
                      Unarchive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <CreateHabitModal
        userId={userId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newHabit) => {
          setHabits([newHabit, ...habits])
          router.refresh()
        }}
      />
    </div>
  )
}

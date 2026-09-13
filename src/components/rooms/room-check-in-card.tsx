'use client'

import { useState } from 'react'
import type { Room } from '@/types/database.types'
import { formatLocalDate } from '@/lib/streak'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle2,
  Flame,
  Clock,
  AlertCircle,
  Calendar,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Loader2,
} from 'lucide-react'

export interface RoomLogItem {
  id: string
  room_id: string
  user_id: string
  check_in_date: string
  note: string | null
  created_at: string
  profiles?: {
    username: string
    display_name: string
  } | null
}

interface RoomCheckInCardProps {
  roomId: string
  room: Room
  isParticipant: boolean
  isTodayCheckedIn: boolean
  todayLog: RoomLogItem | null
  onCheckInSuccess: (newLog: RoomLogItem, newPoints: number) => void
  currentUserProfile: {
    display_name: string
    username: string
  } | null
}

export function RoomCheckInCard({
  roomId,
  room,
  isParticipant,
  isTodayCheckedIn,
  todayLog,
  onCheckInSuccess,
  currentUserProfile,
}: RoomCheckInCardProps) {
  const supabase = createClient()
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const todayStr = formatLocalDate()

  // Format today's date nicely: e.g. "Saturday, Sep 12, 2026"
  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Determine eligibility
  let eligibilityReason: string | null = null
  let isEligible = true

  if (!isParticipant) {
    isEligible = false
    eligibilityReason = 'You are not enrolled as an active participant in this challenge.'
  } else if (room.status === 'cancelled') {
    isEligible = false
    eligibilityReason = 'This challenge room has been cancelled.'
  } else if (room.status === 'completed') {
    isEligible = false
    eligibilityReason = 'This challenge has ended and standings are final.'
  } else if (todayStr < room.start_date) {
    isEligible = false
    eligibilityReason = `Challenge has not started yet. Daily check-ins will unlock on ${room.start_date}.`
  } else if (todayStr > room.end_date) {
    isEligible = false
    eligibilityReason = `Challenge ended on ${room.end_date}. Daily check-ins are closed.`
  }

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault()
    if (!isEligible || isTodayCheckedIn || isSubmitting) return

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccessMsg(null)

      const trimmedNote = note.trim() || null

      const { data, error: rpcErr } = await supabase.rpc('check_in_room', {
        p_room_id: roomId,
        p_check_in_date: todayStr,
        p_note: trimmedNote,
      })

      if (rpcErr) {
        setError(rpcErr.message || 'Failed to submit daily check-in.')
        setIsSubmitting(false)
        return
      }

      const result = data as { points?: number; check_in_date?: string } | null
      const newPoints = result?.points ?? 1

      const createdLog: RoomLogItem = {
        id: crypto.randomUUID(),
        room_id: roomId,
        user_id: '',
        check_in_date: todayStr,
        note: trimmedNote,
        created_at: new Date().toISOString(),
        profiles: currentUserProfile
          ? {
              username: currentUserProfile.username,
              display_name: currentUserProfile.display_name,
            }
          : null,
      }

      setSuccessMsg('+1 point added to your leaderboard score!')
      onCheckInSuccess(createdLog, newPoints)
      setIsSubmitting(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(msg)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 dark:border-brand-800 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Daily Challenge Check-In
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-sand-400">
            {formattedToday} &bull; 1 check-in = 1 leaderboard point
          </p>
        </div>

        <div>
          {isTodayCheckedIn ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Done Today (+1 pt)
            </span>
          ) : isEligible ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-800 border border-gold-200 dark:bg-gold-950/40 dark:border-gold-900 dark:text-gold-300">
              <Clock className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
              Pending Today&apos;s Goal
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-brand-800 dark:text-sand-400">
              Check-In Inactive
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Case 1: Not Eligible (dates or lifecycle) */}
      {!isEligible ? (
        <div className="rounded-xl border border-dashed border-sand-200 bg-sand-50/70 p-4 text-center dark:border-brand-800 dark:bg-brand-800/30 space-y-1.5">
          <ShieldAlert className="h-5 w-5 text-zinc-400 mx-auto" />
          <p className="text-xs font-medium text-zinc-700 dark:text-sand-300">
            {eligibilityReason}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-sand-400">
            Challenge window: {room.start_date} to {room.end_date}.
          </p>
        </div>
      ) : isTodayCheckedIn ? (
        /* Case 2: Already Checked In Today */
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-950/50 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>You have completed today&apos;s challenge check-in!</span>
          </div>

          <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
            Your +1 point is locked onto the live arena leaderboard. Return tomorrow to maintain your consecutive check-in streak.
          </p>

          {todayLog?.note && (
            <div className="rounded-lg bg-white/80 dark:bg-brand-900/80 p-3 border border-emerald-100 dark:border-emerald-900/40 text-xs text-zinc-700 dark:text-sand-300 flex items-start gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="italic">&ldquo;{todayLog.note}&rdquo;</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/80 px-4 py-2 text-xs font-semibold text-white shadow-sm cursor-not-allowed opacity-90"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Completed for Today</span>
            </button>
          </div>
        </div>
      ) : (
        /* Case 3: Eligible and Ready for Today's Check-in */
        <form onSubmit={handleCheckIn} className="space-y-4">
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3.5 dark:border-orange-950/40 dark:bg-orange-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500 fill-orange-500 shrink-0" />
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Goal: {room.habit_title}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400">
              +1 pt
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="room_checkin_note"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Reflection Note (Optional)</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                {note.length}/280
              </span>
            </div>

            <textarea
              id="room_checkin_note"
              rows={2}
              maxLength={280}
              disabled={isSubmitting}
              placeholder="e.g. Crushed 30 mins workout today, solved 2 hard DP problems..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-sand-300 px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Recording Check-In...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark Done (+1 Point)</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

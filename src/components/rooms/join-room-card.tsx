'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { RoomPreview } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'
import {
  Swords,
  Flame,
  Trophy,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'

interface JoinRoomCardProps {
  preview: RoomPreview
  inviteCode: string
  isAlreadyJoined: boolean
}

export function JoinRoomCard({ preview, inviteCode, isAlreadyJoined }: JoinRoomCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    try {
      setIsJoining(true)
      setError(null)

      const { data: joinedRoomId, error: joinErr } = await supabase.rpc(
        'join_challenge_room',
        {
          p_invite_code: inviteCode,
        }
      )

      if (joinErr) {
        setError(joinErr.message || 'Failed to join challenge room.')
        setIsJoining(false)
        return
      }

      // Successful join -> navigate to room detail
      const targetId = joinedRoomId || preview.room_id
      router.push(`/rooms/${targetId}`)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while joining.'
      setError(msg)
      setIsJoining(false)
    }
  }

  const deadlineDate = new Date(preview.acceptance_deadline).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            <Swords className="h-3.5 w-3.5" />
            Private Challenge Invite
          </span>

          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {inviteCode}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {preview.name}
        </h1>

        {preview.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {preview.description}
          </p>
        )}
      </div>

      {/* Shared Habit Goal Card */}
      <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 dark:border-orange-950/40 dark:bg-orange-950/20 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300">
          <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
          <span>Shared Daily Goal</span>
        </div>
        <p className="text-base font-bold text-zinc-900 dark:text-white">
          {preview.habit_title}
        </p>
        <p className="text-xs text-orange-700/80 dark:text-orange-400/80">
          Every participant self-reports 1 check-in per calendar day = 1 point.
        </p>
      </div>

      {/* Challenge Spec Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Entry Stake & Pool */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
            <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Virtual Entry Stake</span>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {preview.entry_points} pts
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Free virtual points pool. Zero balance deduction.
          </p>
        </div>

        {/* Participants count */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
            <Users className="h-3.5 w-3.5 text-zinc-500" />
            <span>Current Participants</span>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {preview.participant_count} {preview.participant_count === 1 ? 'warrior' : 'warriors'}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Private roster visible once you join.
          </p>
        </div>

        {/* Challenge Period */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
            <span>Challenge Period</span>
          </div>
          <p className="font-semibold text-zinc-900 dark:text-white">
            {preview.start_date} to {preview.end_date}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Daily check-ins count during this window.
          </p>
        </div>

        {/* Join Deadline */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span>Acceptance Deadline</span>
          </div>
          <p className="font-semibold text-zinc-900 dark:text-white">
            {deadlineDate}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Joining closes when the deadline arrives.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* State-dependent Action Buttons */}
      <div className="pt-2">
        {isAlreadyJoined ? (
          /* Already joined */
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>You are already participating in this challenge arena!</span>
            </div>
            <Link
              href={`/rooms/${preview.room_id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <span>Enter Arena</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : preview.is_deadline_passed ? (
          /* Deadline passed */
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>The acceptance deadline for this challenge room has passed.</span>
            </div>
            <Link
              href="/rooms"
              className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Back to Challenges
            </Link>
          </div>
        ) : (
          /* Ready to join */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              href="/rooms"
              className="w-full sm:w-auto text-center rounded-xl border border-zinc-300 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              <Swords className="h-4 w-4" />
              <span>{isJoining ? 'Joining Challenge...' : 'Join Challenge Room'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

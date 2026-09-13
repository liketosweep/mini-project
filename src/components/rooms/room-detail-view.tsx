'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Room } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'
import { formatLocalDate, computeStreaksFromLogs } from '@/lib/streak'
import { InviteShareCard } from './invite-share-card'
import { RoomCheckInCard, type RoomLogItem } from './room-check-in-card'
import { LiveLeaderboard, type LeaderboardParticipant } from './live-leaderboard'
import { RoomRecentLogs } from './room-recent-logs'
import type { ParticipantItem } from './participant-roster'
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Trophy,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react'

interface RoomDetailViewProps {
  room: Room
  initialParticipants: ParticipantItem[]
  initialLogs: RoomLogItem[]
  currentUserId: string
  currentUserProfile: {
    username: string
    display_name: string
  } | null
}

export function RoomDetailView({
  room,
  initialParticipants,
  initialLogs,
  currentUserId,
  currentUserProfile,
}: RoomDetailViewProps) {
  const [participants, setParticipants] = useState<ParticipantItem[]>(initialParticipants)
  const [logs, setLogs] = useState<RoomLogItem[]>(initialLogs)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  const participantsRef = useRef(participants)
  useEffect(() => {
    participantsRef.current = participants
  }, [participants])

  const isCreator = room.creator_id === currentUserId
  const isParticipant = participants.some((p) => p.user_id === currentUserId)
  const todayStr = formatLocalDate()

  // Realtime subscription scoped strictly to this room
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as { id: string; user_id: string; points: number }
            setParticipants((prev) =>
              prev.map((p) => {
                if (p.id === updated.id || p.user_id === updated.user_id) {
                  return { ...p, points: updated.points }
                }
                return p
              })
            )
          } else if (payload.eventType === 'INSERT') {
            const inserted = payload.new as {
              id: string
              user_id: string
              points: number
              joined_at: string
            }
            setParticipants((prev) => {
              if (prev.some((p) => p.user_id === inserted.user_id || p.id === inserted.id)) {
                return prev
              }
              return [
                ...prev,
                {
                  id: inserted.id,
                  user_id: inserted.user_id,
                  points: inserted.points ?? 0,
                  final_rank: null,
                  payout_received: 0,
                  joined_at: inserted.joined_at || new Date().toISOString(),
                  profiles: null,
                },
              ]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_logs',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          const newLog = payload.new as RoomLogItem
          setLogs((prev) => {
            // Avoid duplicate log if already in state
            if (
              prev.some(
                (l) =>
                  l.id === newLog.id ||
                  (l.user_id === newLog.user_id && l.check_in_date === newLog.check_in_date)
              )
            ) {
              return prev
            }

            // Find matching profile from participants ref
            const matchingParticipant = participantsRef.current.find((p) => p.user_id === newLog.user_id)
            const enriched: RoomLogItem = {
              ...newLog,
              profiles: matchingParticipant?.profiles
                ? {
                    username: matchingParticipant.profiles.username,
                    display_name: matchingParticipant.profiles.display_name,
                  }
                : null,
            }
            return [enriched, ...prev]
          })
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room.id])

  // Handle local check-in submission
  function handleCheckInSuccess(newLog: RoomLogItem, newPoints: number) {
    const logWithUser: RoomLogItem = {
      ...newLog,
      user_id: currentUserId,
    }

    setLogs((prev) => [
      logWithUser,
      ...prev.filter((l) => !(l.user_id === currentUserId && l.check_in_date === todayStr)),
    ])

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.user_id === currentUserId) {
          return { ...p, points: newPoints }
        }
        return p
      })
    )
  }

  // Current user's today check-in status
  const myLogs = logs.filter((l) => l.user_id === currentUserId)
  const isTodayCheckedIn = myLogs.some((l) => l.check_in_date === todayStr)
  const todayLog = myLogs.find((l) => l.check_in_date === todayStr) || null

  // Compute live leaderboard data with streaks
  const leaderboardData: LeaderboardParticipant[] = participants.map((p) => {
    const userLogs = logs.filter((l) => l.user_id === p.user_id)
    const dates = userLogs.map((l) => l.check_in_date)
    const streakInfo = computeStreaksFromLogs(dates, todayStr)

    return {
      id: p.id,
      user_id: p.user_id,
      points: p.points,
      joined_at: p.joined_at,
      currentStreak: streakInfo.currentStreak,
      isDoneToday: streakInfo.isCompletedToday,
      profiles: p.profiles,
    }
  })

  const statusBadge = () => {
    switch (room.status) {
      case 'recruiting':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
            <Clock className="h-3.5 w-3.5" />
            Recruiting Phase
          </span>
        )
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
            <Flame className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
            Active Arena
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
            <Trophy className="h-3.5 w-3.5" />
            Completed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {room.status}
          </span>
        )
    }
  }

  const deadlineDate = new Date(room.acceptance_deadline).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Challenges</span>
          </Link>
        </div>

        {/* Challenge Header Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {statusBadge()}
              {isCreator && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  You are Host
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Invite Code:</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                {room.invite_code}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {room.name}
            </h1>
            {room.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl">
                {room.description}
              </p>
            )}
          </div>

          {/* Shared Goal Card */}
          <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-950/40 dark:bg-orange-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 shrink-0">
                <Flame className="h-5 w-5 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                  Daily Challenge Goal
                </span>
                <p className="text-base font-bold text-zinc-900 dark:text-white">
                  {room.habit_title}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-orange-800 dark:text-orange-300">
              1 check-in per day = 1 point
            </span>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Reward Pool */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Reward Pool</span>
              </div>
              <p className="text-xl font-extrabold text-amber-900 dark:text-amber-200">
                {room.points_pool} <span className="text-xs font-normal">pts</span>
              </p>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                Virtual points pool
              </p>
            </div>

            {/* Entry Stake */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30 space-y-0.5">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Entry Stake
              </span>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">
                {room.entry_points} <span className="text-xs font-normal">pts</span>
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                No balance deducted
              </p>
            </div>

            {/* Dates */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30 space-y-0.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                <span>Active Period</span>
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                {room.start_date}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                to {room.end_date}
              </p>
            </div>

            {/* Deadline */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30 space-y-0.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span>Join Deadline</span>
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                {deadlineDate}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Recruitment cutoff
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Completed Banner */}
      {room.status === 'completed' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 shrink-0">
              <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Challenge Concluded
              </span>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                Official Standings &amp; Virtual Rewards are finalized!
              </p>
            </div>
          </div>
          <Link
            href={`/rooms/${room.id}/results`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 transition-colors shrink-0"
          >
            <span>View Final Results</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Challenge Ended Banner (Ready to finalize) */}
      {todayStr > room.end_date && room.status !== 'completed' && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shrink-0">
              <Trophy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                Challenge Period Ended
              </span>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                Ready to finalize standings and distribute virtual rewards.
              </p>
            </div>
          </div>
          <Link
            href={`/rooms/${room.id}/results`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors shrink-0"
          >
            <span>Finalize &amp; View Results</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Share Invite Link (If recruiting) */}
      {room.status === 'recruiting' && (
        <InviteShareCard
          inviteCode={room.invite_code}
          acceptanceDeadline={room.acceptance_deadline}
        />
      )}

      {/* Daily Room Check-In Action Card */}
      <RoomCheckInCard
        roomId={room.id}
        room={room}
        isParticipant={isParticipant}
        isTodayCheckedIn={isTodayCheckedIn}
        todayLog={todayLog}
        onCheckInSuccess={handleCheckInSuccess}
        currentUserProfile={currentUserProfile}
      />

      {/* Live Arena Leaderboard */}
      <LiveLeaderboard
        participants={leaderboardData}
        creatorId={room.creator_id}
        currentUserId={currentUserId}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Recent Arena Check-In Feed */}
      <RoomRecentLogs
        logs={logs}
        currentUserId={currentUserId}
      />
    </div>
  )
}

'use client'

import { Trophy, ShieldCheck, Flame, CheckCircle2, Clock, Radio } from 'lucide-react'

export interface LeaderboardParticipant {
  id: string
  user_id: string
  points: number
  joined_at: string
  currentStreak: number
  isDoneToday: boolean
  profiles: {
    username: string
    display_name: string
    virtual_points: number
  } | null
}

interface LiveLeaderboardProps {
  participants: LeaderboardParticipant[]
  creatorId: string
  currentUserId: string
  isRealtimeConnected: boolean
}

export function LiveLeaderboard({
  participants,
  creatorId,
  currentUserId,
  isRealtimeConnected,
}: LiveLeaderboardProps) {
  // Primary sort: points DESC. Tie-breaker: joined_at ASC (earlier join time wins tie)
  const sorted = [...participants].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points
    }
    return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
  })

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Live Arena Leaderboard
            </h2>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {participants.length} Warriors
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Realtime scoring &bull; 1 successful check-in = 1 point
          </p>
        </div>

        {/* Realtime Live Indicator */}
        <div className="flex items-center gap-2">
          {isRealtimeConnected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Realtime</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <Radio className="h-3 w-3 text-zinc-400" />
              <span>Connecting...</span>
            </span>
          )}
        </div>
      </div>

      {/* Leaderboard Table / Roster */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {sorted.map((p, index) => {
          const rank = index + 1
          const isMe = p.user_id === currentUserId
          const isHost = p.user_id === creatorId
          const displayName = p.profiles?.display_name || 'Anonymous Warrior'
          const username = p.profiles?.username || 'user'

          // Podium styling
          const rankBadge = () => {
            if (rank === 1) {
              return (
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 font-extrabold text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300 shadow-sm border border-amber-200 dark:border-amber-900">
                  🥇 1
                </span>
              )
            }
            if (rank === 2) {
              return (
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 font-extrabold text-xs text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  🥈 2
                </span>
              )
            }
            if (rank === 3) {
              return (
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-100 font-extrabold text-xs text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                  🥉 3
                </span>
              )
            }
            return (
              <span className="flex h-7 w-7 items-center justify-center rounded-xl font-bold text-xs text-zinc-500 dark:text-zinc-400">
                #{rank}
              </span>
            )
          }

          return (
            <div
              key={p.id}
              className={`py-3.5 px-3 flex items-center justify-between gap-3 transition-colors ${
                isMe
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-600 rounded-r-xl'
                  : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 rounded-xl'
              }`}
            >
              {/* Left: Rank & User Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">{rankBadge()}</div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {displayName}
                    </span>
                    {isHost && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.2 rounded">
                        <ShieldCheck className="h-3 w-3" /> Host
                      </span>
                    )}
                    {isMe && (
                      <span className="inline-flex text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    @{username}
                  </p>
                </div>
              </div>

              {/* Right: Today's Status, Streak, and Points */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                {/* Today Status Pill */}
                <div className="hidden sm:flex items-center">
                  {p.isDoneToday ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                </div>

                {/* Streak Badge */}
                <div className="flex items-center gap-1 text-xs">
                  <Flame
                    className={`h-3.5 w-3.5 ${
                      p.currentStreak > 0
                        ? 'text-orange-500 fill-orange-500'
                        : 'text-zinc-300 dark:text-zinc-600'
                    }`}
                  />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {p.currentStreak > 0 ? `${p.currentStreak}d` : '—'}
                  </span>
                </div>

                {/* Score / Points */}
                <div className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-white min-w-[70px] justify-center">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <span>{p.points} {p.points === 1 ? 'pt' : 'pts'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tie-break note */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
        <span>Deterministic tie-breaker: earlier challenge join time.</span>
        <span>Points: 1 check-in = 1 pt</span>
      </div>
    </div>
  )
}

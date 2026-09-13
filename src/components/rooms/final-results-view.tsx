'use client'

import Link from 'next/link'
import type { Room } from '@/types/database.types'
import type { ParticipantItem } from './participant-roster'
import {
  Trophy,
  ArrowLeft,
  ShieldCheck,
  Flame,
  Award,
  Sparkles,
  Info,
} from 'lucide-react'

interface FinalResultsViewProps {
  room: Room
  participants: ParticipantItem[]
  currentUserId: string
  totalCheckIns: number
}

export function FinalResultsView({
  room,
  participants,
  currentUserId,
  totalCheckIns,
}: FinalResultsViewProps) {
  // Sort participants by final_rank ASC, then points DESC, then joined_at ASC
  const sorted = [...participants].sort((a, b) => {
    if (a.final_rank != null && b.final_rank != null) {
      return a.final_rank - b.final_rank
    }
    if (b.points !== a.points) {
      return b.points - a.points
    }
    return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
  })

  const myEntry = participants.find((p) => p.user_id === currentUserId)
  const myRank = myEntry?.final_rank ?? null
  const myPayout = myEntry?.payout_received ?? 0
  const myPoints = myEntry?.points ?? 0

  const top1 = sorted[0] || null
  const top2 = sorted[1] || null
  const top3 = sorted[2] || null

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div>
        <Link
          href={`/rooms/${room.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-sand-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Challenge Arena</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1 text-xs font-bold text-gold-700 border border-gold-200 dark:bg-gold-950/40 dark:border-gold-900 dark:text-gold-300">
              <Trophy className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
              Final Standings & Rewards
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-brand-800 dark:text-sand-300">
              Completed
            </span>
          </div>

          <span className="text-xs text-zinc-500 dark:text-sand-400">
            {room.start_date} to {room.end_date}
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {room.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-sand-400">
            <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />
            <span className="font-semibold">Goal: {room.habit_title}</span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-sand-100 dark:border-brand-800 text-xs">
          <div className="space-y-0.5">
            <span className="text-zinc-500 dark:text-sand-400">Total Reward Pool</span>
            <p className="text-lg font-bold text-gold-700 dark:text-gold-400">
              {room.points_pool} pts
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-zinc-500 dark:text-sand-400">Warriors Enrolled</span>
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {participants.length}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-zinc-500 dark:text-sand-400">Check-Ins Completed</span>
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {totalCheckIns}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-zinc-500 dark:text-sand-400">Entry Stake</span>
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {room.entry_points} pts
            </p>
          </div>
        </div>
      </div>

      {/* Personal Outcome Card */}
      {myEntry && (
        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            myPayout > 0
              ? 'border-gold-200 bg-gold-50/70 dark:border-gold-900/50 dark:bg-gold-950/30'
              : 'border-sand-200 bg-white dark:border-brand-800 dark:bg-brand-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  myPayout > 0
                    ? 'bg-gold-100 text-gold-700 dark:bg-gold-900/50 dark:text-gold-300'
                    : 'bg-sand-100 text-zinc-600 dark:bg-brand-800 dark:text-sand-400'
                }`}
              >
                {myPayout > 0 ? (
                  <Sparkles className="h-6 w-6 text-gold-600 dark:text-gold-400" />
                ) : (
                  <Award className="h-6 w-6" />
                )}
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-sand-400">
                  Your Challenge Outcome
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {myPayout > 0
                    ? `Congratulations! You finished Rank #${myRank}!`
                    : `You completed the challenge at Rank #${myRank || '—'}`}
                </h2>
                <p className="text-xs text-zinc-600 dark:text-sand-400">
                  Final score: <span className="font-bold">{myPoints} check-in {myPoints === 1 ? 'pt' : 'pts'}</span>
                </p>
              </div>
            </div>

            {myPayout > 0 && (
              <div className="rounded-xl border border-gold-200 bg-white/90 px-4 py-3 text-right dark:border-gold-900 dark:bg-brand-900 sm:min-w-[160px]">
                <span className="text-[11px] font-semibold uppercase text-gold-800 dark:text-gold-300">
                  Earned Reward
                </span>
                <p className="text-2xl font-extrabold text-gold-900 dark:text-gold-200">
                  +{myPayout} <span className="text-xs font-normal">pts</span>
                </p>
                <p className="text-[10px] text-gold-700/80 dark:text-gold-400/80">
                  Credited to profile
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Podium Cards (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rank 1: Gold */}
        {top1 && (
          <div className="rounded-2xl border border-gold-300 bg-gradient-to-b from-gold-50/80 to-white p-5 shadow-sm dark:border-gold-800 dark:from-gold-950/40 dark:to-brand-900 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-400/20 text-base shadow-sm">
                👑
              </span>
              <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold text-gold-800 dark:bg-gold-900/60 dark:text-gold-300">
                Champion &bull; #1
              </span>
            </div>

            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
                {top1.profiles?.display_name || 'Anonymous'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-sand-400">
                @{top1.profiles?.username || 'user'}
              </p>
            </div>

            <div className="pt-2 border-t border-gold-200/60 dark:border-gold-900/40 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-sand-300">
                {top1.points} pts score
              </span>
              <span className="font-bold text-gold-800 dark:text-gold-300">
                +{top1.payout_received} pts prize
              </span>
            </div>
          </div>
        )}

        {/* Rank 2: Silver */}
        {top2 && (
          <div className="rounded-2xl border border-slate-300 bg-gradient-to-b from-slate-50/80 to-white p-5 shadow-sm dark:border-brand-700 dark:from-brand-800/40 dark:to-brand-900 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200/60 text-base shadow-sm dark:bg-brand-800">
                🥈
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-brand-800 dark:text-sand-300">
                Runner-Up &bull; #2
              </span>
            </div>

            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
                {top2.profiles?.display_name || 'Anonymous'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-sand-400">
                @{top2.profiles?.username || 'user'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-brand-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-sand-300">
                {top2.points} pts score
              </span>
              <span className="font-bold text-slate-700 dark:text-sand-300">
                +{top2.payout_received} pts prize
              </span>
            </div>
          </div>
        )}

        {/* Rank 3: Bronze */}
        {top3 && (
          <div className="rounded-2xl border border-orange-300 bg-gradient-to-b from-orange-50/80 to-white p-5 shadow-sm dark:border-orange-900/60 dark:from-orange-950/30 dark:to-brand-900 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-400/20 text-base shadow-sm">
                🥉
              </span>
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                3rd Place &bull; #3
              </span>
            </div>

            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
                {top3.profiles?.display_name || 'Anonymous'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-sand-400">
                @{top3.profiles?.username || 'user'}
              </p>
            </div>

            <div className="pt-2 border-t border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-sand-300">
                {top3.points} pts score
              </span>
              <span className="font-bold text-orange-800 dark:text-orange-300">
                +{top3.payout_received} pts prize
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Complete Final Standings Table */}
      <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-4">
        <div className="flex items-center justify-between border-b border-sand-100 dark:border-brand-800 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Official Final Standings
            </h2>
            <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-brand-800 dark:text-sand-300">
              {sorted.length} Warriors
            </span>
          </div>
          <span className="text-xs text-zinc-500 dark:text-sand-400">
            Locked &amp; Finalized
          </span>
        </div>

        <div className="divide-y divide-sand-100 dark:divide-brand-800">
          {sorted.map((p) => {
            const isMe = p.user_id === currentUserId
            const isHost = p.user_id === room.creator_id
            const displayName = p.profiles?.display_name || 'Anonymous'
            const username = p.profiles?.username || 'user'
            const rank = p.final_rank || 1

            return (
              <div
                key={p.id}
                className={`py-3.5 px-3 flex items-center justify-between gap-3 transition-colors ${
                  isMe
                    ? 'bg-brand-50/50 dark:bg-brand-950/20 border-l-4 border-brand-600 rounded-r-xl'
                    : 'rounded-xl'
                }`}
              >
                {/* Left: Rank & Warrior */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono font-extrabold text-xs text-zinc-500 dark:text-sand-400 w-6 text-center shrink-0">
                    #{rank}
                  </span>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand-100 text-xs font-bold text-zinc-700 dark:bg-brand-800 dark:text-sand-300 shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {displayName}
                      </span>
                      {isHost && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-700 bg-brand-100 dark:bg-brand-950 dark:text-brand-300 px-1.5 py-0.2 rounded">
                          <ShieldCheck className="h-3 w-3" /> Host
                        </span>
                      )}
                      {isMe && (
                        <span className="inline-flex text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-sand-400 truncate">
                      @{username}
                    </p>
                  </div>
                </div>

                {/* Right: Score and Reward */}
                <div className="flex items-center gap-4 shrink-0 text-xs">
                  <div className="text-right">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {p.points} {p.points === 1 ? 'pt' : 'pts'}
                    </span>
                    <p className="text-[10px] text-zinc-400">Score</p>
                  </div>

                  <div className="text-right min-w-[70px]">
                    {p.payout_received > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-gold-100 dark:bg-gold-950 px-2 py-1 font-bold text-gold-800 dark:text-gold-300">
                        <Trophy className="h-3 w-3 text-gold-600" />
                        +{p.payout_received} pts
                      </span>
                    ) : (
                      <span className="text-zinc-400 font-mono text-xs">—</span>
                    )}
                    <p className="text-[10px] text-zinc-400">Reward</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payout Policy Explainer */}
      <div className="rounded-xl border border-dashed border-sand-200 bg-sand-50/70 p-4 dark:border-brand-800 dark:bg-brand-800/30 text-xs text-zinc-600 dark:text-sand-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-sand-200">
          <Info className="h-3.5 w-3.5 text-brand-600" />
          <span>V1 Locked Payout Distribution Policy</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          Virtual point reward pool is awarded atomically upon challenge conclusion: 1 participant receives 100% of the pool; 2 participants receive 70% / 30%; 3 or more participants receive 50% / 30% / 20%. Ranks below podium receive 0. Ties are broken deterministically by earlier room join time. No real money or balance deductions are ever involved.
        </p>
      </div>
    </div>
  )
}

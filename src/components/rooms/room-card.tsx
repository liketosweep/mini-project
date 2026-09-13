'use client'

import Link from 'next/link'
import type { Room } from '@/types/database.types'
import {
  Trophy,
  Users,
  Flame,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
} from 'lucide-react'

interface RoomCardProps {
  room: Room
  currentUserId: string
  participantCount?: number
}

export function RoomCard({ room, currentUserId, participantCount = 1 }: RoomCardProps) {
  const isCreator = room.creator_id === currentUserId

  const statusBadge = () => {
    switch (room.status) {
      case 'recruiting':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
            <Clock className="h-3 w-3" />
            Recruiting
          </span>
        )
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
            <Flame className="h-3 w-3 fill-emerald-500 text-emerald-500" />
            Active
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
            <Trophy className="h-3 w-3" />
            Completed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {room.status}
          </span>
        )
    }
  }

  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {statusBadge()}
          <div className="flex items-center gap-1.5">
            {isCreator && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                <ShieldCheck className="h-3 w-3" />
                Host
              </span>
            )}
          </div>
        </div>

        {/* Room Title */}
        <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {room.name}
        </h3>

        {/* Shared Goal */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          <span className="line-clamp-1 font-medium">{room.habit_title}</span>
        </div>

        {room.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {room.description}
          </p>
        )}
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
        {/* Virtual Pool */}
        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
          <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold">{room.points_pool} pts pool</span>
        </div>

        {/* Warriors count */}
        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 justify-end">
          <Users className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span>{participantCount} {participantCount === 1 ? 'warrior' : 'warriors'}</span>
        </div>

        {/* Dates */}
        <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{room.start_date} to {room.end_date}</span>
        </div>
      </div>

      {/* Action CTA */}
      <Link
        href={`/rooms/${room.id}`}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <span>Enter Arena</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

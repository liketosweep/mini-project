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
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-0.5 text-[11px] font-semibold text-gold-700 border border-gold-200 dark:bg-gold-950/40 dark:border-gold-900 dark:text-gold-300">
            <Trophy className="h-3 w-3" />
            Completed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 dark:bg-brand-800 dark:text-sand-300">
            {room.status}
          </span>
        )
    }
  }

  return (
    <div className="group rounded-2xl border border-sand-200 bg-white p-5 shadow-sm transition-all hover:border-sand-300 hover:shadow-md dark:border-brand-800 dark:bg-brand-900 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {statusBadge()}
          <div className="flex items-center gap-1.5">
            {isCreator && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded">
                <ShieldCheck className="h-3 w-3" />
                Host
              </span>
            )}
          </div>
        </div>

        {/* Room Title */}
        <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
          {room.name}
        </h3>

        {/* Shared Goal */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-sand-400">
          <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          <span className="line-clamp-1 font-medium">{room.habit_title}</span>
        </div>

        {room.description && (
          <p className="text-xs text-zinc-500 dark:text-sand-400 line-clamp-2">
            {room.description}
          </p>
        )}
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sand-100 dark:border-brand-800 text-xs">
        {/* Virtual Pool */}
        <div className="flex items-center gap-1.5 text-gold-800 dark:text-gold-300">
          <Trophy className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400 shrink-0" />
          <span className="font-semibold">{room.points_pool} pts pool</span>
        </div>

        {/* Warriors count */}
        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-sand-400 justify-end">
          <Users className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span>{participantCount} {participantCount === 1 ? 'warrior' : 'warriors'}</span>
        </div>

        {/* Dates */}
        <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-sand-400 pt-1">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{room.start_date} to {room.end_date}</span>
        </div>
      </div>

      {/* Action CTA */}
      <Link
        href={`/rooms/${room.id}`}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-sand-200 bg-sand-50 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-sand-100 dark:border-brand-800 dark:bg-brand-800 dark:text-sand-200 dark:hover:bg-gold-600 transition-colors"
      >
        <span>Enter Arena</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
